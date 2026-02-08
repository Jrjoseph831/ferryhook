import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { sources, connections } from "@ferryhook/core";
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

    // Verify source ownership
    const source = await sources.getById(sourceId);
    if (!source || source.userId !== auth.userId || source.status === "deleted") {
      return response.notFound("Source");
    }

    const conns = await connections.listBySource(sourceId);
    const activeConns = conns.filter((c) => c.status !== "deleted");

    const data = activeConns.map((c) => ({
      id: c.connectionId,
      sourceId: c.sourceId,
      name: c.name,
      destinationUrl: c.destinationUrl,
      filters: c.filters,
      transform: c.transform,
      status: c.status,
      deliveryCount: c.deliveryCount,
      failureCount: c.failureCount,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));

    return response.paginated(data, null, false);
  } catch (err) {
    console.error(
      JSON.stringify({
        level: "error",
        message: "List connections error",
        error: String(err),
      })
    );
    return response.internalError();
  }
}
