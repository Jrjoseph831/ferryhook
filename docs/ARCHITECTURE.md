# ARCHITECTURE.md — Ferryhook System Architecture

## Request Lifecycle

Every webhook entering Ferryhook follows this exact path:

```
Webhook Sender (Stripe, GitHub, etc.)
        │
        ▼
┌─────────────────────┐
│   API Gateway        │  ← hooks.ferryhook.io/in/{source_id}
│   (HTTP API)         │  ← Validates source_id exists (Redis cache)
└────────┬────────────┘  ← Returns 200 immediately
         │
         ▼
┌─────────────────────┐
│   Ingest Lambda      │  ← Stores raw event in DynamoDB (status: "received")
│                      │  ← Pushes event_id to SQS Process Queue
└────────┬────────────┘  ← Total latency target: <50ms
         │
         ▼
┌─────────────────────┐
│   SQS Process Queue  │  ← Buffers events during traffic spikes
│                      │  ← At-least-once delivery guarantee
└────────┬────────────┘  ← DLQ after 3 processing failures
         │
         ▼
┌─────────────────────┐
│   Process Lambda     │  ← Loads connection config (Redis → DynamoDB fallback)
│                      │  ← Runs pipeline: verify → filter → transform
│                      │  ← Creates delivery task per destination
└────────┬────────────┘  ← Updates event status in DynamoDB
         │
         ▼
┌─────────────────────┐
│  SQS Deliver Queue   │  ← One message per destination per event
│                      │  ← Supports delayed messages for retries
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│   Deliver Lambda     │  ← HTTP POST to destination URL
│                      │  ← Records attempt (status code, latency, response)
│                      │  ← On failure: re-queue with exponential backoff
└────────┬────────────┘  ← On success: mark event "delivered"
         │
         ▼
    User's Server
```

## Retry Strategy

Failed deliveries follow an exponential backoff schedule:

| Attempt | Delay After Failure | Cumulative Time |
|---------|-------------------|-----------------|
| 1       | Immediate          | 0               |
| 2       | 30 seconds         | 30s             |
| 3       | 2 minutes          | 2m 30s          |
| 4       | 15 minutes         | 17m 30s         |
| 5       | 1 hour             | 1h 17m          |
| 6       | 4 hours            | 5h 17m          |
| 7       | 12 hours           | 17h 17m         |
| 8       | 24 hours           | 41h 17m         |

After attempt 8 fails, the event is marked `failed` and the user is alerted. The event remains available for manual replay within the retention period.

Implementation: SQS `DelaySeconds` on re-queued messages (max 15 min per SQS limits). For delays >15 min, use a scheduled DynamoDB scan or Step Functions timer.

## Lambda Functions Detail

### ingest-handler

**Trigger:** API Gateway HTTP API route `POST /in/{source_id}`
**Timeout:** 10 seconds
**Memory:** 128 MB
**Reserved concurrency:** 100 (prevents runaway costs)

```typescript
// Pseudocode
export async function handler(event: APIGatewayProxyEventV2) {
  const sourceId = event.pathParameters.source_id;
  
  // 1. Validate source exists (Redis cache, 1ms)
  const source = await cache.getSource(sourceId);
  if (!source) return { statusCode: 404 };
  
  // 2. Check rate limit (Redis, 1ms)
  const allowed = await rateLimit.check(sourceId, source.plan);
  if (!allowed) return { statusCode: 429 };
  
  // 3. Generate event ID
  const eventId = generateEventId(); // nanoid, prefixed: evt_
  
  // 4. Store raw event in DynamoDB
  await db.events.create({
    eventId,
    sourceId,
    userId: source.userId,
    headers: event.headers,
    body: event.body,
    sourceIp: event.requestContext.http.sourceIp,
    method: event.requestContext.http.method,
    contentType: event.headers['content-type'],
    status: 'received',
    receivedAt: Date.now(),
    ttl: calculateTTL(source.plan), // Auto-expire based on plan tier
  });
  
  // 5. Queue for processing
  await queue.sendToProcess({ eventId, sourceId });
  
  // 6. Increment usage counter (Redis)
  await billing.incrementUsage(source.userId);
  
  // 7. Return 200 immediately
  return { statusCode: 200, body: JSON.stringify({ id: eventId }) };
}
```

### process-handler

**Trigger:** SQS Process Queue
**Timeout:** 30 seconds
**Memory:** 256 MB
**Batch size:** 10 (process up to 10 events per invocation)

