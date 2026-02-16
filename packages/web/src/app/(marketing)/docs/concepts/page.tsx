import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/marketing/CodeBlock";

export const metadata: Metadata = {
  title: "Core Concepts",
  description: "Understand Sources, Connections, Destinations, and Events — the building blocks of Ferryhook.",
};

export default function ConceptsPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-white">Core Concepts</h1>
      <p className="mt-3 text-base leading-relaxed text-slate-400">
        Ferryhook organizes webhook infrastructure around four concepts: Sources, Connections, Destinations, and Events. Understanding these will help you build reliable webhook pipelines.
      </p>

      {/* Architecture diagram */}
      <div className="mt-8 overflow-x-auto rounded-xl border border-slate-800/60 bg-[#0c1222] p-6">
        <pre className="font-mono text-xs leading-relaxed text-slate-400 sm:text-sm">
{`┌──────────────┐      ┌────────────────────────────────────────┐      ┌───────────────┐
│              │      │            Ferryhook                   │      │               │
│  Stripe      │─────▶│  Source ──▶ Connection ──▶ Destination │─────▶│  Your Server  │
│  GitHub      │      │    │          │    │                   │      │               │
│  Shopify     │      │    │       Filter  Transform          │      └───────────────┘
│  ...         │      │    │                                   │      ┌───────────────┐
│              │      │    └──▶ Connection ──▶ Destination ────│─────▶│  Slack Bot    │
└──────────────┘      │                                        │      └───────────────┘
                      └────────────────────────────────────────┘`}
        </pre>
      </div>

      {/* Sources */}
      <div className="mt-12">
        <h2 className="flex items-center gap-3 font-display text-xl font-bold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/20 font-mono text-sm font-bold text-blue-400">S</span>
          Sources
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          A <strong className="text-slate-200">Source</strong> is a unique inbound URL where webhook senders deliver payloads. Each source maps to one external service (Stripe, GitHub, Shopify, etc.).
        </p>
        <div className="mt-4">
          <CodeBlock
            code="https://hooks.ferryhook.io/in/src_a1b2c3d4e5f6g7h8"
            language="bash"
          />
        </div>
        <ul className="mt-4 space-y-2 text-sm text-slate-400">
          <li className="flex gap-2">
            <span className="text-blue-400">•</span>
            Each source generates a unique URL with a <code className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-slate-300">src_</code> prefix
          </li>
          <li className="flex gap-2">
            <span className="text-blue-400">•</span>
            Optional signing secret for inbound signature verification
          </li>
          <li className="flex gap-2">
            <span className="text-blue-400">•</span>
            Supports multiple providers: Stripe, GitHub, Shopify, Twilio, SendGrid, Slack, or custom
          </li>
        </ul>
      </div>

      {/* Connections */}
      <div className="mt-12">
        <h2 className="flex items-center gap-3 font-display text-xl font-bold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600/20 font-mono text-sm font-bold text-emerald-400">C</span>
          Connections
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          A <strong className="text-slate-200">Connection</strong> is a rule pipeline between a Source and a Destination. It defines how events flow: what gets filtered out, how payloads are transformed, and where they end up.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-slate-400">
          <li className="flex gap-2">
            <span className="text-emerald-400">•</span>
            <strong className="text-slate-300">Filters</strong> — Accept or reject events based on payload content using JSONPath expressions
          </li>
          <li className="flex gap-2">
            <span className="text-emerald-400">•</span>
            <strong className="text-slate-300">Transformations</strong> — Reshape data before delivery: map fields, rename, remove, or add
          </li>
          <li className="flex gap-2">
            <span className="text-emerald-400">•</span>
            <strong className="text-slate-300">Fan-out</strong> — One source can have multiple connections, sending to different destinations
          </li>
        </ul>
        <div className="mt-4">
          <CodeBlock
            language="json"
            code={`{
  "name": "Payment Success Only",
  "destinationUrl": "https://api.myapp.com/webhooks",
  "filters": [
    {
      "path": "$.type",
      "operator": "equals",
      "value": "payment_intent.succeeded"
    }
  ],
  "transform": {
    "type": "field_map",
    "rules": [
      { "from": "$.data.object.amount", "to": "amount" },
      { "from": "$.data.object.currency", "to": "currency" }
    ]
  }
}`}
          />
        </div>
      </div>

      {/* Destinations */}
      <div className="mt-12">
        <h2 className="flex items-center gap-3 font-display text-xl font-bold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600/20 font-mono text-sm font-bold text-amber-400">D</span>
          Destinations
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          A <strong className="text-slate-200">Destination</strong> is the endpoint where processed webhooks are delivered — your actual server URL, Lambda function, or any HTTP endpoint.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-slate-400">
          <li className="flex gap-2">
            <span className="text-amber-400">•</span>
            Must use HTTPS (HTTP rejected for security)
          </li>
          <li className="flex gap-2">
            <span className="text-amber-400">•</span>
            Configurable timeout (default: 30 seconds)
          </li>
          <li className="flex gap-2">
            <span className="text-amber-400">•</span>
            SSRF protection — internal IPs and private networks are blocked
          </li>
        </ul>
      </div>

      {/* Events */}
      <div className="mt-12">
        <h2 className="flex items-center gap-3 font-display text-xl font-bold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600/20 font-mono text-sm font-bold text-purple-400">E</span>
          Events
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          An <strong className="text-slate-200">Event</strong> is a single webhook request flowing through the system. Every state transition is logged with timestamps for full observability.
        </p>

        {/* Lifecycle */}
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-800/60 bg-[#0c1222] p-6">
          <pre className="font-mono text-xs text-slate-400 sm:text-sm">
{`received ──▶ queued ──▶ filtered ──▶ transformed ──▶ delivered ✓
                                                   │
                                                   ├── retrying (attempt 2/7)
                                                   │
                                                   └── failed ✗ (after 7 attempts)`}
          </pre>
        </div>

        <ul className="mt-4 space-y-2 text-sm text-slate-400">
          <li className="flex gap-2">
            <span className="text-purple-400">•</span>
            <strong className="text-slate-300">received</strong> — Webhook accepted and queued for processing
          </li>
          <li className="flex gap-2">
            <span className="text-purple-400">•</span>
            <strong className="text-slate-300">filtered</strong> — Event didn&apos;t match any connection filters (intentionally skipped)
          </li>
          <li className="flex gap-2">
            <span className="text-purple-400">•</span>
            <strong className="text-slate-300">delivered</strong> — Successfully delivered to the destination (2xx response)
          </li>
          <li className="flex gap-2">
            <span className="text-purple-400">•</span>
            <strong className="text-slate-300">retrying</strong> — Delivery failed, will retry with exponential backoff
          </li>
          <li className="flex gap-2">
            <span className="text-purple-400">•</span>
            <strong className="text-slate-300">failed</strong> — All retry attempts exhausted
          </li>
        </ul>
      </div>

      {/* Retry Schedule */}
      <div className="mt-12">
        <h2 className="font-display text-xl font-bold text-white">Retry Schedule</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          When a delivery fails, Ferryhook retries with exponential backoff. The schedule depends on your plan:
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="pb-2 pr-6 text-left text-xs font-semibold text-slate-500">Attempt</th>
                <th className="pb-2 pr-6 text-left text-xs font-semibold text-slate-500">Delay</th>
                <th className="pb-2 text-left text-xs font-semibold text-slate-500">Cumulative</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {[
                { n: 1, delay: "Immediate", cum: "0s" },
                { n: 2, delay: "30 seconds", cum: "30s" },
                { n: 3, delay: "2 minutes", cum: "2m 30s" },
                { n: 4, delay: "15 minutes", cum: "17m 30s" },
                { n: 5, delay: "1 hour", cum: "1h 17m" },
                { n: 6, delay: "4 hours", cum: "5h 17m" },
                { n: 7, delay: "12 hours", cum: "17h 17m" },
                { n: 8, delay: "24 hours", cum: "41h 17m" },
              ].map((row) => (
                <tr key={row.n}>
                  <td className="py-2 pr-6 font-mono text-xs text-slate-300">{row.n}</td>
                  <td className="py-2 pr-6 text-slate-400">{row.delay}</td>
                  <td className="py-2 text-slate-500">{row.cum}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-12 border-t border-slate-800/40 pt-6 text-xs text-slate-600">
        <a href="https://github.com/ferryhook/ferryhook/edit/main/docs/concepts.md" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 transition-colors">
          Edit this page on GitHub →
        </a>
      </p>
    </div>
  );
}
