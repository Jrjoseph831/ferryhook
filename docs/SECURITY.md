# SECURITY.md — Ferryhook Security Implementation

## Authentication

### JWT Token Structure

```typescript
// Access token (1 hour expiry)
{
  sub: "usr_abc123",          // User ID
  email: "user@example.com",
  plan: "starter",
  iat: 1709251200,
  exp: 1709254800,
  iss: "ferryhook",
  aud: "ferryhook-api"
}

// Refresh token (30 day expiry)
{
  sub: "usr_abc123",
  type: "refresh",
  jti: "rtk_xyz789",         // Unique token ID (for revocation)
  iat: 1709251200,
  exp: 1711843200,
  iss: "ferryhook"
}
```

### Token Implementation

- Library: `jose` (platform-agnostic, edge-compatible)
- Algorithm: ES256 (ECDSA with P-256 curve) — shorter tokens than RS256
- Access token: returned in response body, stored in memory (never localStorage)
- Refresh token: httpOnly, secure, SameSite=Strict cookie
- Token rotation: every refresh issues a new refresh token and invalidates the old one

### API Key Authentication

- Format: `fh_live_` + 32 random bytes (base62 encoded)
- Storage: SHA-256 hash stored in DynamoDB, plaintext shown once at creation
- Lookup: hash the provided key, query GSI2 on main table
- Scopes: `read` (view events), `write` (manage sources/connections), `admin` (all operations including billing)
- Rate limited: 100 requests/minute per API key

### Password Hashing

- Algorithm: bcrypt with cost factor 12
- Library: `bcryptjs` (pure JS, works in Lambda without native bindings)

## Data Encryption

### In Transit
- TLS 1.2+ enforced on all endpoints (API Gateway default)
- HSTS header: `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- No HTTP redirect — plaintext requests are rejected, not redirected

### At Rest
- DynamoDB: AWS-managed encryption (AES-256) via KMS — enabled by default
- S3 (if used for large payloads): SSE-S3 (AES-256)
- Redis: in-transit encryption enabled, at-rest encryption enabled

### Sensitive Field Handling
- Signing secrets: encrypted with a per-user key before storage
- API keys: only SHA-256 hash stored, plaintext never persisted
- Passwords: bcrypt hashed, plaintext never logged or stored
- Webhook payloads: stored as-is (we don't parse PII), auto-deleted via TTL

## Webhook Signature Verification (Inbound)

Support for verifying signatures from common providers:

```typescript
// packages/core/src/security/signatures.ts

export const signatureVerifiers = {
  stripe: (payload: string, header: string, secret: string) => {
    // Stripe-Signature: t=timestamp,v1=signature
    const elements = Object.fromEntries(header.split(',').map(e => e.split('=')));
    const signed = `${elements.t}.${payload}`;
    const expected = hmacSha256(signed, secret);
    return timingSafeEqual(expected, elements.v1);
  },

  github: (payload: string, header: string, secret: string) => {
    // X-Hub-Signature-256: sha256=signature
    const expected = 'sha256=' + hmacSha256(payload, secret);
    return timingSafeEqual(expected, header);
  },

  shopify: (payload: string, header: string, secret: string) => {
    // X-Shopify-Hmac-Sha256: base64(hmac)
    const expected = hmacSha256Base64(payload, secret);
    return timingSafeEqual(expected, header);
  },

  // Generic HMAC-SHA256 for custom providers
  generic: (payload: string, header: string, secret: string) => {
    const expected = hmacSha256(payload, secret);
    return timingSafeEqual(expected, header);
  },
};
```

## Webhook Signature Signing (Outbound)

All outbound deliveries include Ferryhook's signature:

```
X-Ferryhook-Event-Id: evt_abc123
X-Ferryhook-Timestamp: 1709251200
X-Ferryhook-Signature: t=1709251200,v1=5257a869e7ecebeda32affa62cdca3fa51cad7e77a0e56ff536d0ce8e108d8bd
```

Signature format follows the Stripe convention for familiarity. Verification docs provided for every major language.

## SSRF Protection

Destination URLs are validated at two points:

1. **Configuration time** — When a user creates/updates a connection, the destination URL is checked against the blocklist. Rejected URLs return a 400 error.
2. **Delivery time** — Before making the HTTP request, the URL is re-validated AND the resolved IP address is checked. This prevents DNS rebinding attacks where a domain resolves to an internal IP at delivery time.

Blocked patterns: loopback (127.x), private (10.x, 172.16-31.x, 192.168.x), link-local (169.254.x), IPv6 equivalents, localhost, .local, .internal.

## Rate Limiting

### Per-Source Rate Limits (Inbound Webhooks)
- Implemented via Redis sliding window counter
- Per-minute granularity
- Excess events return 429 (sender will retry)
- Limits: free=100/min, starter=500/min, pro=2000/min, team=10000/min

### Per-API-Key Rate Limits (Management API)
- 100 requests/minute per API key
- 1000 requests/minute per user (across all keys)
- Excess returns 429 with Retry-After header

### Global Protection
- API Gateway throttling: 10,000 requests/second burst, 5,000 sustained
- Lambda reserved concurrency prevents runaway costs
- SQS acts as a natural buffer — events queue rather than drop

## Security Headers

All API responses include:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 0
Content-Security-Policy: default-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## Audit Logging

All management API actions are logged with:
- User ID
- Action type (create_source, delete_connection, replay_event, etc.)
- Resource ID
- IP address
- Timestamp
- Request summary (no sensitive fields)

Stored in DynamoDB with 1-year retention for paid plans.

## Secrets Management

- Application secrets stored in AWS SSM Parameter Store (SecureString)
- SST binds secrets at deploy time — Lambda env vars are encrypted by default
- Rotation: JWT signing keys rotated quarterly, support for multiple active keys during rotation
- Stripe webhook secret and API keys stored as SST Secrets
