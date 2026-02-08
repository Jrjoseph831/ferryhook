# CLAUDE.md — Ferryhook

## Project Overview

Ferryhook is a webhook relay, transformation, and intelligence platform. It sits between webhook senders (Stripe, GitHub, Shopify, Twilio, etc.) and the applications that consume them. It guarantees delivery, provides transformation capabilities, and offers full observability.

**One-liner:** "Never miss a webhook again."

**Target audience:** Individual developers and small teams who need reliable webhook infrastructure but can't justify $39-490+/month enterprise pricing from competitors like Hookdeck and Svix.

## Tech Stack

- **Runtime:** Node.js 20+ (TypeScript throughout)
- **Framework:** SST (Serverless Stack) v3 for AWS infrastructure-as-code
- **Compute:** AWS Lambda (Node.js 20)
- **API:** API Gateway HTTP API (not REST — HTTP is cheaper and faster)
- **Queue:** SQS Standard (with DLQ for failed processing)
- **Database:** DynamoDB (single-table design for core data, separate table for events)
- **Cache:** ElastiCache Redis (t3.micro to start)
- **Auth:** Custom JWT auth (jose library) + GitHub OAuth + Google OAuth
- **Billing:** Stripe (subscriptions + usage-based metering)
- **Frontend:** Next.js 14+ (App Router) with Tailwind CSS
- **Email:** Amazon SES (transactional alerts)
- **Monitoring:** CloudWatch + custom metrics
- **DNS/CDN:** Route 53 + CloudFront
- **SSL:** ACM (auto-provisioned)

## Project Structure

```
ferryhook/
├── CLAUDE.md                    # This file
├── docs/
│   ├── ARCHITECTURE.md          # Detailed system architecture
│   ├── DATABASE.md              # DynamoDB schema and access patterns
│   ├── API.md                   # REST API specification
│   ├── SECURITY.md              # Security implementation details
│   └── DEPLOYMENT.md            # Deployment and infrastructure guide
├── packages/
│   ├── core/                    # Shared business logic, types, utils
│   │   ├── src/
│   │   │   ├── types/           # TypeScript types and interfaces
│   │   │   ├── utils/           # Shared utilities (crypto, validation, etc.)
│   │   │   ├── db/              # DynamoDB client and data access layer
│   │   │   ├── queue/           # SQS producer/consumer helpers
│   │   │   ├── cache/           # Redis client wrapper
│   │   │   └── billing/         # Stripe integration helpers
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── functions/               # Lambda function handlers
│   │   ├── src/
│   │   │   ├── ingest/          # Webhook ingestion (receives inbound hooks)
│   │   │   ├── process/         # Event processing (filters, transforms)
│   │   │   ├── deliver/         # Outbound delivery to destinations
│   │   │   ├── api/             # Dashboard/management API handlers
│   │   │   ├── auth/            # Auth handlers (login, signup, OAuth, API keys)
│   │   │   ├── billing/         # Stripe webhook handlers, metering
│   │   │   └── alerts/          # Failure notification handlers
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/                     # Next.js frontend (dashboard + landing page)
│       ├── src/
│       │   ├── app/             # Next.js App Router pages
│       │   │   ├── (marketing)/ # Landing page, pricing, docs
│       │   │   ├── (dashboard)/ # Authenticated dashboard pages
│       │   │   └── api/         # Next.js API routes (auth callbacks, etc.)
│       │   ├── components/      # React components
│       │   │   ├── ui/          # Base UI components (buttons, inputs, etc.)
│       │   │   ├── dashboard/   # Dashboard-specific components
│       │   │   └── marketing/   # Landing page components
│       │   ├── lib/             # Client-side utilities
│       │   └── hooks/           # Custom React hooks
│       ├── public/              # Static assets
│       ├── package.json
│       ├── tailwind.config.ts
│       ├── next.config.js
│       └── tsconfig.json
├── infra/                       # SST infrastructure definitions
│   ├── api.ts                   # API Gateway + Lambda config
│   ├── database.ts              # DynamoDB tables
│   ├── queue.ts                 # SQS queues
│   ├── cache.ts                 # ElastiCache Redis
│   ├── auth.ts                  # Auth infrastructure
│   ├── dns.ts                   # Route 53 + CloudFront
│   └── monitoring.ts            # CloudWatch alarms
├── sst.config.ts                # SST root config
├── package.json                 # Root package.json (monorepo)
├── tsconfig.json                # Root TypeScript config
├── turbo.json                   # Turborepo config (monorepo build)
└── .env.example                 # Environment variable template
```

## Core Concepts

### Sources
A unique inbound URL where webhook senders deliver payloads.
- Format: `hooks.ferryhook.io/in/{source_id}`
- Each source maps to one external service (Stripe, GitHub, etc.)
- Source has an optional signing secret for signature verification

### Connections
A rule pipeline between a source and a destination.
- Contains: filters (accept/reject by payload content), transformations (reshape data), routing config
- One source can have multiple connections (fan-out)

### Destinations
The endpoint where processed webhooks are delivered.
- The user's actual server URL, Lambda, or other HTTP endpoint
- Each destination has configurable retry and timeout settings

