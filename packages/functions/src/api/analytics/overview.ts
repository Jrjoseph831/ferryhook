import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, getConfig, sources, PLAN_LIMITS } from "@ferryhook/core";
import type { Plan, Event } from "@ferryhook/core";
import { authenticate } from "../../middleware/auth.js";
import * as response from "../../middleware/response.js";

const PERIOD_MS: Record<string, number> = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  try {
    const auth = await authenticate(event);
    if (!auth) return response.unauthorized();

    const period = event.queryStringParameters?.period ?? "7d";
    const periodMs = PERIOD_MS[period] ?? PERIOD_MS["7d"];
    const since = Date.now() - periodMs;

    // Get all user sources
    const userSources = await sources.listByUser(auth.userId);
    const activeSources = userSources.filter((s) => s.status !== "deleted");

    // Aggregate events from all sources
    let totalEvents = 0;
    let delivered = 0;
    let failed = 0;
    let retrying = 0;
    let filtered = 0;
    const latencies: number[] = [];

    const config = getConfig();

    for (const src of activeSources) {
      const result = await docClient.send(
        new QueryCommand({
          TableName: config.eventsTableName,
          KeyConditionExpression: "pk = :pk AND sk >= :since",
          ExpressionAttributeValues: {
            ":pk": `SRC#${src.sourceId}`,
            ":since": `EVT#${since}`,
          },
          ProjectionExpression: "#s, receivedAt, deliveredAt",
          ExpressionAttributeNames: { "#s": "status" },
        })
      );

      const items = (result.Items ?? []) as Array<{ status: string; receivedAt: number; deliveredAt: number | null }>;
      totalEvents += items.length;

      for (const item of items) {
        switch (item.status) {
          case "delivered":
            delivered++;
            if (item.deliveredAt && item.receivedAt) {
              latencies.push(item.deliveredAt - item.receivedAt);
            }
            break;
          case "failed":
            failed++;
            break;
          case "retrying":
            retrying++;
            break;
          case "filtered":
            filtered++;
            break;
        }
      }
    }

    const successRate = totalEvents > 0 ? Math.round((delivered / totalEvents) * 100) : 100;
    latencies.sort((a, b) => a - b);
    const p50 = latencies[Math.floor(latencies.length * 0.5)] ?? 0;
    const p95 = latencies[Math.floor(latencies.length * 0.95)] ?? 0;
    const p99 = latencies[Math.floor(latencies.length * 0.99)] ?? 0;

    const planLimits = PLAN_LIMITS[auth.plan as Plan];

    return response.success({
      period,
      totalEvents,
      byStatus: { delivered, failed, retrying, filtered },
      successRate,
      latency: { p50, p95, p99 },
      activeSources: activeSources.length,
      usage: {
        current: totalEvents,
        limit: planLimits.eventsPerMonth,
        plan: auth.plan,
      },
    });
  } catch (err) {
    console.error(
      JSON.stringify({
        level: "error",
        message: "Analytics overview error",
        error: String(err),
      })
    );
    return response.internalError();
  }
}
