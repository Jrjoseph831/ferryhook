import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { sources, events } from "@ferryhook/core";
import type { EventStatus } from "@ferryhook/core";
import { authenticate } from "../../middleware/auth.js";
import * as response from "../../middleware/response.js";

const VALID_STATUSES: EventStatus[] = [
  "received",
  "processing",
  "filtered",
  "delivered",
  "retrying",
  "failed",
];

export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  try {
    const auth = await authenticate(event);
    if (!auth) return response.unauthorized();

    const sourceId = event.pathParameters?.id;
    if (!sourceId) return response.notFound("Source");

    // Verify source ownership
    const source = await sources.getById(sourceId);
    if (!source || source.userId !== auth.userId || source.status === "deleted") {
      return response.notFound("Source");
    }

    const params = event.queryStringParameters ?? {};
    const limit = Math.min(Math.max(Number(params.limit) || 50, 1), 100);
    const cursor = params.cursor ?? undefined;
    const status =
      params.status && VALID_STATUSES.includes(params.status as EventStatus)
        ? (params.status as EventStatus)
        : undefined;

    const result = await events.listBySource(sourceId, {
      limit,
      cursor,
      status,
    });

    const data = result.items.map((e) => ({
      id: e.eventId,
      sourceId: e.sourceId,
      status: e.status,
      contentType: e.contentType,
      method: e.method,
      sourceIp: e.sourceIp,
      receivedAt: new Date(e.receivedAt).toISOString(),
      processedAt: e.processedAt ? new Date(e.processedAt).toISOString() : null,
      deliveredAt: e.deliveredAt ? new Date(e.deliveredAt).toISOString() : null,
    }));

    return response.paginated(data, result.cursor, result.hasMore);
  } catch (err) {
    console.error(
      JSON.stringify({
        level: "error",
        message: "List events error",
        error: String(err),
      })
    );
    return response.internalError();
  }
}
