import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { z } from "zod";
import { sources, getConfig, PLAN_LIMITS } from "@ferryhook/core";
import type { Plan } from "@ferryhook/core";
import { authenticate } from "../../middleware/auth.js";
import { validateBody } from "../../middleware/validate.js";
import * as response from "../../middleware/response.js";

const createSourceSchema = z.object({
  name: z.string().min(1).max(100),
  provider: z.enum([
    "stripe",
    "github",
    "shopify",
    "twilio",
    "sendgrid",
    "slack",
    "custom",
  ]),
  signingSecret: z.string().optional(),
  signingAlgorithm: z
    .enum(["stripe", "github", "shopify", "generic-hmac-sha256", "none"])
    .optional(),
});

export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  try {
    const auth = await authenticate(event);
    if (!auth) return response.unauthorized();

    const validation = validateBody(event.body, createSourceSchema);
    if (!validation.success) {
      return response.validationError(validation.errors);
    }

    // Check source limit
    const existingSources = await sources.listByUser(auth.userId);
    const activeSources = existingSources.filter((s) => s.status !== "deleted");
    const limit = PLAN_LIMITS[auth.plan as Plan].maxSources;
    if (activeSources.length >= limit) {
      return response.error(
        403,
        "PLAN_LIMIT_REACHED",
        `Source limit reached (${limit} sources on ${auth.plan} plan)`
      );
    }

    const source = await sources.create({
      userId: auth.userId,
      ...validation.data,
    });

    const config = getConfig();

    console.log(
      JSON.stringify({
        level: "info",
        message: "Source created",
        sourceId: source.sourceId,
        userId: auth.userId,
      })
    );

    return response.success(
      {
        id: source.sourceId,
        name: source.name,
        provider: source.provider,
        url: `https://${config.hooksDomain}/in/${source.sourceId}`,
        status: source.status,
        eventCount: source.eventCount,
        createdAt: source.createdAt,
      },
      201
    );
  } catch (err) {
    console.error(
      JSON.stringify({
        level: "error",
        message: "Create source error",
        error: String(err),
      })
    );
    return response.internalError();
  }
}
