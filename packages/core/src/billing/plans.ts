import type { Plan } from "../types/index.js";

export interface PlanDefinition {
  name: string;
  plan: Plan;
  stripePriceId: string;
  monthlyPrice: number;
  features: string[];
}

export const PLAN_DEFINITIONS: Record<Plan, PlanDefinition> = {
  free: {
    name: "Free",
    plan: "free",
    stripePriceId: "",
    monthlyPrice: 0,
    features: [
      "5,000 events/month",
      "3 sources",
      "2 connections per source",
      "1-day retention",
      "Community support",
    ],
  },
  starter: {
    name: "Starter",
    plan: "starter",
    stripePriceId: process.env.STRIPE_PRICE_STARTER ?? "",
    monthlyPrice: 9,
    features: [
      "100,000 events/month",
      "10 sources",
      "5 connections per source",
      "7-day retention",
      "Email support",
    ],
  },
  pro: {
    name: "Pro",
    plan: "pro",
    stripePriceId: process.env.STRIPE_PRICE_PRO ?? "",
    monthlyPrice: 29,
    features: [
      "1,000,000 events/month",
      "50 sources",
      "20 connections per source",
      "30-day retention",
      "Priority support",
      "Custom transformations",
    ],
  },
  team: {
    name: "Team",
    plan: "team",
    stripePriceId: process.env.STRIPE_PRICE_TEAM ?? "",
    monthlyPrice: 79,
    features: [
      "5,000,000 events/month",
      "200 sources",
      "50 connections per source",
      "90-day retention",
      "Dedicated support",
      "SSO & team management",
    ],
  },
};

export function getPlanByPriceId(priceId: string): Plan | null {
  for (const [plan, def] of Object.entries(PLAN_DEFINITIONS)) {
    if (def.stripePriceId === priceId) return plan as Plan;
  }
  return null;
}
