import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { connections } from "@ferryhook/core";
import { authenticate } from "../../middleware/auth.js";
import * as response from "../../middleware/response.js";

export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  try {
    const auth = await authenticate(event);
    if (!auth) return response.unauthorized();

    const connectionId = event.pathParameters?.id;
    if (!connectionId) return response.notFound("Connection");

    // Same limitation as update — need sourceId for the DynamoDB key
    // For now, return error directing to source-scoped endpoint
    return response.error(
      400,
      "VALIDATION_ERROR",
      "Connection delete requires source context. Use the source-scoped endpoint."
    );
  } catch (err) {
    console.error(
      JSON.stringify({
        level: "error",
        message: "Delete connection error",
        error: String(err),
      })
    );
    return response.internalError();
  }
}
