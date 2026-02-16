import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { z } from "zod";
import { apiKeys } from "@ferryhook/core";
import { authenticate } from "../../middleware/auth.js";
import { validateBody } from "../../middleware/validate.js";
import * as response from "../../middleware/response.js";

const createKeySchema = z.object({
  name: z.string().min(1).max(100),
  permissions: z.enum(["read", "write", "admin"]),
});

export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  try {
    const auth = await authenticate(event);
    if (!auth) return response.unauthorized();

    const validation = validateBody(event.body, createKeySchema);
    if (!validation.success) {
      return response.validationError(validation.errors);
    }

    const { key, apiKey } = await apiKeys.create(auth.userId, validation.data);

    console.log(
      JSON.stringify({
        level: "info",
        message: "API key created",
        keyId: apiKey.keyId,
        userId: auth.userId,
      })
    );

    return response.success(
      {
        id: apiKey.keyId,
        name: apiKey.name,
        prefix: apiKey.keyPrefix,
        permissions: apiKey.permissions,
        key, // Only returned once at creation
        lastUsedAt: apiKey.lastUsedAt,
        createdAt: apiKey.createdAt,
      },
      201
    );
  } catch (err) {
    console.error(
      JSON.stringify({
        level: "error",
        message: "Create API key error",
        error: String(err),
      })
    );
    return response.internalError();
  }
}
