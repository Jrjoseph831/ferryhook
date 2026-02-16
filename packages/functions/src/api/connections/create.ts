import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { z } from "zod";
import { sources, connections, connectionCache, isAllowedUrl, PLAN_LIMITS } from "@ferryhook/core";
import type { Plan } from "@ferryhook/core";
import { authenticate } from "../../middleware/auth.js";
import { validateBody } from "../../middleware/validate.js";
import * as response from "../../middleware/response.js";

const filterRuleSchema = z.object({
  path: z.string(),
  operator: z.enum([
    "equals", "not_equals", "contains", "not_contains",
    "exists", "not_exists", "regex", "gt", "lt", "gte", "lte",
  ]),
  value: z.union([z.string(), z.number(), z.boolean()]).optional(),
});

const transformSchema = z.object({
  type: z.enum(["field_map", "passthrough", "javascript"]),
  rules: z.array(z.object({ from: z.string(), to: z.string() })).optional(),
  code: z.string().optional(),
});

const createConnectionSchema = z.object({
  name: z.string().min(1).max(100),
  destinationUrl: z.string().url("Must be a valid URL"),
  filters: z.array(filterRuleSchema).optional(),
  transform: transformSchema.optional(),
});

export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  try {
    const auth = await authenticate(event);
    if (!auth) return response.unauthorized();

    const sourceId = event.pathParameters?.id;
    if (!sourceId) return response.notFound("Source");

    const validation = validateBody(event.body, createConnectionSchema);
    if (!validation.success) {
      return response.validationError(validation.errors);
    }

    const source = await sources.getById(sourceId);
    if (!source || source.userId !== auth.userId || source.status === "deleted") {
      return response.notFound("Source");
    }

    if (!isAllowedUrl(validation.data.destinationUrl)) {
      return response.validationError([
        { field: "destinationUrl", message: "Destination URL is not allowed" },
      ]);
    }

    const existingConns = await connections.listBySource(sourceId);
    const activeConns = existingConns.filter((c) => c.status !== "deleted");
    const limit = PLAN_LIMITS[auth.plan as Plan].maxConnectionsPerSource;
    if (activeConns.length >= limit) {
      return response.error(
        403,
        "PLAN_LIMIT_REACHED",
        `Connection limit reached (${limit} per source on ${auth.plan} plan)`
      );
    }

    const connection = await connections.create({
      sourceId,
      userId: auth.userId,
      name: validation.data.name,
      destinationUrl: validation.data.destinationUrl,
      filters: validation.data.filters,
      transform: validation.data.transform,
    });

    // Invalidate connection cache
    await connectionCache.invalidateConnections(sourceId);

    console.log(
      JSON.stringify({
        level: "info",
        message: "Connection created",
        connectionId: connection.connectionId,
        sourceId,
        userId: auth.userId,
      })
    );

    return response.success(
      {
        id: connection.connectionId,
        sourceId: connection.sourceId,
        name: connection.name,
        destinationUrl: connection.destinationUrl,
        filters: connection.filters,
        transform: connection.transform,
        status: connection.status,
        deliveryCount: connection.deliveryCount,
        failureCount: connection.failureCount,
        createdAt: connection.createdAt,
        updatedAt: connection.updatedAt,
      },
      201
    );
  } catch (err) {
    console.error(
      JSON.stringify({
        level: "error",
        message: "Create connection error",
        error: String(err),
      })
    );
    return response.internalError();
  }
}
