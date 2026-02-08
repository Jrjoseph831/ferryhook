/// <reference path="./.sst/platform/config.d.ts" />

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
    const { mainTable, eventsTable } = await import("./infra/database");
    const { processQueue, deliverQueue, dlq } = await import("./infra/queue");
    const { ingestApi, managementApi } = await import("./infra/api");

    return {
      ingestUrl: ingestApi.url,
      apiUrl: managementApi.url,
    };
  },
});
