"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Link2,
  ArrowUpRight,
  ShieldCheck,
  Check,
  Minus,
  AlertTriangle,
  RefreshCw,
  Activity,
  Code2,
  Lock,
  TerminalSquare,
  Braces,
  Copy,
  Zap,
  DollarSign,
  Server,
  Wrench,
} from "lucide-react";
import { useReveal } from "@/hooks/useReveal";

/* ─── Comparison table data (category-based, no competitor names) ─── */

type CellValue = string | boolean | "warning";

interface ComparisonRow {
  feature: string;
  testing: CellValue;
  enterprise: CellValue;
  diy: CellValue;
  ferryhook: CellValue;
}

const comparisonRows: ComparisonRow[] = [
  { feature: "Production relay", testing: false, enterprise: true, diy: "warning", ferryhook: true },
  { feature: "Automatic retries", testing: false, enterprise: true, diy: "warning", ferryhook: true },
  { feature: "Payload transforms", testing: false, enterprise: true, diy: "warning", ferryhook: true },
  { feature: "Real-time dashboard", testing: "Limited", enterprise: true, diy: false, ferryhook: true },
  { feature: "CLI for local dev", testing: false, enterprise: "Some", diy: false, ferryhook: true },
  { feature: "Signature verification", testing: false, enterprise: true, diy: "warning", ferryhook: true },
  { feature: "Event replay", testing: false, enterprise: true, diy: "warning", ferryhook: true },
  { feature: "API access", testing: true, enterprise: true, diy: "N/A", ferryhook: true },
  { feature: "Starting price", testing: "Free", enterprise: "$39+/mo", diy: "$0 + your time", ferryhook: "Free" },
  { feature: "Production-ready price", testing: "N/A", enterprise: "$39-490/mo", diy: "2-3 wks eng time", ferryhook: "$9/mo" },
];

/* ─── Setup code snippet (short, 4 lines) ─── */

const setupCode = `# Point your provider to your Ferryhook URL
# https://in.ferryhook.io/src_abc123

# Your webhooks are now queued, retried, and logged.
# Set up a destination in the dashboard or via API.`;

/* ─── Plans data ─── */

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    events: "1,000 events/mo",
    cta: "Get Started Free",
    ctaLink: "/signup",
    highlight: false,
    features: ["1 source", "1 destination", "24-hour event retention", "Community support"],
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
    features: ["5 sources", "10 destinations", "7-day retention", "Email alerts"],
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    events: "100,000 events/mo",
    cta: "Start Free Trial",
    ctaLink: "/signup",
    highlight: true,
    features: ["25 sources", "50 destinations", "30-day retention", "Custom transforms"],
  },
  {
    name: "Team",
    price: "$39",
    period: "/month",
    events: "500,000 events/mo",
    cta: "Start Free Trial",
    ctaLink: "/signup",
    highlight: false,
    features: ["Unlimited sources", "Unlimited destinations", "90-day retention", "Priority support"],
  },
];

const integrations = [
  "Stripe", "GitHub", "Shopify", "Twilio", "SendGrid", "Slack", "Discord", "Linear",
  "Vercel", "Supabase", "Clerk", "Resend", "Svix", "PayPal", "Square", "Paddle",
  "Lemon Squeezy", "GitLab", "Bitbucket", "Jira",
];

/* ─── Shared components ─── */

function Section({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useReveal();
  return (
    <section ref={ref} id={id} className={`reveal-section ${className}`}>
      {children}
    </section>
  );
}

function ComparisonCellValue({ value }: { value: CellValue }) {
  if (value === true) return <Check className="mx-auto h-4 w-4 text-emerald-400" />;
  if (value === false) return <Minus className="mx-auto h-4 w-4 text-slate-700" />;
  if (value === "warning") return <AlertTriangle className="mx-auto h-4 w-4 text-amber-500/70" />;
  if (value === "N/A") return <span className="text-xs text-slate-600">N/A</span>;
  return <span className="text-xs text-slate-300">{value}</span>;
}

function SetupCodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const lines = code.split("\n");

  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-800 bg-[#0a0f1c]">
      <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-slate-700" />
            <div className="h-2.5 w-2.5 rounded-full bg-slate-700" />
            <div className="h-2.5 w-2.5 rounded-full bg-slate-700" />
          </div>
          <span className="ml-2 font-mono text-[11px] text-slate-600">terminal</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-slate-500 transition-all hover:bg-slate-800 hover:text-slate-300"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
        <code>
          {lines.map((line, i) => {
            if (line.trimStart().startsWith("#")) {
              return (
                <span key={i} className="block text-slate-500">
                  {line}
                </span>
              );
            }
            if (line.trimStart().startsWith("$")) {
              const rest = line.replace(/^\$\s*/, "");
              return (
                <span key={i} className="block">
                  <span className="text-emerald-400">$ </span>
                  <span className="text-slate-200">{rest}</span>
                </span>
              );
            }
            return (
              <span key={i} className="block text-slate-400">
                {line}
              </span>
            );
          })}
        </code>
      </pre>
    </div>
  );
}