```typescript
// Pseudocode
export async function handler(event: SQSEvent) {
  for (const record of event.Records) {
    const { eventId, sourceId } = JSON.parse(record.body);
    
    // 1. Load event from DynamoDB
    const evt = await db.events.get(eventId);
    
    // 2. Load connections for this source (Redis → DynamoDB fallback)
    const connections = await cache.getConnections(sourceId);
    
    // 3. For each connection, run the pipeline
    for (const conn of connections) {
      // a. Signature verification (optional, per-source config)
      if (conn.verifySignature) {
        const valid = verifySignature(evt, conn.signingConfig);
        if (!valid) {
          await db.events.updateStatus(eventId, 'signature_failed');
          continue;
        }
      }
      
      // b. Filters — accept/reject based on payload
      if (conn.filters) {
        const passes = evaluateFilters(evt.body, conn.filters);
        if (!passes) {
          await db.events.updateStatus(eventId, 'filtered');
          continue;
        }
      }
      
      // c. Transformation — reshape payload
      let payload = evt.body;
      if (conn.transform) {
        payload = applyTransform(payload, conn.transform);
      }
      
      // d. Queue delivery task
      await queue.sendToDeliver({
        eventId,
        connectionId: conn.id,
        destinationUrl: conn.destinationUrl,
        payload,
        headers: buildOutboundHeaders(evt, conn),
        attempt: 1,
      });
    }
    
    await db.events.updateStatus(eventId, 'processing_complete');
  }
}
```

### deliver-handler

**Trigger:** SQS Deliver Queue
**Timeout:** 30 seconds
**Memory:** 256 MB
**Batch size:** 5

```typescript
// Pseudocode
export async function handler(event: SQSEvent) {
  for (const record of event.Records) {
    const task = JSON.parse(record.body);
    const { eventId, connectionId, destinationUrl, payload, headers, attempt } = task;
    
    // 1. Validate destination URL (SSRF protection)
    if (!isAllowedUrl(destinationUrl)) {
      await db.attempts.create(eventId, attempt, {
        status: 'blocked',
        reason: 'ssrf_protection',
      });
      continue;
    }
    
    // 2. Make HTTP request to destination
    const startTime = Date.now();
    try {
      const response = await fetch(destinationUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Ferryhook/1.0',
          'X-Ferryhook-Event-Id': eventId,
          'X-Ferryhook-Signature': signPayload(payload, connectionId),
          'X-Ferryhook-Timestamp': String(Date.now()),
          ...headers,
        },
        body: typeof payload === 'string' ? payload : JSON.stringify(payload),
        signal: AbortSignal.timeout(10000), // 10s timeout
      });
      
      const latency = Date.now() - startTime;
      const responseBody = await response.text();
      
      // 3. Record attempt
      await db.attempts.create(eventId, attempt, {
        connectionId,
        destinationUrl,
        statusCode: response.status,
        responseBody: responseBody.substring(0, 1000), // Truncate
        latencyMs: latency,
        attemptedAt: Date.now(),
      });
      
      // 4. Check if successful (2xx)
      if (response.ok) {
        await db.events.updateStatus(eventId, 'delivered');
      } else {
        await handleRetry(task, attempt);
      }
      
    } catch (error) {
      const latency = Date.now() - startTime;
      await db.attempts.create(eventId, attempt, {
        connectionId,
        destinationUrl,
        statusCode: 0,
        responseBody: error.message,
        latencyMs: latency,
        attemptedAt: Date.now(),
      });
      await handleRetry(task, attempt);
    }
  }
}

async function handleRetry(task, currentAttempt) {
  const MAX_ATTEMPTS = 8;
  if (currentAttempt >= MAX_ATTEMPTS) {
    await db.events.updateStatus(task.eventId, 'failed');
    await alerts.sendFailureAlert(task.eventId, task.connectionId);
    return;
  }
  
  const delays = [0, 30, 120, 900, 3600, 14400, 43200, 86400];
  const delaySec = delays[currentAttempt] || 86400;
  
  // SQS max delay is 900s (15 min). For longer delays, use a scheduled approach.
  const sqsDelay = Math.min(delaySec, 900);
  
  await queue.sendToDeliver({
    ...task,
    attempt: currentAttempt + 1,
  }, sqsDelay);
  
  await db.events.updateStatus(task.eventId, 'retrying');
}
```

## API Gateway Routes

Two separate API Gateway HTTP APIs:

### 1. Webhook Ingestion API (`hooks.ferryhook.io`)

| Method | Route              | Handler         | Auth   |
|--------|-------------------|-----------------|--------|
| POST   | /in/{source_id}   | ingest-handler  | None*  |
| GET    | /in/{source_id}   | ingest-handler  | None*  |

*Authentication is handled via webhook signatures, not API keys.
GET is supported for provider verification handshakes (Stripe, GitHub).

### 2. Management API (`api.ferryhook.io`)

