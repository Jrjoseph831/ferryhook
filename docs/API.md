# API.md — Ferryhook REST API Specification

## Base URLs

- **Webhook Ingestion:** `https://hooks.ferryhook.io`
- **Management API:** `https://api.ferryhook.io`

## Authentication

### JWT (Dashboard)
```
Authorization: Bearer eyJhbGciOiJFUzI1NiIs...
```

### API Key (Programmatic)
```
Authorization: Bearer fh_live_a1b2c3d4e5f6g7h8i9j0...
```

Both methods are accepted on all authenticated endpoints.

## Common Response Format

### Success
```json
{
  "data": { ... },
  "meta": {
    "requestId": "req_abc123"
  }
}
```

### Paginated
```json
{
  "data": [ ... ],
  "meta": {
    "requestId": "req_abc123",
    "cursor": "eyJzayI6Ik...",
    "hasMore": true
  }
}
```

### Error
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Destination URL must be HTTPS",
    "details": [
      { "field": "destinationUrl", "message": "Must use HTTPS protocol" }
    ]
  },
  "meta": {
    "requestId": "req_abc123"
  }
}
```

## Error Codes

| Code                  | HTTP | Description                              |
|-----------------------|------|------------------------------------------|
| VALIDATION_ERROR      | 400  | Invalid request body or parameters       |
| UNAUTHORIZED          | 401  | Missing or invalid authentication        |
| FORBIDDEN             | 403  | Insufficient permissions                 |
| NOT_FOUND             | 404  | Resource not found                       |
| RATE_LIMITED          | 429  | Too many requests                        |
| PLAN_LIMIT_REACHED    | 403  | Monthly event limit or source limit hit  |
| INTERNAL_ERROR        | 500  | Unexpected server error                  |

---

## Webhook Ingestion

### Receive Webhook

```
POST https://hooks.ferryhook.io/in/{sourceId}
```

Accepts any content type. Returns 200 immediately after queuing.

**Response (200):**
```json
{
  "id": "evt_a1b2c3d4e5f6g7h8",
  "status": "received"
}
```

**Response (404):** Source not found
**Response (429):** Rate limited

---

## Auth Endpoints

### Sign Up

```
POST /v1/auth/signup
```

```json
{
  "email": "dev@example.com",
  "password": "securepassword123",
  "name": "Jane Developer"
}
```

**Response (201):**
```json
{
  "data": {
    "user": {
      "id": "usr_a1b2c3d4",
      "email": "dev@example.com",
      "name": "Jane Developer",
      "plan": "free"
    },
    "accessToken": "eyJhbG...",
    "expiresIn": 3600
  }
}
```

### Log In

```
POST /v1/auth/login
```

```json
{
  "email": "dev@example.com",
  "password": "securepassword123"
}
```

**Response (200):** Same format as signup.
Sets httpOnly refresh token cookie.

### Refresh Token

```
POST /v1/auth/refresh
```

No body required. Uses the httpOnly refresh token cookie.

**Response (200):**
```json
{
  "data": {
    "accessToken": "eyJhbG...",
    "expiresIn": 3600
  }
}
```

---

## Sources

### Create Source

```
POST /v1/sources
```

```json
{
  "name": "Stripe Production",
  "provider": "stripe",
  "signingSecret": "whsec_...",
  "signingAlgorithm": "stripe"
}
```

`provider` options: `stripe`, `github`, `shopify`, `twilio`, `sendgrid`, `slack`, `custom`
`signingAlgorithm` options: `stripe`, `github`, `shopify`, `generic-hmac-sha256`, `none`

**Response (201):**
```json
{
  "data": {
    "id": "src_a1b2c3d4e5f6g7h8",
    "name": "Stripe Production",
    "provider": "stripe",
    "url": "https://hooks.ferryhook.io/in/src_a1b2c3d4e5f6g7h8",
    "status": "active",
    "eventCount": 0,
    "createdAt": "2026-02-08T12:00:00Z"
  }
}
```

### List Sources

```
GET /v1/sources
```

### Get Source

```
GET /v1/sources/{sourceId}
```

### Update Source

```
PATCH /v1/sources/{sourceId}
```

```json
{
  "name": "Stripe Staging",
  "status": "paused"
}
```

### Delete Source

```
DELETE /v1/sources/{sourceId}
```

---

## Connections

### Create Connection

```
POST /v1/sources/{sourceId}/connections
```

```json
{
  "name": "Main Server",
  "destinationUrl": "https://api.myapp.com/webhooks/stripe",
  "filters": [
    {
      "path": "$.type",
      "operator": "equals",
      "value": "payment_intent.succeeded"
    }
  ],
  "transform": {
    "type": "field_map",
    "rules": [
      { "from": "$.data.object.amount", "to": "amount" },
      { "from": "$.data.object.currency", "to": "currency" },
      { "from": "$.type", "to": "event_type" }
    ]
  }
}
```

**Filter operators:** `equals`, `not_equals`, `contains`, `not_contains`, `exists`, `not_exists`, `regex`, `gt`, `lt`, `gte`, `lte`

**Transform types:** `field_map` (map specific fields), `passthrough` (no changes), `javascript` (Pro+ plans, custom JS function)

### List Connections

```
GET /v1/sources/{sourceId}/connections
```

### Update Connection

```
PATCH /v1/connections/{connectionId}
```

### Delete Connection

```
DELETE /v1/connections/{connectionId}
```

---

## Events

### List Events

```
GET /v1/sources/{sourceId}/events?limit=50&cursor=...&status=delivered
```

Query params:
- `limit` (1-100, default 50)
- `cursor` (pagination cursor from previous response)
- `status` (filter: received, filtered, delivered, retrying, failed)

### Get Event Detail

```
GET /v1/events/{eventId}
```

**Response (200):**
```json
{
  "data": {
    "id": "evt_a1b2c3d4e5f6g7h8",
    "sourceId": "src_x1y2z3",
    "status": "delivered",
    "headers": { "content-type": "application/json", "stripe-signature": "t=..." },
    "body": "{\"type\":\"payment_intent.succeeded\",...}",
    "sourceIp": "54.187.174.169",
    "receivedAt": "2026-02-08T12:00:00.123Z",
    "deliveredAt": "2026-02-08T12:00:00.456Z",
    "attempts": [
      {
        "number": 1,
        "connectionId": "conn_abc",
        "destinationUrl": "https://api.myapp.com/webhooks/stripe",
        "statusCode": 200,
        "latencyMs": 234,
        "attemptedAt": "2026-02-08T12:00:00.400Z"
      }
    ]
  }
}
```

### Replay Event

```
POST /v1/events/{eventId}/replay
```

Optionally specify connections to replay to:
```json
{
  "connectionIds": ["conn_abc"]
}
```

If no connectionIds provided, replays to all active connections on the source.

### Bulk Replay

```
POST /v1/events/replay
```

```json
{
  "eventIds": ["evt_a1b2", "evt_c3d4", "evt_e5f6"],
  "connectionIds": ["conn_abc"]
}
```

---

## Analytics

### Overview

```
GET /v1/analytics/overview?period=7d
```

`period` options: `24h`, `7d`, `30d`

**Response (200):**
```json
{
  "data": {
    "period": "7d",
    "totalEvents": 12450,
    "deliveredEvents": 12300,
    "filteredEvents": 100,
    "failedEvents": 50,
    "deliverySuccessRate": 0.996,
    "avgLatencyMs": 145,
    "p95LatencyMs": 320,
    "eventsByDay": [
      { "date": "2026-02-02", "count": 1800 },
      { "date": "2026-02-03", "count": 1750 }
    ],
    "topSources": [
      { "sourceId": "src_abc", "name": "Stripe Prod", "count": 8000 },
      { "sourceId": "src_xyz", "name": "GitHub", "count": 4450 }
    ],
    "usage": {
      "eventsThisMonth": 45000,
      "planLimit": 100000,
      "percentUsed": 0.45
    }
  }
}
```

---

## API Keys

### Create API Key

```
POST /v1/api-keys
```

```json
{
  "name": "Production Server",
  "permissions": "write"
}
```

**Response (201):**
```json
{
  "data": {
    "id": "key_a1b2c3",
    "name": "Production Server",
    "key": "fh_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    "prefix": "fh_live_a1",
    "permissions": "write",
    "createdAt": "2026-02-08T12:00:00Z"
  }
}
```

**Important:** The `key` field is only returned once. Store it securely.

### List API Keys

```
GET /v1/api-keys
```

Returns keys without the plaintext key (only prefix for identification).

### Delete API Key

```
DELETE /v1/api-keys/{keyId}
```
