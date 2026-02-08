import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { jwt, apiKeys, users, hashApiKey } from "@ferryhook/core";
import type { Plan } from "@ferryhook/core";

export interface AuthContext {
  userId: string;
  email: string;
  plan: Plan;
}

export async function authenticate(
  event: APIGatewayProxyEventV2
): Promise<AuthContext | null> {
  const authHeader = event.headers["authorization"] ?? event.headers["Authorization"];
  if (!authHeader) return null;

  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return null;

  // API key authentication
  if (token.startsWith("fh_live_")) {
    return authenticateApiKey(token);
  }

  // JWT authentication
  return authenticateJwt(token);
}

async function authenticateJwt(token: string): Promise<AuthContext | null> {
  try {
    const payload = await jwt.verifyAccessToken(token);
    return {
      userId: payload.sub,
      email: payload.email,
      plan: payload.plan,
    };
  } catch {
    return null;
  }
}

async function authenticateApiKey(key: string): Promise<AuthContext | null> {
  try {
    const keyHash = hashApiKey(key);
    const apiKey = await apiKeys.getByHash(keyHash);
    if (!apiKey) return null;

    // Update last used timestamp (fire-and-forget)
    apiKeys.updateLastUsed(apiKey.keyId, apiKey.userId).catch(() => {});

    const user = await users.getById(apiKey.userId);
    if (!user) return null;

    return {
      userId: user.userId,
      email: user.email,
      plan: user.plan,
    };
  } catch {
    return null;
  }
}
