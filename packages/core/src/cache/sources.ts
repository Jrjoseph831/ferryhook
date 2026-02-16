import { getRedisClient } from "./client.js";
import { sources } from "../db/sources.js";
import type { Source } from "../types/index.js";

const SOURCE_TTL_SECONDS = 300; // 5 minutes
const KEY_PREFIX = "src:";

export const sourceCache = {
  async getCachedSource(sourceId: string): Promise<Source | null> {
    const redis = getRedisClient();
    try {
      const cached = await redis.get(`${KEY_PREFIX}${sourceId}`);
      if (cached) {
        return JSON.parse(cached) as Source;
      }
    } catch (err) {
      console.error(
        JSON.stringify({
          level: "warn",
          message: "Redis source cache read failed, falling back to DynamoDB",
          sourceId,
          error: String(err),
        })
      );
    }

    // Cache miss — load from DynamoDB
    const source = await sources.getById(sourceId);
    if (source) {
      try {
        const r = getRedisClient();
        await r.setex(
          `${KEY_PREFIX}${sourceId}`,
          SOURCE_TTL_SECONDS,
          JSON.stringify(source)
        );
      } catch {
        // Non-fatal: cache write failure
      }
    }
    return source;
  },

  async invalidateSource(sourceId: string): Promise<void> {
    try {
      const redis = getRedisClient();
      await redis.del(`${KEY_PREFIX}${sourceId}`);
    } catch {
      // Non-fatal: cache invalidation failure
    }
  },
};
