import { mainTable, eventsTable } from "./database";
import { processQueue, deliverQueue } from "./queue";

const secrets = {
  jwtSecret: new sst.Secret("JwtSecret"),
  stripeSecretKey: new sst.Secret("StripeSecretKey"),
  stripeWebhookSecret: new sst.Secret("StripeWebhookSecret"),
};

const sharedLink = [
  mainTable,
  eventsTable,
  processQueue,
  deliverQueue,
  secrets.jwtSecret,
];

// Ingest API (public — receives webhooks)
export const ingestApi = new sst.aws.ApiGatewayV2("IngestApi", {
  transform: {
    route: {
      handler: {
        timeout: "10 seconds",
        memory: "128 MB",
        link: sharedLink,
      },
    },
  },
});

ingestApi.route("POST /in/{sourceId}", "packages/functions/src/ingest/handler.main");
ingestApi.route("GET /in/{sourceId}", "packages/functions/src/ingest/handler.main");

// Management API (authenticated)
export const managementApi = new sst.aws.ApiGatewayV2("ManagementApi", {
  transform: {
    route: {
      handler: {
        timeout: "30 seconds",
        memory: "256 MB",
        link: sharedLink,
      },
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

// SQS consumers
processQueue.subscribe("packages/functions/src/process/handler.main", {
  transform: {
    subscriber: {
      timeout: "30 seconds",
      memory: "256 MB",
      link: sharedLink,
    },
  },
});

deliverQueue.subscribe("packages/functions/src/deliver/handler.main", {
  transform: {
    subscriber: {
      timeout: "30 seconds",
      memory: "256 MB",
      link: sharedLink,
    },
  },
});