### Events
A single webhook request flowing through the system.
- Lifecycle: received → queued → filtered → transformed → delivered (or retried → failed)
- Every state transition is logged with timestamps

## Coding Standards

- **TypeScript strict mode** everywhere — no `any` types
- **Functional approach** — pure functions where possible, minimize side effects
- **Error handling** — every Lambda wraps in try/catch, returns structured error responses, never throws unhandled
- **Logging** — structured JSON logs with `event_id`, `source_id`, `user_id` on every log line
- **Testing** — unit tests for business logic (vitest), integration tests for Lambda handlers
- **Naming** — camelCase for variables/functions, PascalCase for types/interfaces, SCREAMING_SNAKE for constants
- **Imports** — use path aliases (`@ferryhook/core`, `@ferryhook/functions`)
- **No classes** — use plain objects, interfaces, and functions. No OOP patterns.
- **DynamoDB** — always use the data access layer in `packages/core/src/db/`, never raw SDK calls in handlers
- **Environment variables** — accessed through typed config objects, never raw `process.env` in business logic

## Build Order (Phase 1 — Weeks 1-3)

### Week 1: Foundation + Core Engine
1. Initialize monorepo (pnpm workspaces + turborepo)
2. SST project scaffolding with DynamoDB tables, SQS queues, API Gateway
3. Core types and interfaces (`packages/core/src/types/`)
4. DynamoDB data access layer (`packages/core/src/db/`)
5. Ingestion Lambda: receive webhook → store in DynamoDB → push to SQS → return 200
6. Processing Lambda: read from SQS → load connection config → passthrough delivery
7. Delivery Lambda: POST to destination → record attempt → retry on failure
8. Redis cache for source_id validation

### Week 2: Dashboard + Auth + Billing
1. JWT auth system (signup, login, token refresh)
2. GitHub OAuth flow
3. API handlers: source CRUD, connection CRUD, event listing, event detail
4. Next.js dashboard: login, sources page, event log, event detail view
5. WebSocket for real-time event streaming
6. Stripe integration: customer creation, checkout, subscription webhooks
7. Usage metering and plan limit enforcement

### Week 3: Features + Polish + Launch
1. Filter rules (JSONPath-based accept/reject)
2. Transformations (field mapping, rename, remove, add)
3. Multi-destination fan-out
4. Event replay (single + bulk)
5. Failure alerts (email via SES)
6. Landing page
7. Documentation site
8. Status page integration

## Key Dependencies

```json
{
  "core": {
    "@aws-sdk/client-dynamodb": "DynamoDB operations",
    "@aws-sdk/lib-dynamodb": "DynamoDB document client",
    "@aws-sdk/client-sqs": "SQS operations",
    "@aws-sdk/client-ses": "Email sending",
    "ioredis": "Redis client",
    "stripe": "Billing integration",
    "jose": "JWT signing/verification",
    "zod": "Runtime validation",
    "nanoid": "ID generation",
    "jsonpath-plus": "JSONPath for filters"
  },
  "functions": {
    "inherits core deps": true
  },
  "web": {
    "next": "14+",
    "react": "18+",
    "tailwindcss": "styling",
    "@tanstack/react-query": "data fetching",
    "zustand": "client state",
    "recharts": "dashboard charts",
    "lucide-react": "icons",
    "sonner": "toast notifications"
  }
}
```

## Environment Variables

```env
# AWS (provided by SST)
AWS_REGION=us-east-1

# Database (provided by SST)
DYNAMODB_TABLE_MAIN=ferryhook-main
DYNAMODB_TABLE_EVENTS=ferryhook-events

# Queue (provided by SST)
SQS_PROCESS_QUEUE_URL=
SQS_DELIVER_QUEUE_URL=
SQS_DLQ_URL=

# Cache
REDIS_URL=

# Auth
JWT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Billing
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_STARTER=
STRIPE_PRICE_PRO=
STRIPE_PRICE_TEAM=

# App
APP_URL=https://ferryhook.io
HOOKS_DOMAIN=hooks.ferryhook.io
API_URL=https://api.ferryhook.io

# Email
SES_FROM_EMAIL=alerts@ferryhook.io

# Monitoring
ALERT_SLACK_WEBHOOK=
```

## Important Architectural Decisions

1. **DynamoDB over Postgres** — We chose DynamoDB for its zero-ops scaling, single-digit-ms latency, TTL for automatic event log expiration, and native integration with Lambda/SQS. The access patterns are well-defined and don't require complex joins.

2. **SQS over EventBridge** — SQS is simpler, cheaper, and provides the exact delivery guarantees we need. EventBridge adds complexity we don't need at this stage.

3. **SST over Serverless Framework** — SST v3 has first-class TypeScript support, live Lambda debugging, and cleaner infrastructure-as-code. It's the modern choice for AWS serverless.

4. **Custom JWT over Cognito** — Cognito adds complexity, cost, and vendor lock-in for auth patterns that are straightforward to implement. Custom JWT with `jose` gives us full control.

5. **Monorepo with pnpm** — Shared types and utilities across functions and frontend. Turborepo for efficient builds. pnpm for fast, disk-efficient package management.

6. **Next.js for everything** — Dashboard and landing page in one app. App Router for modern patterns. SSR for landing page SEO. Client-side for dashboard interactivity.
