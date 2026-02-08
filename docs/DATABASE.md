# DATABASE.md — Ferryhook DynamoDB Schema

## Table Strategy

Two DynamoDB tables:
1. **ferryhook-main** — Users, sources, connections, API keys, billing. Low-to-moderate throughput.
2. **ferryhook-events** — Events and delivery attempts. High throughput, TTL-based expiration.

Separating events allows independent scaling and prevents hot partition issues from event volume affecting config reads.

## Table: ferryhook-main

**Billing mode:** PAY_PER_REQUEST (on-demand)
**Point-in-time recovery:** Enabled

### Entity Patterns

#### User
```
PK: USER#{userId}
SK: PROFILE
```
| Attribute          | Type   | Description                        |
|-------------------|--------|------------------------------------|
| userId            | S      | usr_ + nanoid(16)                  |
| email             | S      | User email (unique, GSI)           |
| name              | S      | Display name                       |
| passwordHash      | S      | bcrypt hash (null if OAuth only)   |
| plan              | S      | free | starter | pro | team        |
| stripeCustomerId  | S      | Stripe customer ID                 |
| stripeSubId       | S      | Stripe subscription ID             |
| githubId          | S      | GitHub user ID (if OAuth)          |
| googleId          | S      | Google user ID (if OAuth)          |
| usageThisMonth    | N      | Current month event count          |
| usagePeriodStart  | S      | ISO date of billing period start   |
| createdAt         | S      | ISO timestamp                      |
| updatedAt         | S      | ISO timestamp                      |

#### Source
```
PK: USER#{userId}
SK: SRC#{sourceId}
```
| Attribute          | Type   | Description                        |
|-------------------|--------|------------------------------------|
| sourceId          | S      | src_ + nanoid(16)                  |
| userId            | S      | Owner user ID                      |
| name              | S      | Human-readable name ("Stripe Prod")|
| provider          | S      | stripe | github | shopify | custom |
| signingSecret     | S      | Optional: provider's signing secret|
| signingAlgorithm  | S      | hmac-sha256 | etc.                 |
| status            | S      | active | paused | deleted           |
| eventCount        | N      | Total events received              |
| lastEventAt       | S      | ISO timestamp of last event        |
| createdAt         | S      | ISO timestamp                      |

#### Connection
```
PK: SRC#{sourceId}
SK: CONN#{connectionId}
```
| Attribute          | Type   | Description                        |
|-------------------|--------|------------------------------------|
| connectionId      | S      | conn_ + nanoid(16)                 |
| sourceId          | S      | Parent source ID                   |
| userId            | S      | Owner user ID                      |
| name              | S      | Human-readable name                |
| destinationUrl    | S      | Target delivery URL                |
| signingSecret     | S      | HMAC secret for outbound signing   |
| filters           | S      | JSON: filter rules array           |
| transform         | S      | JSON: transformation rules         |
| retryConfig       | S      | JSON: custom retry schedule        |
| status            | S      | active | paused | deleted           |
| deliveryCount     | N      | Total successful deliveries        |
| failureCount      | N      | Total failed deliveries            |
| createdAt         | S      | ISO timestamp                      |
| updatedAt         | S      | ISO timestamp                      |

#### API Key
```
PK: USER#{userId}
SK: KEY#{keyId}
```
| Attribute          | Type   | Description                        |
|-------------------|--------|------------------------------------|
| keyId             | S      | key_ + nanoid(16)                  |
| userId            | S      | Owner user ID                      |
| name              | S      | Human-readable name ("Production") |
| keyHash           | S      | SHA-256 hash of the API key        |
| keyPrefix         | S      | First 8 chars for identification   |
| permissions       | S      | read | write | admin               |
| lastUsedAt        | S      | ISO timestamp                      |
| createdAt         | S      | ISO timestamp                      |

### Global Secondary Indexes (GSI)

#### GSI1: Email Lookup
```
GSI1PK: EMAIL#{email}
GSI1SK: USER
```
Used for: login by email, duplicate email check.

#### GSI2: API Key Lookup
```
GSI2PK: KEYHASH#{keyHash}
GSI2SK: KEY
```
Used for: API key authentication (lookup user by key hash).

#### GSI3: Source Lookup
```
GSI3PK: SRCID#{sourceId}
GSI3SK: SOURCE
```
Used for: ingest-handler source validation (lookup source by ID without knowing userId).

---

## Table: ferryhook-events

**Billing mode:** PAY_PER_REQUEST (on-demand)
**Point-in-time recovery:** Enabled
**TTL attribute:** `expiresAt`

### Entity Patterns

#### Event
```
PK: SRC#{sourceId}
SK: EVT#{receivedAt}#{eventId}
```
| Attribute          | Type   | Description                        |
|-------------------|--------|------------------------------------|
| eventId           | S      | evt_ + nanoid(16)                  |
| sourceId          | S      | Source that received this event     |
| userId            | S      | Owner user ID                      |
| status            | S      | received | processing | filtered | delivered | retrying | failed |
| headers           | S      | JSON: original request headers     |
| body              | S      | Raw request body (max 256KB)       |
| sourceIp          | S      | Sender IP address                  |
| contentType       | S      | Content-Type header value          |
| method            | S      | HTTP method (POST, PUT, etc.)      |
| receivedAt        | N      | Unix timestamp (ms)                |
| processedAt       | N      | Unix timestamp (ms)                |
| deliveredAt       | N      | Unix timestamp (ms)                |
| expiresAt         | N      | Unix timestamp (s) — TTL field     |

