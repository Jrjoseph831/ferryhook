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

    const userSources = await sources.listByUser(auth.userId);
    const activeSources = userSources.filter((s) => s.status !== "deleted");

    const config = getConfig();
    const data = activeSources.map((s) => ({
      id: s.sourceId,
      name: s.name,
      provider: s.provider,
      url: `https://${config.hooksDomain}/in/${s.sourceId}`,
      status: s.status,
      eventCount: s.eventCount,
      lastEventAt: s.lastEventAt,
      createdAt: s.createdAt,
    }));

    return response.paginated(data, null, false);
  } catch (err) {
    console.error(
      JSON.stringify({
        level: "error",
        message: "List sources error",
        error: String(err),
      })
    );
    return response.internalError();
  }
}
