import {
  GetCommand,
  PutCommand,
  UpdateCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient } from "./client.js";
import { getConfig } from "../config.js";
import { generateEventId } from "../utils/id.js";
import type {
  Event,
  EventStatus,
  CreateEventInput,
  ListOptions,
  PaginatedResult,
} from "../types/index.js";

function tableName(): string {
  return getConfig().eventsTableName;
}

export const events = {
  async create(input: CreateEventInput): Promise<Event> {
    const receivedAt = Date.now();
    const eventId = generateEventId();

    const event: Event = {
      eventId,
      sourceId: input.sourceId,
      userId: input.userId,
      status: "received",
      headers: input.headers,
      body: input.body,
      sourceIp: input.sourceIp,
      contentType: input.contentType,
      method: input.method,
      receivedAt,
      processedAt: null,
      deliveredAt: null,
      expiresAt: input.expiresAt,
    };

    await docClient.send(
      new PutCommand({
        TableName: tableName(),
        Item: {
          pk: `SRC#${input.sourceId}`,
          sk: `EVT#${receivedAt}#${eventId}`,
          gsi1pk: `EVTID#${eventId}`,
          gsi1sk: "EVENT",
          ...event,
        },
      })
    );

    return event;
  },

  async getById(eventId: string): Promise<Event | null> {
    const result = await docClient.send(
      new QueryCommand({
        TableName: tableName(),
        IndexName: "gsi1",
        KeyConditionExpression: "gsi1pk = :pk AND gsi1sk = :sk",
        ExpressionAttributeValues: {
          ":pk": `EVTID#${eventId}`,
          ":sk": "EVENT",
        },
        Limit: 1,
      })
    );
    return (result.Items?.[0] as Event) ?? null;
  },

  async listBySource(
    sourceId: string,
    opts: ListOptions = {}
  ): Promise<PaginatedResult<Event>> {
    const limit = opts.limit ?? 50;

    const expressionValues: Record<string, unknown> = {
      ":pk": `SRC#${sourceId}`,
      ":prefix": "EVT#",
    };

    let filterExpression: string | undefined;
    let expressionNames: Record<string, string> | undefined;

    if (opts.status) {
      filterExpression = "#status = :status";
      expressionNames = { "#status": "status" };
      expressionValues[":status"] = opts.status;
    }

    let exclusiveStartKey: Record<string, unknown> | undefined;
    if (opts.cursor) {
      exclusiveStartKey = JSON.parse(
        Buffer.from(opts.cursor, "base64url").toString("utf-8")
      );
    }

    const result = await docClient.send(
      new QueryCommand({
        TableName: tableName(),
        KeyConditionExpression: "pk = :pk AND begins_with(sk, :prefix)",
        ExpressionAttributeValues: expressionValues,
        FilterExpression: filterExpression,
        ExpressionAttributeNames: expressionNames,
        ExclusiveStartKey: exclusiveStartKey,
        Limit: limit + 1,
        ScanIndexForward: false,
      })
    );
    const items = (result.Items ?? []) as Event[];
    const hasMore = items.length > limit;
    const returnItems = hasMore ? items.slice(0, limit) : items;

    let cursor: string | null = null;
    if (hasMore && result.LastEvaluatedKey) {
      cursor = Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString(
        "base64url"
      );
    }

    return { items: returnItems, cursor, hasMore };
  },

  async updateStatus(
    eventId: string,
    status: EventStatus
  ): Promise<void> {
    const event = await events.getById(eventId);
    if (!event) return;

    const updateExpr: string[] = ["#status = :status"];
    const names: Record<string, string> = { "#status": "status" };
    const values: Record<string, unknown> = { ":status": status };

    if (status === "delivered") {
      updateExpr.push("deliveredAt = :deliveredAt");
      values[":deliveredAt"] = Date.now();
    }
    if (status === "processing") {
      updateExpr.push("processedAt = :processedAt");
      values[":processedAt"] = Date.now();
    }

    await docClient.send(
      new UpdateCommand({
        TableName: tableName(),
        Key: {
          pk: `SRC#${event.sourceId}`,
          sk: `EVT#${event.receivedAt}#${event.eventId}`,
        },
        UpdateExpression: `SET ${updateExpr.join(", ")}`,
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values,
      })
    );
  },
};
