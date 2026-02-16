import Redis from "ioredis";
import { getConfig } from "../config.js";

let client: Redis | null = null;

export function getRedisClient(): Redis {
  if (client) return client;

  const config = getConfig();
  client = new Redis(config.redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 5) return null;
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
    connectTimeout: 5000,
    commandTimeout: 3000,
  });

  client.on("error", (err) => {
    console.error(
      JSON.stringify({
        level: "error",
        message: "Redis connection error",
        error: String(err),
      })
    );
  });

  return client;
}
