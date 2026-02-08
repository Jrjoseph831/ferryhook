import {
  GetCommand,
  PutCommand,
  UpdateCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient } from "./client.js";
import { getConfig } from "../config.js";
import { generateUserId } from "../utils/id.js";
import type { User, CreateUserInput } from "../types/index.js";

function tableName(): string {
  return getConfig().mainTableName;
}

export const users = {
  async create(input: CreateUserInput): Promise<User> {
    const now = new Date().toISOString();
    const userId = generateUserId();
    const user: User = {
      userId,
      email: input.email,
      name: input.name,
      passwordHash: input.passwordHash,
      plan: "free",
      stripeCustomerId: null,
      stripeSubId: null,
      githubId: input.githubId ?? null,
      googleId: input.googleId ?? null,
      usageThisMonth: 0,
      usagePeriodStart: now.substring(0, 10),
      createdAt: now,
      updatedAt: now,
    };

    await docClient.send(
      new PutCommand({
        TableName: tableName(),
        Item: {
          pk: `USER#${userId}`,
          sk: "PROFILE",
          gsi1pk: `EMAIL#${input.email}`,
          gsi1sk: "USER",
          ...user,
        },
        ConditionExpression: "attribute_not_exists(pk)",
      })
    );

    return user;
  },

  async getById(userId: string): Promise<User | null> {
    const result = await docClient.send(
      new GetCommand({
        TableName: tableName(),
        Key: { pk: `USER#${userId}`, sk: "PROFILE" },
      })
    );
    return (result.Item as User) ?? null;
  },

  async getByEmail(email: string): Promise<User | null> {
    const result = await docClient.send(
      new QueryCommand({
        TableName: tableName(),
        IndexName: "gsi1",
        KeyConditionExpression: "gsi1pk = :pk AND gsi1sk = :sk",
        ExpressionAttributeValues: {
          ":pk": `EMAIL#${email}`,
          ":sk": "USER",
        },
        Limit: 1,
      })
    );
    return (result.Items?.[0] as User) ?? null;
  },

  async update(
    userId: string,
    updates: Partial<Omit<User, "userId" | "createdAt">>
  ): Promise<User> {
    const expressions: string[] = [];
    const names: Record<string, string> = {};
    const values: Record<string, unknown> = {};

    const updatedFields = { ...updates, updatedAt: new Date().toISOString() };

    for (const [key, value] of Object.entries(updatedFields)) {
      if (value === undefined) continue;
      expressions.push(`#${key} = :${key}`);
      names[`#${key}`] = key;
      values[`:${key}`] = value;
    }

    const result = await docClient.send(
      new UpdateCommand({
        TableName: tableName(),
        Key: { pk: `USER#${userId}`, sk: "PROFILE" },
        UpdateExpression: `SET ${expressions.join(", ")}`,
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values,
        ReturnValues: "ALL_NEW",
      })
    );

    return result.Attributes as User;
  },

  async incrementUsage(userId: string, count = 1): Promise<void> {
    await docClient.send(
      new UpdateCommand({
        TableName: tableName(),
        Key: { pk: `USER#${userId}`, sk: "PROFILE" },
        UpdateExpression: "SET usageThisMonth = usageThisMonth + :inc",
        ExpressionAttributeValues: { ":inc": count },
      })
    );
  },
};
