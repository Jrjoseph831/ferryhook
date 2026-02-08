# DEPLOYMENT.md — Ferryhook Infrastructure & Deployment

## Prerequisites

- Node.js 20+
- pnpm 8+
- AWS CLI configured with credentials
- Stripe account (test mode for development)
- Domain: ferryhook.io (or your chosen domain)

## Initial Setup

```bash
# Clone and install
git clone <repo>
cd ferryhook
pnpm install

# Copy environment template
cp .env.example .env.local

# Configure SST secrets (one-time)
npx sst secret set JwtSecret "$(openssl rand -base64 32)"
npx sst secret set StripeSecretKey "sk_test_..."
npx sst secret set StripeWebhookSecret "whsec_..."
npx sst secret set GithubClientId "..."
npx sst secret set GithubClientSecret "..."

# Start development (deploys to personal AWS stage)
npx sst dev
```

## SST Infrastructure Overview

```typescript
// sst.config.ts
export default $config({
  app(input) {
    return {
      name: "ferryhook",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: { aws: { region: "us-east-1" } },
    };
  },
  async run() {
    // Import infrastructure modules
    const { tables } = await import("./infra/database");
    const { queues } = await import("./infra/queue");
    const { cache } = await import("./infra/cache");
    const { ingestApi, managementApi } = await import("./infra/api");
    const { site } = await import("./infra/web");
    
    return {
      ingestUrl: ingestApi.url,
      apiUrl: managementApi.url,
      siteUrl: site.url,
    };
  },
});
```

## Infrastructure Modules

### database.ts
```typescript
// DynamoDB Tables
const mainTable = new sst.aws.Dynamo("MainTable", {
  fields: {
    pk: "string",
    sk: "string",
    gsi1pk: "string",
    gsi1sk: "string",
    gsi2pk: "string",
    gsi2sk: "string",
    gsi3pk: "string",
    gsi3sk: "string",
  },
  primaryIndex: { hashKey: "pk", rangeKey: "sk" },
  globalIndexes: {
    gsi1: { hashKey: "gsi1pk", rangeKey: "gsi1sk" },
    gsi2: { hashKey: "gsi2pk", rangeKey: "gsi2sk" },
    gsi3: { hashKey: "gsi3pk", rangeKey: "gsi3sk" },
  },
  transform: {
    table: { pointInTimeRecovery: { enabled: true } },
  },
});

const eventsTable = new sst.aws.Dynamo("EventsTable", {
  fields: {
    pk: "string",
    sk: "string",
    gsi1pk: "string",
    gsi1sk: "string",
  },
  primaryIndex: { hashKey: "pk", rangeKey: "sk" },
  globalIndexes: {
    gsi1: { hashKey: "gsi1pk", rangeKey: "gsi1sk" },
  },
  transform: {
    table: {
      pointInTimeRecovery: { enabled: true },
      ttl: { attributeName: "expiresAt", enabled: true },
    },
  },
});
```

### queue.ts
```typescript
// Dead Letter Queue
const dlq = new sst.aws.Queue("DLQ", {});

// Process Queue (ingest -> process)
const processQueue = new sst.aws.Queue("ProcessQueue", {
  transform: {
    queue: {
      visibilityTimeoutSeconds: 60,
      redrivePolicy: JSON.stringify({
        deadLetterTargetArn: dlq.arn,
        maxReceiveCount: 3,
      }),
    },
  },
});

// Deliver Queue (process -> deliver)
const deliverQueue = new sst.aws.Queue("DeliverQueue", {
  transform: {
    queue: {
      visibilityTimeoutSeconds: 60,
      redrivePolicy: JSON.stringify({
        deadLetterTargetArn: dlq.arn,
        maxReceiveCount: 3,
      }),
    },
  },
});
```

