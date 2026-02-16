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

    const keyId = event.pathParameters?.id;
    if (!keyId) return response.notFound("API Key");

    await apiKeys.delete(keyId, auth.userId);

    console.log(
      JSON.stringify({
        level: "info",
        message: "API key deleted",
        keyId,
        userId: auth.userId,
      })
    );

    return response.success({ deleted: true });
  } catch (err) {
    console.error(
      JSON.stringify({
        level: "error",
        message: "Delete API key error",
        error: String(err),
      })
    );
    return response.internalError();
  }
}
