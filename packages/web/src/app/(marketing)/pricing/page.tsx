import type { Metadata } from "next";
import Link from "next/link";
import { Check, X, Minus, ArrowRight } from "lucide-react";
import { PricingFaq } from "@/components/marketing/PricingFaq";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent webhook pricing. Start free with 1,000 events/month. Scale to 500,000+ events with the Team plan.",
};

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    events: "1,000 events/mo",
    cta: "Get Started Free",
    ctaLink: "/signup",
    highlight: false,
    note: "No credit card required",
  },
  {
    name: "Starter",
    price: "$9",
    period: "/month",
    events: "25,000 events/mo",
    cta: "Start Free Trial",
    ctaLink: "/signup",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    events: "100,000 events/mo",
    cta: "Start Free Trial",
    ctaLink: "/signup",
    highlight: true,
  },
  {
    name: "Team",
    price: "$39",
    period: "/month",
    events: "500,000 events/mo",
    cta: "Start Free Trial",
    ctaLink: "/signup",
    highlight: false,
  },
];

type FeatureValue = string | boolean;

interface ComparisonRow {
  feature: string;
  free: FeatureValue;
  starter: FeatureValue;
  pro: FeatureValue;
  team: FeatureValue;
}

const comparisonTable: ComparisonRow[] = [
  { feature: "Monthly events", free: "1,000", starter: "25,000", pro: "100,000", team: "500,000" },
  { feature: "Sources", free: "1", starter: "5", pro: "25", team: "Unlimited" },
  { feature: "Destinations", free: "1", starter: "10", pro: "50", team: "Unlimited" },
  { feature: "Event retention", free: "24 hours", starter: "7 days", pro: "30 days", team: "90 days" },
  { feature: "Retry attempts", free: "3", starter: "5", pro: "7", team: "7" },
  { feature: "Event replay", free: false, starter: true, pro: true, team: true },
  { feature: "Filters", free: true, starter: true, pro: true, team: true },
  { feature: "Transforms (field mapping)", free: false, starter: true, pro: true, team: true },
  { feature: "Transforms (JavaScript)", free: false, starter: false, pro: true, team: true },
  { feature: "Email alerts", free: false, starter: true, pro: true, team: true },
  { feature: "Custom response codes", free: false, starter: false, pro: true, team: true },
  { feature: "Signature verification", free: true, starter: true, pro: true, team: true },
  { feature: "CLI access", free: true, starter: true, pro: true, team: true },
  { feature: "API access", free: true, starter: true, pro: true, team: true },
  { feature: "Team members", free: "1", starter: "1", pro: "5", team: "Unlimited" },
  { feature: "Support", free: "Community", starter: "Email", pro: "Priority email", team: "Dedicated" },
  { feature: "Custom domains", free: false, starter: false, pro: false, team: true },
  { feature: "IP whitelisting", free: false, starter: false, pro: true, team: true },
];

function CellValue({ value }: { value: FeatureValue }) {
  if (value === true) return <Check className="mx-auto h-4 w-4 text-emerald-400" />;
  if (value === false) return <Minus className="mx-auto h-4 w-4 text-slate-700" />;
  return <span className="text-sm text-slate-300">{value}</span>;
}

export default function PricingPage() {
  return (
    <>
      {/* Header */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
            Pricing
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Start free. Scale as you grow. No hidden fees, no surprise charges.
            Every plan includes core features like signature verification, CLI, and API access.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border p-6 ${
                  plan.highlight
                    ? "border-blue-500/40 bg-blue-600/5 shadow-lg shadow-blue-900/10"
                    : "border-slate-800/60 bg-slate-900/20"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-0.5 text-xs font-semibold text-white">
                    Most Popular
                  </div>
                )}
                <h3 className="font-display text-sm font-semibold text-slate-300">{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-sm text-slate-500">{plan.period}</span>
                </div>
                <p className="mt-2 text-xs text-slate-500">{plan.events}</p>

                <Link
                  href={plan.ctaLink}
                  className={`mt-6 block rounded-lg py-2.5 text-center text-sm font-semibold transition-all ${
                    plan.highlight || plan.name === "Free"
                      ? "bg-blue-600 text-white hover:bg-blue-500"
                      : "border border-slate-700 text-slate-300 hover:border-slate-600 hover:text-white"
                  }`}
                >
                  {plan.cta}
                </Link>
                {plan.note && (
                  <p className="mt-2 text-center text-xs text-slate-600">{plan.note}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="border-t border-slate-800/40 py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-display text-2xl font-bold text-white sm:text-3xl">
            Full feature comparison
          </h2>

          <div className="mt-12 overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="pb-4 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Feature
                  </th>
                  {plans.map((p) => (
                    <th
                      key={p.name}
                      className={`pb-4 text-center text-xs font-semibold uppercase tracking-wider ${
                        p.highlight ? "text-blue-400" : "text-slate-500"
                      }`}
                    >
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {comparisonTable.map((row) => (
                  <tr key={row.feature} className="group transition-colors hover:bg-slate-900/30">
                    <td className="py-3.5 pr-4 text-sm text-slate-400">{row.feature}</td>
                    <td className="py-3.5 text-center"><CellValue value={row.free} /></td>
                    <td className="py-3.5 text-center"><CellValue value={row.starter} /></td>
                    <td className={`py-3.5 text-center ${plans[2].highlight ? "bg-blue-600/[0.02]" : ""}`}>
                      <CellValue value={row.pro} />
                    </td>
                    <td className="py-3.5 text-center"><CellValue value={row.team} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <PricingFaq />

      {/* Bottom CTA */}
      <section className="border-t border-slate-800/40 py-20">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="font-display text-2xl font-bold text-white">
            Ready to get started?
          </h2>
          <p className="mt-3 text-slate-400">
            Create a free account and start receiving webhooks in seconds.
          </p>
          <Link
            href="/signup"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500 hover:-translate-y-0.5"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