### api.ts
```typescript
// Ingest API (public — receives webhooks)
const ingestApi = new sst.aws.ApiGatewayV2("IngestApi", {
  transform: {
    route: {
      handler: { timeout: "10 seconds", memory: "128 MB" },
    },
  },
});

ingestApi.route("POST /in/{sourceId}", "packages/functions/src/ingest/handler.main");
ingestApi.route("GET /in/{sourceId}", "packages/functions/src/ingest/handler.main");

// Management API (authenticated)
const managementApi = new sst.aws.ApiGatewayV2("ManagementApi", {
  transform: {
    route: {
      handler: { timeout: "30 seconds", memory: "256 MB" },
    },
  },
});

// Auth routes
managementApi.route("POST /v1/auth/signup", "packages/functions/src/auth/signup.main");
managementApi.route("POST /v1/auth/login", "packages/functions/src/auth/login.main");
managementApi.route("POST /v1/auth/refresh", "packages/functions/src/auth/refresh.main");

// Source routes
managementApi.route("POST /v1/sources", "packages/functions/src/api/sources/create.main");
managementApi.route("GET /v1/sources", "packages/functions/src/api/sources/list.main");
managementApi.route("GET /v1/sources/{id}", "packages/functions/src/api/sources/get.main");
managementApi.route("PATCH /v1/sources/{id}", "packages/functions/src/api/sources/update.main");
managementApi.route("DELETE /v1/sources/{id}", "packages/functions/src/api/sources/delete.main");

// Connection routes
managementApi.route("POST /v1/sources/{id}/connections", "packages/functions/src/api/connections/create.main");
managementApi.route("GET /v1/sources/{id}/connections", "packages/functions/src/api/connections/list.main");
managementApi.route("PATCH /v1/connections/{id}", "packages/functions/src/api/connections/update.main");
managementApi.route("DELETE /v1/connections/{id}", "packages/functions/src/api/connections/delete.main");

// Event routes
managementApi.route("GET /v1/sources/{id}/events", "packages/functions/src/api/events/list.main");
managementApi.route("GET /v1/events/{id}", "packages/functions/src/api/events/get.main");
managementApi.route("POST /v1/events/{id}/replay", "packages/functions/src/api/events/replay.main");

// Analytics
managementApi.route("GET /v1/analytics/overview", "packages/functions/src/api/analytics/overview.main");

// Billing
managementApi.route("POST /v1/billing/checkout", "packages/functions/src/billing/checkout.main");
managementApi.route("POST /webhooks/stripe", "packages/functions/src/billing/stripeWebhook.main");

// SQS consumers
processQueue.subscribe("packages/functions/src/process/handler.main", {
  transform: { subscriber: { timeout: "30 seconds", memory: "256 MB" } },
});

deliverQueue.subscribe("packages/functions/src/deliver/handler.main", {
  transform: { subscriber: { timeout: "30 seconds", memory: "256 MB" } },
});
```

## Environments

| Stage       | Purpose                  | Domain                      |
|-------------|-------------------------|-----------------------------|
| dev         | Personal dev (per dev)   | {dev}.dev.ferryhook.io      |
| staging     | Pre-production testing   | staging.ferryhook.io        |
| production  | Live                     | ferryhook.io                |

```bash
# Deploy to staging
npx sst deploy --stage staging

# Deploy to production
npx sst deploy --stage production
```

## Custom Domain Setup

1. Register ferryhook.io
2. Create Route 53 hosted zone
3. Configure in SST:

```typescript
// For the ingest API
ingestApi.addDomain({
  name: stage === "production" ? "hooks.ferryhook.io" : `hooks.${stage}.ferryhook.io`,
});

// For the management API
managementApi.addDomain({
  name: stage === "production" ? "api.ferryhook.io" : `api.${stage}.ferryhook.io`,
});

// For the frontend
site.addDomain({
  name: stage === "production" ? "ferryhook.io" : `${stage}.ferryhook.io`,
  redirects: stage === "production" ? ["www.ferryhook.io"] : undefined,
});
```

## Monitoring & Alarms

```typescript
// infra/monitoring.ts

// Ingest latency alarm
new aws.cloudwatch.MetricAlarm("IngestLatencyAlarm", {
  metricName: "IntegrationLatency",
  namespace: "AWS/ApiGateway",
  statistic: "p95",
  period: 300,
  evaluationPeriods: 2,
  threshold: 500,
  comparisonOperator: "GreaterThanThreshold",
  alarmActions: [alertTopic.arn],
});

// DLQ depth alarm (events that failed processing)
new aws.cloudwatch.MetricAlarm("DLQAlarm", {
  metricName: "ApproximateNumberOfMessagesVisible",
  namespace: "AWS/SQS",
  statistic: "Sum",
  period: 60,
  evaluationPeriods: 1,
  threshold: 1,
  comparisonOperator: "GreaterThanThreshold",
  alarmActions: [alertTopic.arn],
});
```

## CI/CD Pipeline

GitHub Actions workflow:

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: pnpm install
      - run: pnpm test
      - run: pnpm build
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      - run: npx sst deploy --stage production
```

## Cost Monitoring

Set up AWS Budgets:
- Monthly alert at $50 (early warning)
- Monthly alert at $100 (investigate)
- Monthly alert at $200 (hard investigate)

Lambda costs are the primary variable — monitor concurrency and duration closely.
