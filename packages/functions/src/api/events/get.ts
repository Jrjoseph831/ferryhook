import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { events, attempts } from "@ferryhook/core";
import { authenticate } from "../../middleware/auth.js";
import * as response from "../../middleware/response.js";

export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  try {
    const auth = await authenticate(event);
    if (!auth) return response.unauthorized();

    const eventId = event.pathParameters?.id;
    if (!eventId) return response.notFound("Event");

    const evt = await events.getById(eventId);
    if (!evt || evt.userId !== auth.userId) {
      return response.notFound("Event");
    }

    const eventAttempts = await attempts.listByEvent(eventId);

    let parsedHeaders: Record<string, string> = {};
    try {
      parsedHeaders = JSON.parse(evt.headers);
    } catch {
      // Ignore
    }

    return response.success({
      id: evt.eventId,
      sourceId: evt.sourceId,
      status: evt.status,
      headers: parsedHeaders,
      body: evt.body,
      sourceIp: evt.sourceIp,
      receivedAt: new Date(evt.receivedAt).toISOString(),
      processedAt: evt.processedAt
        ? new Date(evt.processedAt).toISOString()
        : null,
      deliveredAt: evt.deliveredAt
        ? new Date(evt.deliveredAt).toISOString()
        : null,
      attempts: eventAttempts.map((a) => ({
        number: a.attemptNumber,
        connectionId: a.connectionId,
        destinationUrl: a.destinationUrl,
        statusCode: a.statusCode,
        latencyMs: a.latencyMs,
        error: a.error,
        attemptedAt: new Date(a.attemptedAt).toISOString(),
      })),
    });
  } catch (err) {
    console.error(
      JSON.stringify({
        level: "error",
        message: "Get event error",
        error: String(err),
      })
    );
    return response.internalError();
  }
}