#### Delivery Attempt
```
PK: EVT#{eventId}
SK: ATT#{attemptNumber}
```
| Attribute          | Type   | Description                        |
|-------------------|--------|------------------------------------|
| eventId           | S      | Parent event ID                    |
| connectionId      | S      | Connection that triggered delivery |
| attemptNumber     | N      | 1-8                                |
| destinationUrl    | S      | Target URL                         |
| statusCode        | N      | HTTP response status (0 if timeout)|
| responseBody      | S      | First 1000 chars of response       |
| latencyMs         | N      | Request duration in ms             |
| error             | S      | Error message if request failed    |
| attemptedAt       | N      | Unix timestamp (ms)                |

### GSI for Event Lookup by ID

#### GSI1: Event by ID
```
GSI1PK: EVTID#{eventId}
GSI1SK: EVENT
```
Used for: event detail lookup by ID (without knowing sourceId).

---

## TTL Configuration by Plan

| Plan    | Retention | TTL (seconds from receivedAt)  |
|---------|-----------|-------------------------------|
| free    | 24 hours  | 86,400                        |
| starter | 7 days    | 604,800                       |
| pro     | 30 days   | 2,592,000                     |
| team    | 90 days   | 7,776,000                     |

The `expiresAt` field is set at ingestion time: `Math.floor(Date.now() / 1000) + TTL_SECONDS`

DynamoDB automatically deletes expired items within 48 hours of the TTL timestamp.

---

## Common Access Patterns

| Access Pattern                          | Table  | Key Condition                          |
|----------------------------------------|--------|----------------------------------------|
| Get user by ID                         | main   | PK = USER#{userId}, SK = PROFILE       |
| Get user by email                      | main   | GSI1PK = EMAIL#{email}                 |
| List sources for user                  | main   | PK = USER#{userId}, SK begins_with SRC#|
| Get source by ID (for ingestion)       | main   | GSI3PK = SRCID#{sourceId}              |
| List connections for source            | main   | PK = SRC#{sourceId}, SK begins_with CONN#|
| Authenticate API key                   | main   | GSI2PK = KEYHASH#{hash}                |
| List events for source (newest first)  | events | PK = SRC#{sourceId}, SK begins_with EVT#, ScanIndexForward=false |
| Get event by ID                        | events | GSI1PK = EVTID#{eventId}               |
| List attempts for event                | events | PK = EVT#{eventId}, SK begins_with ATT#|
| List user's API keys                   | main   | PK = USER#{userId}, SK begins_with KEY#|

---

## Data Access Layer Interface

All database operations go through typed functions in `packages/core/src/db/`:

```typescript
// packages/core/src/db/users.ts
export const users = {
  create(input: CreateUserInput): Promise<User>;
  getById(userId: string): Promise<User | null>;
  getByEmail(email: string): Promise<User | null>;
  update(userId: string, updates: Partial<User>): Promise<User>;
  incrementUsage(userId: string, count?: number): Promise<void>;
};

// packages/core/src/db/sources.ts
export const sources = {
  create(input: CreateSourceInput): Promise<Source>;
  getById(sourceId: string): Promise<Source | null>;
  listByUser(userId: string): Promise<Source[]>;
  update(sourceId: string, userId: string, updates: Partial<Source>): Promise<Source>;
  delete(sourceId: string, userId: string): Promise<void>;
};

// packages/core/src/db/connections.ts
export const connections = {
  create(input: CreateConnectionInput): Promise<Connection>;
  listBySource(sourceId: string): Promise<Connection[]>;
  update(connectionId: string, updates: Partial<Connection>): Promise<Connection>;
  delete(connectionId: string): Promise<void>;
};

// packages/core/src/db/events.ts
export const events = {
  create(input: CreateEventInput): Promise<Event>;
  getById(eventId: string): Promise<Event | null>;
  listBySource(sourceId: string, opts: ListOpts): Promise<PaginatedResult<Event>>;
  updateStatus(eventId: string, status: EventStatus): Promise<void>;
};

// packages/core/src/db/attempts.ts
export const attempts = {
  create(eventId: string, attemptNum: number, input: CreateAttemptInput): Promise<Attempt>;
  listByEvent(eventId: string): Promise<Attempt[]>;
};

// packages/core/src/db/apiKeys.ts
export const apiKeys = {
  create(userId: string, input: CreateApiKeyInput): Promise<{ key: string; apiKey: ApiKey }>;
  getByHash(keyHash: string): Promise<ApiKey | null>;
  listByUser(userId: string): Promise<ApiKey[]>;
  delete(keyId: string, userId: string): Promise<void>;
  updateLastUsed(keyId: string): Promise<void>;
};
```