/* ─── Main export ─── */

export function HomepageSections() {
  return (
    <>
      {/* HOW IT WORKS */}
      <Section className="py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
              How it works
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
              Three steps. That&apos;s it.
            </h2>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Link2,
                step: "01",
                title: "Get a URL",
                description:
                  "Create a source and get a unique webhook URL in seconds. No configuration needed.",
              },
              {
                icon: ArrowUpRight,
                step: "02",
                title: "Point your webhooks",
                description:
                  "Tell Stripe, GitHub, or whatever service to send webhooks to your Ferryhook URL. Done.",
              },
              {
                icon: ShieldCheck,
                step: "03",
                title: "Relax",
                description:
                  "We queue it, verify the signature, retry if your server is down, and log everything. You sleep.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="group relative rounded-2xl border border-slate-800/60 bg-slate-900/30 p-8 transition-all hover:border-slate-700/60 hover:bg-slate-900/50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10 text-blue-400 transition-colors group-hover:bg-blue-600/15">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-xs text-slate-600">{item.step}</span>
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* WHY FERRYHOOK */}
      <Section className="py-24 sm:py-32 border-t border-slate-800/40" id="features">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
              Why Ferryhook
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl text-balance">
              Reliable webhooks.
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                Finally affordable.
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-400">
              Most webhook platforms price for enterprise teams with enterprise budgets.
              We built Ferryhook for developers who actually pay their own bills.
              Plans start free. Paid plans from $9/mo.
            </p>
          </div>

          {/* Price anchor */}
          <div className="mx-auto mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-6">
            <div className="flex items-center gap-3 rounded-lg border border-slate-800/60 bg-slate-900/30 px-5 py-3">
              <span className="text-sm text-slate-500">Other webhook tools</span>
              <span className="rounded-md bg-slate-800 px-2.5 py-0.5 font-mono text-xs font-semibold text-slate-400">
                $39 - $490/mo
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-5 py-3 shadow-lg shadow-emerald-900/10">
              <Zap className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-semibold text-white">Ferryhook</span>
              <span className="rounded-md bg-emerald-500/15 px-2.5 py-0.5 font-mono text-xs font-bold text-emerald-400">
                $0 - $19/mo
              </span>
            </div>
          </div>

          {/* Three value props */}
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: DollarSign,
                label: "Not enterprise pricing",
                detail: "Most webhook platforms price for large teams. We don't. You get retries, transforms, and a real dashboard for less than a Netflix subscription.",
              },
              {
                icon: Server,
                label: "Not just a testing tool",
                detail: "Free webhook testing tools are great for debugging. But they won't retry failed deliveries, queue events when your server is down, or alert you when something breaks. We do all of that.",
              },
              {
                icon: Wrench,
                label: "Not self-hosted complexity",
                detail: "Some tools want you to deploy and maintain the infrastructure yourself. We handle all of it. You get an endpoint, a dashboard, and an API. No servers, no Docker, no ops work.",
              },
            ].map((prop) => (
              <div
                key={prop.label}
                className="rounded-xl border border-slate-800/50 bg-slate-900/20 p-6"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800/80 text-slate-400">
                  <prop.icon className="h-4 w-4" />
                </div>
                <h3 className="mt-4 font-display text-sm font-semibold text-white">
                  {prop.label}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {prop.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* CORE FEATURES */}
      <Section className="py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
              Core features
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
              What you actually get
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-400">
              No buzzwords. Here&apos;s what Ferryhook does when a webhook hits your endpoint.
            </p>
          </div>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Card 1: Zero-Loss Guarantee */}
            <div className="group relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-slate-900/20 transition-all hover:bg-slate-900/40">
              <div className="h-[2px] bg-gradient-to-r from-emerald-500 to-teal-400" />
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                    <RefreshCw className="h-4 w-4" />
                  </div>
                  <h3 className="font-display text-base font-semibold text-white">
                    Zero-Loss Guarantee
                  </h3>
                </div>
                <p className="mt-4 text-[13px] leading-relaxed text-slate-400">
                  Your webhook hits our endpoint. We store it in a durable queue immediately, before we even try to deliver it. If your server is down, we retry 7 times over 41 hours with exponential backoff. If it still fails, the event goes to a dead letter queue. Nothing gets silently dropped. Ever.
                </p>
                <div className="mt-4 rounded-lg bg-slate-800/40 px-3 py-2">
                  <p className="text-xs text-slate-500">
                    <span className="font-semibold text-slate-400">vs. alternatives: </span>
                    Free testing tools drop events after a few hundred requests. DIY setups lose events during deploys.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Real-Time Event Stream */}
            <div className="group relative overflow-hidden rounded-2xl border border-blue-500/20 bg-slate-900/20 transition-all hover:bg-slate-900/40">
              <div className="h-[2px] bg-gradient-to-r from-blue-500 to-cyan-400" />
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                    <Activity className="h-4 w-4" />
                  </div>
                  <h3 className="font-display text-base font-semibold text-white">
                    Real-Time Event Stream
                  </h3>
                </div>
                <p className="mt-4 text-[13px] leading-relaxed text-slate-400">
                  Every webhook shows up live in your dashboard. Full payload, headers, response time. Something fail? Click replay. Need to find a specific event from yesterday? Search by source, status, or time range.
                </p>
                <div className="mt-4 rounded-lg bg-slate-800/40 px-3 py-2">
                  <p className="text-xs text-slate-500">
                    <span className="font-semibold text-slate-400">vs. alternatives: </span>
                    Some tools lock your dashboard when you exceed free tier limits. Ours stays open.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: Payload Transformations */}
            <div className="group relative overflow-hidden rounded-2xl border border-violet-500/20 bg-slate-900/20 transition-all hover:bg-slate-900/40">
              <div className="h-[2px] bg-gradient-to-r from-violet-500 to-purple-400" />
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                    <Code2 className="h-4 w-4" />
                  </div>
                  <h3 className="font-display text-base font-semibold text-white">
                    Payload Transformations
                  </h3>
                </div>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-start gap-2 text-[13px] leading-relaxed text-slate-400">
                    <div className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-violet-500/10 text-violet-400" />
                    Write JavaScript functions that reshape payloads before delivery
                  </li>
                  <li className="flex items-start gap-2 text-[13px] leading-relaxed text-slate-400">
                    <div className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-violet-500/10 text-violet-400" />
                    Filter events. Only forward <code className="text-violet-300 text-xs">payment.succeeded</code>, skip the rest.
                  </li>
                  <li className="flex items-start gap-2 text-[13px] leading-relaxed text-slate-400">
                    <div className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-violet-500/10 text-violet-400" />
                    Route one source to multiple destinations with different transforms
                  </li>
                </ul>
                <div className="mt-4 rounded-lg bg-slate-800/40 px-3 py-2">
                  <p className="text-xs text-slate-500">
                    <span className="font-semibold text-slate-400">vs. alternatives: </span>
                    Most tools under $20/mo don&apos;t let you transform payloads. We do.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 4: Signature Verification */}
            <div className="group relative overflow-hidden rounded-2xl border border-amber-500/20 bg-slate-900/20 transition-all hover:bg-slate-900/40">
              <div className="h-[2px] bg-gradient-to-r from-amber-500 to-orange-400" />
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <h3 className="font-display text-base font-semibold text-white">
                    Signature Verification
                  </h3>
                </div>
                <p className="mt-4 text-[13px] leading-relaxed text-slate-400">
                  You know that thing where Stripe sends a signature header and you have to verify it yourself? We do that automatically. Stripe, GitHub, Shopify, Twilio. We also sign every outbound delivery with HMAC-SHA256 so your server can verify it came from us.
                </p>
                <div className="mt-4 rounded-lg bg-slate-800/40 px-3 py-2">
                  <p className="text-xs text-slate-500">
                    <span className="font-semibold text-slate-400">vs. alternatives: </span>
                    Many webhook tools skip signature verification entirely. That&apos;s a security gap.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 5: CLI for Local Development */}
            <div className="group relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-slate-900/20 transition-all hover:bg-slate-900/40">
              <div className="h-[2px] bg-gradient-to-r from-cyan-500 to-sky-400" />
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                    <TerminalSquare className="h-4 w-4" />
                  </div>
                  <h3 className="font-display text-base font-semibold text-white">
                    CLI for Local Dev
                  </h3>
                </div>
                <p className="mt-4 text-[13px] leading-relaxed text-slate-400">
                  Run <code className="text-cyan-300 text-xs">ferryhook listen</code> and your production webhooks show up on localhost. No ngrok. No tunnels. No port forwarding. Multiple devs can tap into the same webhook stream without stepping on each other.
                </p>
                <div className="mt-4 rounded-lg bg-slate-800/40 px-3 py-2">
                  <p className="text-xs text-slate-500">
                    <span className="font-semibold text-slate-400">vs. alternatives: </span>
                    Other platforms offer this too, but not at this price point.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 6: Full REST API */}
            <div className="group relative overflow-hidden rounded-2xl border border-rose-500/20 bg-slate-900/20 transition-all hover:bg-slate-900/40">
              <div className="h-[2px] bg-gradient-to-r from-rose-500 to-pink-400" />
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400">
                    <Braces className="h-4 w-4" />
                  </div>
                  <h3 className="font-display text-base font-semibold text-white">
                    Full REST API
                  </h3>
                </div>
                <p className="mt-4 text-[13px] leading-relaxed text-slate-400">
                  Everything you can do in the dashboard, you can do via API. Create sources, manage connections, replay events, pull analytics. Great for CI/CD pipelines or if you just prefer curl over clicking buttons.
                </p>
                <div className="mt-4 rounded-lg bg-slate-800/40 px-3 py-2">
                  <p className="text-xs text-slate-500">
                    <span className="font-semibold text-slate-400">vs. alternatives: </span>
                    Full API access on every plan. Even free.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* COMPARISON TABLE */}
      <Section className="py-24 sm:py-32 border-t border-slate-800/40" id="compare">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
              Compare
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
              How the options stack up
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-400">
              There are really only four choices for handling webhooks. Here&apos;s an honest look at each.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-5 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-400" /> Included
            </span>
            <span className="flex items-center gap-1.5">
              <Minus className="h-3.5 w-3.5 text-slate-700" /> Not available
            </span>
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500/70" /> You build it
            </span>
          </div>

          <div className="mt-10 overflow-x-auto rounded-xl border border-slate-800/60 bg-slate-900/20">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-800/80">
                  <th className="sticky left-0 z-10 bg-slate-950/95 backdrop-blur-sm py-4 pl-5 pr-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Feature
                  </th>
                  <th className="py-4 px-3 text-center">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Free testing tools
                    </div>
                  </th>
                  <th className="py-4 px-3 text-center">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Enterprise platforms
                    </div>
                    <div className="mt-0.5 font-mono text-[10px] text-slate-600">$39+/mo</div>
                  </th>
                  <th className="py-4 px-3 text-center">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Build your own
                    </div>
                  </th>
                  <th className="py-4 px-3 pr-5 text-center">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">
                      Ferryhook
                    </div>
                    <div className="mt-0.5 font-mono text-[10px] text-blue-400/60">from $0</div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {comparisonRows.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`transition-colors hover:bg-slate-800/20 ${
                      i >= comparisonRows.length - 2 ? "bg-slate-800/10 font-medium" : ""
                    }`}
                  >
                    <td className="sticky left-0 z-10 bg-slate-950/95 backdrop-blur-sm py-3 pl-5 pr-4 text-sm text-slate-300">
                      {row.feature}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <ComparisonCellValue value={row.testing} />
                    </td>
                    <td className="py-3 px-3 text-center">
                      <ComparisonCellValue value={row.enterprise} />
                    </td>
                    <td className="py-3 px-3 text-center">
                      <ComparisonCellValue value={row.diy} />
                    </td>
                    <td className="py-3 px-3 pr-5 text-center bg-blue-600/[0.02]">
                      <ComparisonCellValue value={row.ferryhook} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-center text-xs text-slate-600">
            Build-your-own gives you full control but typically takes 2-3 weeks of engineering time for retry logic, queuing, a dashboard, monitoring, and ongoing maintenance.
          </p>
        </div>
      </Section>

      {/* SETUP SPEED */}
      <Section className="py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                Setup
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
                Two minutes. Not two sprints.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-400">
                Create a source, paste the URL into your provider, add a destination. That&apos;s the whole setup. No YAML. No infrastructure to provision. No 30-page onboarding guide.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  { step: "1", text: "Create a source. Get a unique ingest URL." },
                  { step: "2", text: "Paste it into Stripe, GitHub, Shopify, wherever." },
                  { step: "3", text: "Add your destination. Webhooks start flowing." },
                ].map((s) => (
                  <div key={s.step} className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600/15 font-mono text-xs font-bold text-blue-400">
                      {s.step}
                    </div>
                    <p className="text-sm text-slate-400">{s.text}</p>
                  </div>
                ))}
              </div>

              <Link
                href="/docs/quickstart"
                className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-blue-400 transition-colors hover:text-blue-300"
              >
                Read the quickstart guide
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div>
              <SetupCodeBlock code={setupCode} />
            </div>
          </div>
        </div>
      </Section>

      {/* PRICING PREVIEW */}
      <Section className="py-24 sm:py-32 border-t border-slate-800/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
              Pricing
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-400">
              Start free. Scale as you grow. No hidden fees, no surprise charges.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border p-6 transition-all ${
                  plan.highlight
                    ? "border-blue-500/40 bg-blue-600/5 shadow-lg shadow-blue-900/10"
                    : "border-slate-800/60 bg-slate-900/20 hover:border-slate-700/60"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-0.5 text-xs font-semibold text-white">
                    Most Popular
                  </div>
                )}
                <div>
                  <h3 className="font-display text-sm font-semibold text-slate-300">
                    {plan.name}
                  </h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="font-display text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-sm text-slate-500">{plan.period}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">{plan.events}</p>
                </div>

                <ul className="mt-6 flex-1 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-400">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-400" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.ctaLink}
                  className={`mt-6 block rounded-lg py-2.5 text-center text-sm font-semibold transition-all ${
                    plan.highlight || plan.name === "Free"
                      ? "bg-blue-600 text-white hover:bg-blue-500 shadow-sm shadow-blue-600/20"
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

          <p className="mt-8 text-center">
            <Link
              href="/pricing"
              className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              See full feature comparison →
            </Link>
          </p>
        </div>
      </Section>

      {/* INTEGRATIONS */}
      <Section className="py-24 sm:py-32 border-t border-slate-800/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
            Works with any service that sends webhooks
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500">
            Point any webhook sender to your Ferryhook URL. No special integration needed.
          </p>

          <div className="mx-auto mt-12 flex max-w-3xl flex-wrap items-center justify-center gap-2.5">
            {integrations.map((name) => (
              <span
                key={name}
                className="rounded-md border border-slate-800/60 bg-slate-900/30 px-3.5 py-1.5 font-mono text-xs text-slate-500 transition-colors hover:border-slate-700 hover:text-slate-400"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </Section>

      {/* CTA BANNER */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600/20 via-slate-900 to-slate-900 border border-blue-500/10 px-8 py-16 text-center sm:px-16 sm:py-20">
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
            <div className="relative">
              <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
                Start receiving webhooks in 10 seconds.
              </h2>
              <p className="mx-auto mt-4 max-w-md text-slate-400">
                Create a free account, get your webhook URL, and start receiving events. No credit card. No configuration.
              </p>
              <div className="mt-8">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-slate-900 shadow-lg transition-all hover:bg-slate-100 hover:-translate-y-0.5"
                >
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
