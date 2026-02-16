"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "What counts as an event?",
    a: "An event is a single inbound webhook request received by Ferryhook. If a webhook fans out to 3 destinations, that counts as 1 event (not 3). Replayed events do count toward your monthly usage.",
  },
  {
    q: "What happens when I exceed my limit?",
    a: "On the Free plan, additional webhooks will be rejected with a 429 status code — the sender will retry later. On paid plans, we allow overages and bill at a per-event rate at the end of the month so you never miss a webhook.",
  },
  {
    q: "Can I change plans?",
    a: "Yes, you can upgrade or downgrade at any time from the dashboard. Upgrades take effect immediately. Downgrades apply at the start of the next billing cycle. We prorate charges automatically.",
  },
  {
    q: "Do you offer annual billing?",
    a: "Not yet, but it's coming soon. Annual plans will include a 20% discount. Drop us an email at support@ferryhook.io and we'll notify you when it launches.",
  },
  {
    q: "Is there a free trial?",
    a: "The Free plan is free forever — no trial period, no credit card. You can also try any paid plan free for 14 days. If you don't upgrade, you'll automatically switch to the Free plan.",
  },
];

export function PricingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="border-t border-slate-800/40 py-24">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center font-display text-2xl font-bold text-white">
          Frequently asked questions
        </h2>

        <div className="mt-12 space-y-2">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-800/60 bg-slate-900/20 transition-colors hover:bg-slate-900/30"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <span className="text-sm font-medium text-slate-200">{faq.q}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === i && (
                <div className="px-5 pb-4">
                  <p className="text-sm leading-relaxed text-slate-400">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
