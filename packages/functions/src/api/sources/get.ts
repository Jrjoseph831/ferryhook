import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { sources, getConfig } from "@ferryhook/core";
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

    const source = await sources.getById(sourceId);
    if (!source || source.userId !== auth.userId || source.status === "deleted") {
      return response.notFound("Source");
    }

    const config = getConfig();

    return response.success({
      id: source.sourceId,
      name: source.name,
      provider: source.provider,
      url: `https://${config.hooksDomain}/in/${source.sourceId}`,
      status: source.status,
      signingAlgorithm: source.signingAlgorithm,
      eventCount: source.eventCount,
      lastEventAt: source.lastEventAt,
      createdAt: source.createdAt,
    });
  } catch (err) {
    console.error(
      JSON.stringify({
        level: "error",
        message: "Get source error",
        error: String(err),
      })
    );
    return response.internalError();
  }
}
