import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "./client.js";
import { getConfig } from "../config.js";
import type { Attempt, CreateAttemptInput } from "../types/index.js";

function tableName(): string {
  return getConfig().eventsTableName;
}

export const attempts = {
  async create(
    eventId: string,
    attemptNumber: number,
    input: CreateAttemptInput
  ): Promise<Attempt> {
    const attempt: Attempt = {
      eventId,
      connectionId: input.connectionId,
      attemptNumber,
      destinationUrl: input.destinationUrl,
      statusCode: input.statusCode,
      responseBody: input.responseBody?.substring(0, 1000) ?? null,
      latencyMs: input.latencyMs,
      error: input.error ?? null,
      attemptedAt: Date.now(),
    };

    await docClient.send(
      new PutCommand({
        TableName: tableName(),
        Item: {
          pk: `EVT#${eventId}`,
          sk: `ATT#${attemptNumber}`,
          ...attempt,
        },
      })
    );

    return attempt;
  },

  async listByEvent(eventId: string): Promise<Attempt[]> {
    const result = await docClient.send(
      new QueryCommand({
        TableName: tableName(),
        KeyConditionExpression: "pk = :pk AND begins_with(sk, :prefix)",
        ExpressionAttributeValues: {
          ":pk": `EVT#${eventId}`,
          ":prefix": "ATT#",
        },
      })
    );
    return (result.Items as Attempt[]) ?? [];
  },
};
