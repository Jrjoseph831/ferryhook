import { Resource } from "sst";
import type { Plan } from "./types/index.js";

export interface PlanLimits {
  eventsPerMinute: number;
  eventsPerMonth: number;
  maxSources: number;
  maxConnectionsPerSource: number;
  retentionDays: number;
  retentionTtlSeconds: number;
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    eventsPerMinute: 100,
    eventsPerMonth: 5_000,
    maxSources: 3,
    maxConnectionsPerSource: 2,
    retentionDays: 1,
    retentionTtlSeconds: 86_400,
  },
  starter: {
    eventsPerMinute: 500,
    eventsPerMonth: 100_000,
    maxSources: 10,
    maxConnectionsPerSource: 5,
    retentionDays: 7,
    retentionTtlSeconds: 604_800,
  },
  pro: {
    eventsPerMinute: 2_000,
    eventsPerMonth: 1_000_000,
    maxSources: 50,
    maxConnectionsPerSource: 20,
    retentionDays: 30,
    retentionTtlSeconds: 2_592_000,
  },
  team: {
    eventsPerMinute: 10_000,
    eventsPerMonth: 5_000_000,
    maxSources: 200,
    maxConnectionsPerSource: 50,
    retentionDays: 90,
    retentionTtlSeconds: 7_776_000,
  },
};

export const RETRY_DELAYS_SECONDS = [0, 30, 120, 900, 3600, 14400, 43200, 86400];
export const MAX_RETRY_ATTEMPTS = 8;
export const SQS_MAX_DELAY_SECONDS = 900;

export function getConfig() {
  const r = Resource as unknown as Record<string, Record<string, string>>;
  return {
    mainTableName: r.MainTable.name,
    eventsTableName: r.EventsTable.name,
    processQueueUrl: r.ProcessQueue.url,
    deliverQueueUrl: r.DeliverQueue.url,
    jwtSecret: r.JwtSecret.value,
    hooksDomain: process.env.HOOKS_DOMAIN ?? "hooks.ferryhook.io",
    appUrl: process.env.APP_URL ?? "https://ferryhook.io",
  };
}
