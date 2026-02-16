import type { SQSEvent } from "aws-lambda";
import {
  events,
  connectionCache,
  queueProducer,
} from "@ferryhook/core";
import type { Connection, FilterRule, TransformConfig } from "@ferryhook/core";

export async function main(sqsEvent: SQSEvent): Promise<void> {
  for (const record of sqsEvent.Records) {
    try {
      const { eventId, sourceId } = JSON.parse(record.body) as {
        eventId: string;
        sourceId: string;
      };

      console.log(
        JSON.stringify({
          level: "info",
          message: "Processing event",
          eventId,
          sourceId,
        })
      );

      // 1. Load event from DynamoDB
      const evt = await events.getById(eventId);
      if (!evt) {
        console.error(
          JSON.stringify({
            level: "error",
            message: "Event not found",
            eventId,
          })
        );
        continue;
      }

      await events.updateStatus(eventId, "processing");

      // 2. Load connections for this source (cached — 1 min TTL)
      const conns = await connectionCache.getCachedConnections(sourceId);
      const activeConns = conns.filter((c) => c.status === "active");

      if (activeConns.length === 0) {
        console.log(
          JSON.stringify({
            level: "info",
            message: "No active connections for source",
            eventId,
            sourceId,
          })
        );
        continue;
      }

      // 3. For each connection, run the pipeline
      for (const conn of activeConns) {
        await processConnection(evt, conn);
      }

      console.log(
        JSON.stringify({
          level: "info",
          message: "Event processing complete",
          eventId,
          sourceId,
          connectionCount: activeConns.length,
        })
      );
    } catch (err) {
      console.error(
        JSON.stringify({
          level: "error",
          message: "Process handler error",
          error: String(err),
          record: record.body,
        })
      );
      throw err;
    }
  }
}

async function processConnection(
  evt: { eventId: string; sourceId: string; userId: string; headers: string; body: string },
  conn: Connection
): Promise<void> {
  // a. Filters — accept/reject based on payload
  if (conn.filters && conn.filters.length > 0) {
    const passes = evaluateFilters(evt.body, conn.filters);
    if (!passes) {
      console.log(
        JSON.stringify({
          level: "info",
          message: "Event filtered out",
          eventId: evt.eventId,
          connectionId: conn.connectionId,
        })
      );
      return;
    }
  }

  // b. Transformation — reshape payload
  let payload = evt.body;
  if (conn.transform && conn.transform.type !== "passthrough") {
    payload = applyTransform(payload, conn.transform);
  }

  // c. Parse original headers for forwarding
  let originalHeaders: Record<string, string> = {};
  try {
    originalHeaders = JSON.parse(evt.headers);
  } catch {
    // Ignore parse errors
  }

  // d. Queue delivery task
  await queueProducer.sendToDeliver({
    eventId: evt.eventId,
    connectionId: conn.connectionId,
    destinationUrl: conn.destinationUrl,
    payload,
    headers: {
      "content-type": originalHeaders["content-type"] ?? "application/json",
    },
    attempt: 1,
    signingSecret: conn.signingSecret,
  });
}

function evaluateFilters(body: string, filters: FilterRule[]): boolean {
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(body);
  } catch {
    return true;
  }

  for (const filter of filters) {
    const value = getNestedValue(parsed, filter.path);

    switch (filter.operator) {
      case "equals":
        if (value !== filter.value) return false;
        break;
      case "not_equals":
        if (value === filter.value) return false;
        break;
      case "contains":
        if (typeof value !== "string" || !value.includes(String(filter.value))) return false;
        break;
      case "not_contains":
        if (typeof value === "string" && value.includes(String(filter.value))) return false;
        break;
      case "exists":
        if (value === undefined) return false;
        break;
      case "not_exists":
        if (value !== undefined) return false;
        break;
      case "regex":
        if (typeof value !== "string" || !new RegExp(String(filter.value)).test(value))
          return false;
        break;
      case "gt":
        if (typeof value !== "number" || value <= Number(filter.value)) return false;
        break;
      case "lt":
        if (typeof value !== "number" || value >= Number(filter.value)) return false;
        break;
      case "gte":
        if (typeof value !== "number" || value < Number(filter.value)) return false;
        break;
      case "lte":
        if (typeof value !== "number" || value > Number(filter.value)) return false;
        break;
    }
  }

  return true;
}

function getNestedValue(
  obj: Record<string, unknown>,
  path: string
): unknown {
  const cleanPath = path.replace(/^\$\./, "");
  const parts = cleanPath.split(".");
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

function applyTransform(body: string, transform: TransformConfig): string {
  if (transform.type !== "field_map" || !transform.rules) {
    return body;
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(body);
  } catch {
    return body;
  }

  const result: Record<string, unknown> = {};
  for (const rule of transform.rules) {
    const value = getNestedValue(parsed, rule.from);
    if (value !== undefined) {
      result[rule.to] = value;
    }
  }

  return JSON.stringify(result);
}
