import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { apiKeys } from "@ferryhook/core";
import { authenticate } from "../../middleware/auth.js";
import * as response from "../../middleware/response.js";

export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  try {
    const auth = await authenticate(event);
    if (!auth) return response.unauthorized();

    const keys = await apiKeys.listByUser(auth.userId);

    return response.success(
      keys.map((k) => ({
        id: k.keyId,
        name: k.name,
        prefix: k.keyPrefix,
        permissions: k.permissions,
        lastUsedAt: k.lastUsedAt,
        createdAt: k.createdAt,
      }))
    );
  } catch (err) {
    console.error(
      JSON.stringify({
        level: "error",
        message: "List API keys error",
        error: String(err),
      })
    );
    return response.internalError();
  }
}
