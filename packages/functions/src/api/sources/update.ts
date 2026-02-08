import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { z } from "zod";
import { sources, getConfig } from "@ferryhook/core";
import { authenticate } from "../../middleware/auth.js";
import { validateBody } from "../../middleware/validate.js";
import * as response from "../../middleware/response.js";

const updateSourceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  status: z.enum(["active", "paused"]).optional(),
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

    const sourceId = event.pathParameters?.id;
    if (!sourceId) return response.notFound("Source");

    const validation = validateBody(event.body, updateSourceSchema);
    if (!validation.success) {
      return response.validationError(validation.errors);
    }

    // Verify ownership
    const existing = await sources.getById(sourceId);
    if (!existing || existing.userId !== auth.userId || existing.status === "deleted") {
      return response.notFound("Source");
    }

    const updated = await sources.update(sourceId, auth.userId, validation.data);
    const config = getConfig();

    console.log(
      JSON.stringify({
        level: "info",
        message: "Source updated",
        sourceId,
        userId: auth.userId,
      })
    );

    return response.success({
      id: updated.sourceId,
      name: updated.name,
      provider: updated.provider,
      url: `https://${config.hooksDomain}/in/${updated.sourceId}`,
      status: updated.status,
      eventCount: updated.eventCount,
      lastEventAt: updated.lastEventAt,
      createdAt: updated.createdAt,
    });
  } catch (err) {
    console.error(
      JSON.stringify({
        level: "error",
        message: "Update source error",
        error: String(err),
      })
    );
    return response.internalError();
  }
}
