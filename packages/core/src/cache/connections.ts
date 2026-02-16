import { getRedisClient } from "./client.js";
import { connections } from "../db/connections.js";
import type { Connection } from "../types/index.js";

const CONN_TTL_SECONDS = 60; // 1 minute
const KEY_PREFIX = "conns:";

export const connectionCache = {
  async getCachedConnections(sourceId: string): Promise<Connection[]> {
    const redis = getRedisClient();
    try {
      const cached = await redis.get(`${KEY_PREFIX}${sourceId}`);
      if (cached) {
        return JSON.parse(cached) as Connection[];
      }
    } catch (err) {
      console.error(
        JSON.stringify({
          level: "warn",
          message: "Redis connection cache read failed, falling back to DynamoDB",
          sourceId,
          error: String(err),
        })
      );
    }

    // Cache miss — load from DynamoDB
    const conns = await connections.listBySource(sourceId);
    try {
      const r = getRedisClient();
      await r.setex(
        `${KEY_PREFIX}${sourceId}`,
        CONN_TTL_SECONDS,
        JSON.stringify(conns)
      );
    } catch {
      // Non-fatal
    }
    return conns;
  },

  async invalidateConnections(sourceId: string): Promise<void> {
    try {
      const redis = getRedisClient();
      await redis.del(`${KEY_PREFIX}${sourceId}`);
    } catch {
      // Non-fatal
    }
  },
};
