import {
  GetCommand,
  PutCommand,
  UpdateCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient } from "./client.js";
import { getConfig } from "../config.js";
import { generateSourceId } from "../utils/id.js";
import type { Source, CreateSourceInput } from "../types/index.js";

function tableName(): string {
  return getConfig().mainTableName;
}

export const sources = {
  async create(input: CreateSourceInput): Promise<Source> {
    const now = new Date().toISOString();
    const sourceId = generateSourceId();
    const source: Source = {
      sourceId,
      userId: input.userId,
      name: input.name,
      provider: input.provider,
      signingSecret: input.signingSecret ?? null,
      signingAlgorithm: input.signingAlgorithm ?? "none",
      status: "active",
      eventCount: 0,
      lastEventAt: null,
      createdAt: now,
    };

    await docClient.send(
      new PutCommand({
        TableName: tableName(),
        Item: {
          pk: `USER#${input.userId}`,
          sk: `SRC#${sourceId}`,
          gsi3pk: `SRCID#${sourceId}`,
          gsi3sk: "SOURCE",
          ...source,
        },
      })
    );

    return source;
  },

  async getById(sourceId: string): Promise<Source | null> {
    const result = await docClient.send(
      new QueryCommand({
        TableName: tableName(),
        IndexName: "gsi3",
        KeyConditionExpression: "gsi3pk = :pk AND gsi3sk = :sk",
        ExpressionAttributeValues: {
          ":pk": `SRCID#${sourceId}`,
          ":sk": "SOURCE",
        },
        Limit: 1,
      })
    );
    return (result.Items?.[0] as Source) ?? null;
  },

  async listByUser(userId: string): Promise<Source[]> {
    const result = await docClient.send(
      new QueryCommand({
        TableName: tableName(),
        KeyConditionExpression: "pk = :pk AND begins_with(sk, :prefix)",
        ExpressionAttributeValues: {
          ":pk": `USER#${userId}`,
          ":prefix": "SRC#",
        },
      })
    );
    return (result.Items as Source[]) ?? [];
  },

  async update(
    sourceId: string,
    userId: string,
    updates: Partial<Omit<Source, "sourceId" | "userId" | "createdAt">>
  ): Promise<Source> {
    const expressions: string[] = [];
    const names: Record<string, string> = {};
    const values: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined) continue;
      expressions.push(`#${key} = :${key}`);
      names[`#${key}`] = key;
      values[`:${key}`] = value;
    }

    if (expressions.length === 0) {
      const existing = await sources.getById(sourceId);
      if (!existing) throw new Error("Source not found");
      return existing;
    }

    const result = await docClient.send(
      new UpdateCommand({
        TableName: tableName(),
        Key: { pk: `USER#${userId}`, sk: `SRC#${sourceId}` },
        UpdateExpression: `SET ${expressions.join(", ")}`,
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values,
        ReturnValues: "ALL_NEW",
      })
    );

    return result.Attributes as Source;
  },

  async delete(sourceId: string, userId: string): Promise<void> {
    await docClient.send(
      new UpdateCommand({
        TableName: tableName(),
        Key: { pk: `USER#${userId}`, sk: `SRC#${sourceId}` },
        UpdateExpression: "SET #status = :status",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: { ":status": "deleted" },
      })
    );
  },
};
