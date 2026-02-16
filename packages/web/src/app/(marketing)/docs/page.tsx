import type { Metadata } from "next";
import Link from "next/link";
import {
  Zap,
  BookOpen,
  Braces,
  Shield,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Documentation",
  description: "Everything you need to integrate Ferryhook into your stack. Quickstart guides, API reference, and integration tutorials.",
};

const sections = [
  {
    icon: Zap,
    title: "Quickstart",
    description: "Go from zero to receiving webhooks in 60 seconds. Create a source, send a test event, and see it in your dashboard.",
    href: "/docs/quickstart",
    color: "text-amber-400 bg-amber-400/10",
  },
  {
    icon: BookOpen,
    title: "Core Concepts",
    description: "Understand Sources, Connections, Destinations, and Events — the building blocks of Ferryhook.",
    href: "/docs/concepts",
    color: "text-blue-400 bg-blue-400/10",
  },
  {
    icon: Braces,
    title: "API Reference",
    description: "Complete REST API documentation with endpoints, request/response schemas, and cURL examples.",
    href: "/docs/api-reference",
    color: "text-emerald-400 bg-emerald-400/10",
  },
  {
    icon: Shield,
    title: "Security",
    description: "Learn how Ferryhook handles encryption, signature verification, SSRF protection, and rate limiting.",
    href: "/docs/security",
    color: "text-purple-400 bg-purple-400/10",
  },
];

const integrations = [
  { name: "Stripe", href: "/docs/integrations/stripe" },
  { name: "GitHub", href: "/docs/integrations/github" },
  { name: "Shopify", href: "/docs/integrations/shopify" },
];

export default function DocsIndexPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-white">Documentation</h1>
      <p className="mt-3 text-base leading-relaxed text-slate-400">
        Everything you need to integrate Ferryhook into your stack. Pick a section below or jump straight to the{" "}
        <Link href="/docs/quickstart" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
          Quickstart
        </Link>
        .
      </p>

      {/* Section cards */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group rounded-xl border border-slate-800/60 bg-slate-900/20 p-5 transition-all hover:border-slate-700/60 hover:bg-slate-900/40"
          >
            <div className={`inline-flex rounded-lg p-2.5 ${section.color}`}>
              <section.icon className="h-5 w-5" />
            </div>
            <h2 className="mt-3 font-display text-base font-semibold text-white group-hover:text-blue-400 transition-colors">
              {section.title}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
              {section.description}
            </p>
          </Link>
        ))}
      </div>

      {/* Integration guides */}
      <div className="mt-12">
        <h2 className="font-display text-lg font-semibold text-white">Integration Guides</h2>
        <p className="mt-1 text-sm text-slate-400">
          Step-by-step guides for connecting popular webhook providers.
        </p>
        <div className="mt-4 space-y-2">
          {integrations.map((integration) => (
            <Link
              key={integration.href}
              href={integration.href}
              className="flex items-center justify-between rounded-lg border border-slate-800/60 bg-slate-900/20 px-4 py-3 text-sm text-slate-300 transition-all hover:border-slate-700/60 hover:bg-slate-900/40 hover:text-white"
            >
              {integration.name}
              <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
            </Link>
          ))}
        </div>
      </div>

      {/* Edit link */}
      <p className="mt-12 border-t border-slate-800/40 pt-6 text-xs text-slate-600">
        <a
          href="https://github.com/ferryhook/ferryhook/edit/main/docs/index.md"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-slate-400 transition-colors"
        >
          Edit this page on GitHub →
        </a>
      </p>
    </div>
  );
}
