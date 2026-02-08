import {
  PutCommand,
  UpdateCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient } from "./client.js";
import { getConfig } from "../config.js";
import { generateConnectionId } from "../utils/id.js";
import { randomBytes } from "crypto";
import type { Connection, CreateConnectionInput } from "../types/index.js";

function tableName(): string {
  return getConfig().mainTableName;
}

export const connections = {
  async create(input: CreateConnectionInput): Promise<Connection> {
    const now = new Date().toISOString();
    const connectionId = generateConnectionId();
    const signingSecret = randomBytes(32).toString("hex");

    const connection: Connection = {
      connectionId,
      sourceId: input.sourceId,
      userId: input.userId,
      name: input.name,
      destinationUrl: input.destinationUrl,
      signingSecret,
      filters: input.filters ?? null,
      transform: input.transform ?? null,
      retryConfig: input.retryConfig ?? null,
      status: "active",
      deliveryCount: 0,
      failureCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    await docClient.send(
      new PutCommand({
        TableName: tableName(),
        Item: {
          pk: `SRC#${input.sourceId}`,
          sk: `CONN#${connectionId}`,
          ...connection,
          filters: input.filters ? JSON.stringify(input.filters) : null,
          transform: input.transform ? JSON.stringify(input.transform) : null,
          retryConfig: input.retryConfig ? JSON.stringify(input.retryConfig) : null,
        },
      })
    );

    return connection;
  },

  async listBySource(sourceId: string): Promise<Connection[]> {
    const result = await docClient.send(
      new QueryCommand({
        TableName: tableName(),
        KeyConditionExpression: "pk = :pk AND begins_with(sk, :prefix)",
        ExpressionAttributeValues: {
          ":pk": `SRC#${sourceId}`,
          ":prefix": "CONN#",
        },
      })
    );

    return (result.Items ?? []).map((item) => ({
      ...item,
      filters: item.filters ? JSON.parse(item.filters as string) : null,
      transform: item.transform ? JSON.parse(item.transform as string) : null,
      retryConfig: item.retryConfig ? JSON.parse(item.retryConfig as string) : null,
    })) as Connection[];
  },

  async update(
    connectionId: string,
    sourceId: string,
    updates: Partial<Omit<Connection, "connectionId" | "sourceId" | "userId" | "createdAt">>
  ): Promise<Connection> {
    const expressions: string[] = [];
    const names: Record<string, string> = {};
    const values: Record<string, unknown> = {};

    const updatedFields = { ...updates, updatedAt: new Date().toISOString() };

    for (const [key, value] of Object.entries(updatedFields)) {
      if (value === undefined) continue;
      expressions.push(`#${key} = :${key}`);
      names[`#${key}`] = key;
      if (key === "filters" || key === "transform" || key === "retryConfig") {
        values[`:${key}`] = value ? JSON.stringify(value) : null;
      } else {
        values[`:${key}`] = value;
      }
    }

    const result = await docClient.send(
      new UpdateCommand({
        TableName: tableName(),
        Key: { pk: `SRC#${sourceId}`, sk: `CONN#${connectionId}` },
        UpdateExpression: `SET ${expressions.join(", ")}`,
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values,
        ReturnValues: "ALL_NEW",
      })
    );

    const item = result.Attributes as Record<string, unknown>;
    return {
      ...item,
      filters: item.filters ? JSON.parse(item.filters as string) : null,
      transform: item.transform ? JSON.parse(item.transform as string) : null,
      retryConfig: item.retryConfig ? JSON.parse(item.retryConfig as string) : null,
    } as Connection;
  },

  async delete(connectionId: string, sourceId: string): Promise<void> {
    await docClient.send(
      new UpdateCommand({
        TableName: tableName(),
        Key: { pk: `SRC#${sourceId}`, sk: `CONN#${connectionId}` },
        UpdateExpression: "SET #status = :status, updatedAt = :now",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: {
          ":status": "deleted",
          ":now": new Date().toISOString(),
        },
      })
    );
  },
};
