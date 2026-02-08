import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { z } from "zod";
import { connections, isAllowedUrl } from "@ferryhook/core";
import { authenticate } from "../../middleware/auth.js";
import { validateBody } from "../../middleware/validate.js";
import * as response from "../../middleware/response.js";

const updateConnectionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  destinationUrl: z.string().url().optional(),
  status: z.enum(["active", "paused"]).optional(),
  filters: z
    .array(
      z.object({
        path: z.string(),
        operator: z.enum([
          "equals",
          "not_equals",
          "contains",
          "not_contains",
          "exists",
          "not_exists",
          "regex",
          "gt",
          "lt",
          "gte",
          "lte",
        ]),
        value: z.union([z.string(), z.number(), z.boolean()]).optional(),
      })
    )
    .optional(),
  transform: z
    .object({
      type: z.enum(["field_map", "passthrough", "javascript"]),
      rules: z.array(z.object({ from: z.string(), to: z.string() })).optional(),
      code: z.string().optional(),
    })
    .optional(),
});

export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  try {
    const auth = await authenticate(event);
    if (!auth) return response.unauthorized();

    const connectionId = event.pathParameters?.id;
    if (!connectionId) return response.notFound("Connection");

    const validation = validateBody(event.body, updateConnectionSchema);
    if (!validation.success) {
      return response.validationError(validation.errors);
    }

    // We need to find the connection to verify ownership
    // Since connections are keyed by SRC#{sourceId}, we need to search
    // For now, we'll iterate user's sources to find the connection
    // TODO: Add GSI for connection lookup by ID

    // Validate destination URL if provided
    if (validation.data.destinationUrl && !isAllowedUrl(validation.data.destinationUrl)) {
      return response.validationError([
        { field: "destinationUrl", message: "Destination URL is not allowed" },
      ]);
    }

    // We need sourceId to update — parse from the connection lookup
    // Since we don't have a direct connection-by-id lookup, this handler
    // expects the sourceId to be available. For the PATCH /connections/{id} route,
    // we'll need the client to have the sourceId context.
    // A pragmatic approach: store sourceId in the connection and use a scan or GSI.
    // For now, return not found if we can't locate it.

    return response.error(
      400,
      "VALIDATION_ERROR",
      "Connection update requires source context. Use the source-scoped endpoint."
    );
  } catch (err) {
    console.error(
      JSON.stringify({
        level: "error",
        message: "Update connection error",
        error: String(err),
      })
    );
    return response.internalError();
  }
}
