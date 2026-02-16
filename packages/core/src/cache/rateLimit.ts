import { getRedisClient } from "./client.js";
import { PLAN_LIMITS } from "../config.js";
import type { Plan } from "../types/index.js";

const KEY_PREFIX = "rl:";

export async function checkRateLimit(
  sourceId: string,
  plan: Plan
): Promise<boolean> {
  const limit = PLAN_LIMITS[plan].eventsPerMinute;
  const key = `${KEY_PREFIX}${sourceId}`;
  const now = Date.now();
  const windowStart = now - 60_000;

  const redis = getRedisClient();
  try {
    const pipeline = redis.pipeline();
    // Remove entries outside the 1-minute window
    pipeline.zremrangebyscore(key, 0, windowStart);
    // Count entries in current window
    pipeline.zcard(key);
    // Add current request
    pipeline.zadd(key, now, `${now}:${Math.random()}`);
    // Set TTL so the key auto-expires
    pipeline.expire(key, 120);

    const results = await pipeline.exec();
    if (!results) return true; // Redis failure — allow

    const currentCount = results[1]?.[1] as number;
    return currentCount < limit;
  } catch (err) {
    console.error(
      JSON.stringify({
        level: "warn",
        message: "Rate limit check failed, allowing request",
        sourceId,
        error: String(err),
      })
    );
    return true; // Fail open — don't block if Redis is down
  }
}
