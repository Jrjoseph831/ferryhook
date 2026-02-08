import {
  PutCommand,
  UpdateCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient } from "./client.js";
import { getConfig } from "../config.js";
import { generateApiKeyId } from "../utils/id.js";
import { generateApiKeyRaw, hashApiKey } from "../utils/crypto.js";
import type { ApiKey, CreateApiKeyInput } from "../types/index.js";

function tableName(): string {
  return getConfig().mainTableName;
}

export const apiKeys = {
  async create(
    userId: string,
    input: CreateApiKeyInput
  ): Promise<{ key: string; apiKey: ApiKey }> {
    const keyId = generateApiKeyId();
    const rawKey = generateApiKeyRaw();
    const keyHash = hashApiKey(rawKey);
    const keyPrefix = rawKey.substring(0, 16);
    const now = new Date().toISOString();

    const apiKey: ApiKey = {
      keyId,
      userId,
      name: input.name,
      keyHash,
      keyPrefix,
      permissions: input.permissions,
      lastUsedAt: null,
      createdAt: now,
    };

    await docClient.send(
      new PutCommand({
        TableName: tableName(),
        Item: {
          pk: `USER#${userId}`,
          sk: `KEY#${keyId}`,
          gsi2pk: `KEYHASH#${keyHash}`,
          gsi2sk: "KEY",
          ...apiKey,
        },
      })
    );

    return { key: rawKey, apiKey };
  },

  async getByHash(keyHash: string): Promise<ApiKey | null> {
    const result = await docClient.send(
      new QueryCommand({
        TableName: tableName(),
        IndexName: "gsi2",
        KeyConditionExpression: "gsi2pk = :pk AND gsi2sk = :sk",
        ExpressionAttributeValues: {
          ":pk": `KEYHASH#${keyHash}`,
          ":sk": "KEY",
        },
        Limit: 1,
      })
    );
    return (result.Items?.[0] as ApiKey) ?? null;
  },

  async listByUser(userId: string): Promise<ApiKey[]> {
    const result = await docClient.send(
      new QueryCommand({
        TableName: tableName(),
        KeyConditionExpression: "pk = :pk AND begins_with(sk, :prefix)",
        ExpressionAttributeValues: {
          ":pk": `USER#${userId}`,
          ":prefix": "KEY#",
        },
      })
    );
    return (result.Items as ApiKey[]) ?? [];
  },

  async delete(keyId: string, userId: string): Promise<void> {
    await docClient.send(
      new UpdateCommand({
        TableName: tableName(),
        Key: { pk: `USER#${userId}`, sk: `KEY#${keyId}` },
        UpdateExpression: "REMOVE gsi2pk, gsi2sk",
      })
    );
  },

  async updateLastUsed(keyId: string, userId: string): Promise<void> {
    await docClient.send(
      new UpdateCommand({
        TableName: tableName(),
        Key: { pk: `USER#${userId}`, sk: `KEY#${keyId}` },
        UpdateExpression: "SET lastUsedAt = :now",
        ExpressionAttributeValues: { ":now": new Date().toISOString() },
      })
    );
  },
};