| Method | Route                              | Handler              | Auth     |
|--------|-----------------------------------|-----------------------|----------|
| POST   | /v1/auth/signup                   | auth-signup           | None     |
| POST   | /v1/auth/login                    | auth-login            | None     |
| POST   | /v1/auth/refresh                  | auth-refresh          | Refresh  |
| GET    | /v1/auth/github                   | auth-github-redirect  | None     |
| GET    | /v1/auth/github/callback          | auth-github-callback  | None     |
| POST   | /v1/sources                       | api-sources-create    | JWT      |
| GET    | /v1/sources                       | api-sources-list      | JWT      |
| GET    | /v1/sources/{id}                  | api-sources-get       | JWT      |
| PATCH  | /v1/sources/{id}                  | api-sources-update    | JWT      |
| DELETE | /v1/sources/{id}                  | api-sources-delete    | JWT      |
| POST   | /v1/sources/{id}/connections      | api-conn-create       | JWT      |
| GET    | /v1/sources/{id}/connections      | api-conn-list         | JWT      |
| PATCH  | /v1/connections/{id}              | api-conn-update       | JWT      |
| DELETE | /v1/connections/{id}              | api-conn-delete       | JWT      |
| GET    | /v1/sources/{id}/events           | api-events-list       | JWT      |
| GET    | /v1/events/{id}                   | api-events-get        | JWT      |
| POST   | /v1/events/{id}/replay            | api-events-replay     | JWT      |
| POST   | /v1/events/replay                 | api-events-bulk-replay| JWT      |
| GET    | /v1/analytics/overview            | api-analytics         | JWT      |
| POST   | /v1/api-keys                      | api-keys-create       | JWT      |
| GET    | /v1/api-keys                      | api-keys-list         | JWT      |
| DELETE | /v1/api-keys/{id}                 | api-keys-delete       | JWT      |
| GET    | /v1/billing/usage                 | api-billing-usage     | JWT      |
| POST   | /v1/billing/checkout              | api-billing-checkout  | JWT      |
| POST   | /v1/billing/portal                | api-billing-portal    | JWT      |
| POST   | /webhooks/stripe                  | billing-stripe-hook   | Stripe Sig|

## SSRF Protection

The deliver-handler MUST validate destination URLs before making requests:

```typescript
const BLOCKED_RANGES = [
  /^127\./,                    // Loopback
  /^10\./,                     // Private Class A
  /^172\.(1[6-9]|2\d|3[01])\./, // Private Class B
  /^192\.168\./,               // Private Class C
  /^169\.254\./,               // Link-local
  /^0\./,                      // Current network
  /^fc00:/i,                   // IPv6 unique local
  /^fe80:/i,                   // IPv6 link-local
  /^::1$/,                     // IPv6 loopback
  /^localhost$/i,              // Localhost hostname
  /\.local$/i,                 // mDNS
  /\.internal$/i,              // Internal domains
];

function isAllowedUrl(url: string): boolean {
  const parsed = new URL(url);
  
  // Must be HTTPS (or HTTP for development)
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
  
  // Check hostname against blocked ranges
  const hostname = parsed.hostname;
  for (const pattern of BLOCKED_RANGES) {
    if (pattern.test(hostname)) return false;
  }
  
  // Resolve DNS and check the IP (prevents DNS rebinding)
  // This should be done at delivery time, not just config time
  return true;
}
```

## Webhook Signature Signing

Ferryhook signs all outbound deliveries so destinations can verify authenticity:

```typescript
import { createHmac } from 'crypto';

function signPayload(payload: string, secret: string): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const signedContent = `${timestamp}.${payload}`;
  const signature = createHmac('sha256', secret)
    .update(signedContent)
    .digest('hex');
  return `t=${timestamp},v1=${signature}`;
}

// Verification (for documentation / SDK):
function verifySignature(payload: string, header: string, secret: string, tolerance = 300): boolean {
  const parts = Object.fromEntries(
    header.split(',').map(p => p.split('='))
  );
  const timestamp = parseInt(parts.t);
  
  // Check timestamp tolerance (default 5 minutes)
  if (Math.abs(Date.now() / 1000 - timestamp) > tolerance) return false;
  
  const expected = createHmac('sha256', secret)
    .update(`${timestamp}.${payload}`)
    .digest('hex');
  
  return timingSafeEqual(Buffer.from(parts.v1), Buffer.from(expected));
}
```

## Rate Limiting

Implemented via Redis sliding window:

```typescript
async function checkRateLimit(sourceId: string, plan: Plan): Promise<boolean> {
  const key = `rl:${sourceId}:${Math.floor(Date.now() / 60000)}`; // Per-minute window
  const limit = PLAN_LIMITS[plan].eventsPerMinute;
  
  const current = await redis.incr(key);
  if (current === 1) {
    await redis.expire(key, 120); // 2 min TTL
  }
  
  return current <= limit;
}

const PLAN_LIMITS = {
  free:    { eventsPerMinute: 100,   eventsPerMonth: 5_000 },
  starter: { eventsPerMinute: 500,   eventsPerMonth: 100_000 },
  pro:     { eventsPerMinute: 2000,  eventsPerMonth: 1_000_000 },
  team:    { eventsPerMinute: 10000, eventsPerMonth: 5_000_000 },
};
```

## Caching Strategy

Redis is used for three primary purposes:

1. **Source validation** — When a webhook arrives, we need to validate the source_id exists and load the user's plan. This is cached with a 5-minute TTL.
2. **Connection config** — Connection rules (filters, transforms, destinations) are cached with a 1-minute TTL. Invalidated on config changes.
3. **Rate limiting** — Sliding window counters per source per minute.

Cache invalidation: On any write operation to sources or connections via the management API, the corresponding cache keys are explicitly deleted.
