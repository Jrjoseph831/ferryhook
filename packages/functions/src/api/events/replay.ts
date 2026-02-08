import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { z } from "zod";
import { events, connections, queueProducer } from "@ferryhook/core";
import { authenticate } from "../../middleware/auth.js";
import { validateBody } from "../../middleware/validate.js";
import * as response from "../../middleware/response.js";

const replaySchema = z.object({
  connectionIds: z.array(z.string()).optional(),
});

export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  try {
    const auth = await authenticate(event);
    if (!auth) return response.unauthorized();

    const eventId = event.pathParameters?.id;
    if (!eventId) return response.notFound("Event");

    // Parse optional body
    let connectionIds: string[] | undefined;
    if (event.body) {
      const validation = validateBody(event.body, replaySchema);
      if (!validation.success) {
        return response.validationError(validation.errors);
      }
      connectionIds = validation.data.connectionIds;
    }

    // Load the event
    const evt = await events.getById(eventId);
    if (!evt || evt.userId !== auth.userId) {
      return response.notFound("Event");
    }

    // Load connections for this source
    const conns = await connections.listBySource(evt.sourceId);
    const activeConns = conns.filter((c) => c.status === "active");

    // Filter by connectionIds if specified
    const targetConns = connectionIds
      ? activeConns.filter((c) => connectionIds!.includes(c.connectionId))
      : activeConns;

    if (targetConns.length === 0) {
      return response.error(
        400,
        "VALIDATION_ERROR",
        "No active connections found for replay"
      );
    }

    // Parse original headers
    let originalHeaders: Record<string, string> = {};
    try {
      originalHeaders = JSON.parse(evt.headers);
    } catch {
      // Ignore
    }

    // Queue delivery tasks for each connection
    for (const conn of targetConns) {
      await queueProducer.sendToDeliver({
        eventId: evt.eventId,
        connectionId: conn.connectionId,
        destinationUrl: conn.destinationUrl,
        payload: evt.body,
        headers: {
          "content-type": originalHeaders["content-type"] ?? "application/json",
        },
        attempt: 1,
        signingSecret: conn.signingSecret,
      });
    }

    await events.updateStatus(eventId, "retrying");

    console.log(
      JSON.stringify({
        level: "info",
        message: "Event replay queued",
        eventId,
        userId: auth.userId,
        connectionCount: targetConns.length,
      })
    );

    return response.success({
      replayed: true,
      eventId,
      connectionCount: targetConns.length,
    });
  } catch (err) {
    console.error(
      JSON.stringify({
        level: "error",
        message: "Replay event error",
        error: String(err),
      })
    );
    return response.internalError();
  }
}
