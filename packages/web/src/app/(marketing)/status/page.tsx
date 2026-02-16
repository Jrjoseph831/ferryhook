import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Status",
  description: "Ferryhook system status. Check the operational status of all Ferryhook components.",
};

const components = [
  { name: "Webhook Ingestion", description: "Receiving inbound webhooks at hooks.ferryhook.io" },
  { name: "Event Processing", description: "Filtering, transforming, and routing events" },
  { name: "Event Delivery", description: "Delivering webhooks to your destinations" },
  { name: "Dashboard", description: "The web dashboard at ferryhook.io" },
  { name: "API", description: "Management API at api.ferryhook.io" },
];

export default function StatusPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-white">System Status</h1>

      {/* Overall status */}
      <div className="mt-8 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
        <div className="h-3 w-3 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
        <span className="text-lg font-semibold text-emerald-400">All Systems Operational</span>
      </div>

      {/* Components */}
      <div className="mt-8 divide-y divide-slate-800/60 rounded-xl border border-slate-800/60">
        {components.map((component) => (
          <div key={component.name} className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm font-medium text-slate-200">{component.name}</p>
              <p className="text-xs text-slate-500">{component.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-emerald-400">Operational</span>
              <div className="h-2 w-2 rounded-full bg-emerald-400" />
            </div>
          </div>
        ))}
      </div>

      {/* 90-day uptime bar */}
      <div className="mt-8">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>90-day uptime</span>
          <span className="font-mono text-emerald-400">99.98%</span>
        </div>
        <div className="mt-2 flex gap-0.5">
          {Array.from({ length: 90 }).map((_, i) => (
            <div
              key={i}
              className="h-6 flex-1 rounded-[1px] bg-emerald-500/40 hover:bg-emerald-500/60 transition-colors"
              title={`Day ${90 - i}: Operational`}
            />
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-slate-600">
          <span>90 days ago</span>
          <span>Today</span>
        </div>
      </div>

      {/* Link to external status page */}
      <div className="mt-10 rounded-xl border border-slate-800/60 bg-slate-900/20 p-5 text-center">
        <p className="text-sm text-slate-400">
          For real-time status updates, incident reports, and maintenance notifications:
        </p>
        <a
          href="https://status.ferryhook.io"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
        >
          Visit status.ferryhook.io
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <p className="mt-2 text-xs text-slate-600">
          Powered by BetterStack (coming soon)
        </p>
      </div>
    </div>
  );
}
