import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import {
  sources,
  events,
  users,
  queueProducer,
  PLAN_LIMITS,
} from "@ferryhook/core";
import type { Plan } from "@ferryhook/core";
import * as response from "../middleware/response.js";

export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  try {
    const sourceId = event.pathParameters?.sourceId;
    if (!sourceId) {
      return response.notFound("Source");
    }

    // 1. Validate source exists
    const source = await sources.getById(sourceId);
    if (!source || source.status !== "active") {
      return response.notFound("Source");
    }

    // 2. Load user for plan limits
    const user = await users.getById(source.userId);
    if (!user) {
      return response.notFound("Source");
    }

    // 3. Check monthly usage limit
    const planLimits = PLAN_LIMITS[user.plan as Plan];
    if (user.usageThisMonth >= planLimits.eventsPerMonth) {
      return response.error(
        403,
        "PLAN_LIMIT_REACHED",
        "Monthly event limit reached"
      );
    }

    // 4. Store raw event in DynamoDB
    const ttlSeconds = planLimits.retentionTtlSeconds;
    const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;

    const storedEvent = await events.create({
      sourceId,
      userId: source.userId,
      headers: JSON.stringify(event.headers),
      body: event.body ?? "",
      sourceIp: event.requestContext.http.sourceIp,
      contentType: event.headers["content-type"] ?? "",
      method: event.requestContext.http.method,
      expiresAt,
    });

    // 5. Queue for processing
    await queueProducer.sendToProcess({
      eventId: storedEvent.eventId,
      sourceId,
    });

    // 6. Increment usage counter
    users.incrementUsage(source.userId).catch((err) => {
      console.error(
        JSON.stringify({
          level: "error",
          message: "Failed to increment usage",
          userId: source.userId,
          error: String(err),
        })
      );
    });

    // 7. Update source event count (fire-and-forget)
    sources
      .update(sourceId, source.userId, {
        eventCount: source.eventCount + 1,
        lastEventAt: new Date().toISOString(),
      })
      .catch(() => {});

    console.log(
      JSON.stringify({
        level: "info",
        message: "Event ingested",
        eventId: storedEvent.eventId,
        sourceId,
        userId: source.userId,
      })
    );

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: storedEvent.eventId,
        status: "received",
      }),
    };
  } catch (err) {
    console.error(
      JSON.stringify({
        level: "error",
        message: "Ingest handler error",
        error: String(err),
        sourceId: event.pathParameters?.sourceId,
      })
    );
    return response.internalError();
  }
}
