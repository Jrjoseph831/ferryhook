import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { sources, sourceCache } from "@ferryhook/core";
import { authenticate } from "../../middleware/auth.js";
import * as response from "../../middleware/response.js";

export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  try {
    const auth = await authenticate(event);
    if (!auth) return response.unauthorized();

    const sourceId = event.pathParameters?.id;
    if (!sourceId) return response.notFound("Source");

    const existing = await sources.getById(sourceId);
    if (!existing || existing.userId !== auth.userId || existing.status === "deleted") {
      return response.notFound("Source");
    }

    await sources.delete(sourceId, auth.userId);
    await sourceCache.invalidateSource(sourceId);

    console.log(
      JSON.stringify({
        level: "info",
        message: "Source deleted",
        sourceId,
        userId: auth.userId,
      })
    );

    return response.success({ deleted: true });
  } catch (err) {
    console.error(
      JSON.stringify({
        level: "error",
        message: "Delete source error",
        error: String(err),
      })
    );
    return response.internalError();
  }
}
