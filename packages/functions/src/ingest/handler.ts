import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import {
  sourceCache,
  events,
  users,
  queueProducer,
  checkRateLimit,
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

    // 1. Validate source exists (cached — 5 min TTL)
    const source = await sourceCache.getCachedSource(sourceId);
    if (!source || source.status !== "active") {
      return response.notFound("Source");
    }

    // 2. Load user for plan limits
    const user = await users.getById(source.userId);
    if (!user) {
      return response.notFound("Source");
    }

    // 3. Rate limit check (Redis sliding window)
    const withinLimit = await checkRateLimit(sourceId, user.plan as Plan);
    if (!withinLimit) {
      return response.rateLimited();
    }

    // 4. Check monthly usage limit
    const planLimits = PLAN_LIMITS[user.plan as Plan];
    if (user.usageThisMonth >= planLimits.eventsPerMonth) {
      if (user.plan === "free") {
        return response.error(
          429,
          "PLAN_LIMIT_REACHED",
          "Monthly event limit reached. Upgrade to continue."
        );
      }
      // Paid plans: allow but flag for overage billing
    }

    // 5. Store raw event in DynamoDB
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

    // 6. Queue for processing
    await queueProducer.sendToProcess({
      eventId: storedEvent.eventId,
      sourceId,
    });

    // 7. Increment usage counter (fire-and-forget)
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
