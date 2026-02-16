import { users } from "../db/users.js";
import { sources } from "../db/sources.js";
import { connections } from "../db/connections.js";
import { PLAN_LIMITS } from "../config.js";
import type { Plan } from "../types/index.js";

export interface EnforcementResult {
  allowed: boolean;
  reason?: string;
}

export async function enforcePlanLimits(
  userId: string,
  action: "create_source" | "create_connection",
  sourceId?: string
): Promise<EnforcementResult> {
  const user = await users.getById(userId);
  if (!user) return { allowed: false, reason: "User not found" };

  const limits = PLAN_LIMITS[user.plan as Plan];

  if (action === "create_source") {
    const userSources = await sources.listByUser(userId);
    const active = userSources.filter((s) => s.status !== "deleted");
    if (active.length >= limits.maxSources) {
      return {
        allowed: false,
        reason: `Source limit reached (${limits.maxSources} on ${user.plan} plan)`,
      };
    }
  }

  if (action === "create_connection" && sourceId) {
    const conns = await connections.listBySource(sourceId);
    const active = conns.filter((c) => c.status !== "deleted");
    if (active.length >= limits.maxConnectionsPerSource) {
      return {
        allowed: false,
        reason: `Connection limit reached (${limits.maxConnectionsPerSource} per source on ${user.plan} plan)`,
      };
    }
  }

  return { allowed: true };
}
