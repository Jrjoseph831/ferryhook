import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { TerminalAnimation } from "@/components/marketing/TerminalAnimation";
import { HomepageSections } from "@/components/marketing/HomepageSections";

export const metadata: Metadata = {
  title: "Ferryhook — Never miss a webhook again",
  description:
    "Receive, transform, and deliver webhooks with guaranteed reliability. Free forever for small projects. Built for developers who need reliable webhook infrastructure.",
  openGraph: {
    title: "Ferryhook — Never miss a webhook again",
    description:
      "Receive, transform, and deliver webhooks with guaranteed reliability. Free forever for small projects.",
  },
};

const providers = [
  "Stripe", "GitHub", "Shopify", "Twilio", "SendGrid", "Slack", "Discord", "Linear",
];

export default function HomePage() {
  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Ferryhook",
            url: "https://ferryhook.io",
            logo: "https://ferryhook.io/logo.png",
            description: "Webhook relay, transformation, and intelligence platform",
            sameAs: [
              "https://github.com/ferryhook",
              "https://x.com/ferryhook",
            ],
          }),
        }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="hero-grid absolute inset-0" />
        <div className="hero-glow absolute inset-0" />
        <div className="noise-overlay absolute inset-0" />

        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-20 sm:px-6 sm:pb-28 sm:pt-28 lg:px-8 lg:pb-32 lg:pt-32">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-4 py-1.5 text-xs font-medium text-blue-400 animate-fade-up">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Now in public beta
            </div>

            <h1
              className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl text-balance animate-fade-up"
              style={{ animationDelay: "100ms" }}
            >
              Never miss a{" "}
              <span className="relative">
                <span className="relative z-10 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  webhook
                </span>
              </span>{" "}
              again.
            </h1>

            <p
              className="mt-6 text-lg leading-relaxed text-slate-400 sm:text-xl animate-fade-up"
              style={{ animationDelay: "200ms" }}
            >
              Receive, transform, and deliver webhooks with guaranteed reliability.
              <br className="hidden sm:block" />
              Free forever for small projects.
            </p>

            {/* CTAs */}
            <div
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-up"
              style={{ animationDelay: "300ms" }}
            >
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-7 py-3.5 text-sm font-medium text-slate-300 transition-all hover:border-slate-600 hover:text-white hover:bg-slate-800/50"
              >
                View Documentation
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Terminal animation */}
          <div
            className="mx-auto mt-16 max-w-2xl animate-fade-up"
            style={{ animationDelay: "500ms" }}
          >
            <TerminalAnimation />
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="border-y border-slate-800/60 bg-slate-900/30">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
            <p className="shrink-0 text-xs font-medium uppercase tracking-widest text-slate-600">
              Built for teams using
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {providers.map((name) => (
                <span
                  key={name}
                  className="rounded-md border border-slate-800 bg-slate-900/50 px-3 py-1.5 font-mono text-xs text-slate-500 transition-colors hover:border-slate-700 hover:text-slate-400"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Client-rendered sections with scroll animations */}
      <HomepageSections />
    </>
  );
}
