import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/marketing/CodeBlock";

export const metadata: Metadata = {
  title: "Shopify Integration",
  description: "Step-by-step guide for receiving Shopify webhooks via Ferryhook with HMAC verification.",
};

export default function ShopifyIntegrationPage() {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">Integration Guide</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-white">Shopify</h1>
      <p className="mt-3 text-base leading-relaxed text-slate-400">
        Receive Shopify webhooks through Ferryhook for orders, products, customers, and other store events with HMAC signature verification.
      </p>

      <div className="mt-8 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
        <p className="text-xs font-semibold text-amber-400">Prerequisites</p>
        <ul className="mt-2 space-y-1 text-sm text-slate-400">
          <li>• A Ferryhook account (<Link href="/signup" className="text-blue-400 hover:text-blue-300">sign up free</Link>)</li>
          <li>• A Shopify store with admin access or a Shopify app</li>
        </ul>
      </div>

      {/* Step 1 */}
      <div className="mt-10">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600/20 font-mono text-xs font-bold text-blue-400">1</span>
          <h2 className="font-display text-lg font-semibold text-white">Create a Shopify source in Ferryhook</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          In your dashboard, create a new source and select <strong className="text-slate-200">&quot;Shopify&quot;</strong> as the provider:
        </p>
        <div className="mt-3">
          <CodeBlock
            language="json"
            code={`{
  "name": "Shopify - mystore",
  "provider": "shopify",
  "signingAlgorithm": "shopify"
}`}
          />
        </div>
      </div>

      {/* Step 2 */}
      <div className="mt-10">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600/20 font-mono text-xs font-bold text-blue-400">2</span>
          <h2 className="font-display text-lg font-semibold text-white">Configure Shopify webhook</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Go to <strong className="text-slate-200">Shopify Admin → Settings → Notifications → Webhooks</strong> (at the bottom of the page). Click &quot;Create webhook&quot;:
        </p>
        <ul className="mt-3 space-y-2 text-sm text-slate-400">
          <li className="flex gap-2"><span className="text-blue-400">•</span><strong className="text-slate-300">Event:</strong> Select the event (e.g., Order creation)</li>
          <li className="flex gap-2"><span className="text-blue-400">•</span><strong className="text-slate-300">Format:</strong> JSON</li>
          <li className="flex gap-2"><span className="text-blue-400">•</span><strong className="text-slate-300">URL:</strong> Your Ferryhook source URL</li>
          <li className="flex gap-2"><span className="text-blue-400">•</span><strong className="text-slate-300">Webhook API version:</strong> Latest stable</li>
        </ul>
      </div>

      {/* Step 3 */}
      <div className="mt-10">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600/20 font-mono text-xs font-bold text-blue-400">3</span>
          <h2 className="font-display text-lg font-semibold text-white">Add the HMAC secret</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Shopify displays the signing key at the bottom of the webhooks settings page. Copy it and paste it into your Ferryhook source settings as the signing secret. Ferryhook will verify the <code className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-slate-300">X-Shopify-Hmac-Sha256</code> header automatically.
        </p>
      </div>

      {/* Step 4 */}
      <div className="mt-10">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600/20 font-mono text-xs font-bold text-blue-400">4</span>
          <h2 className="font-display text-lg font-semibold text-white">Add a connection</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Create a connection to route Shopify events to your fulfillment service, order management system, or any HTTP endpoint:
        </p>
        <div className="mt-3">
          <CodeBlock
            language="json"
            code={`{
  "name": "Order Fulfillment",
  "destinationUrl": "https://api.yourapp.com/webhooks/shopify",
  "transform": {
    "type": "field_map",
    "rules": [
      { "from": "$.id", "to": "orderId" },
      { "from": "$.total_price", "to": "totalPrice" },
      { "from": "$.customer.email", "to": "customerEmail" }
    ]
  }
}`}
          />
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-display text-lg font-semibold text-white">Test it</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Use Shopify&apos;s &quot;Send test notification&quot; button next to each webhook, or create a test order. The event will appear in your Ferryhook dashboard instantly.
        </p>
      </div>

      <p className="mt-12 border-t border-slate-800/40 pt-6 text-xs text-slate-600">
        <a href="https://github.com/ferryhook/ferryhook/edit/main/docs/integrations/shopify.md" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 transition-colors">
          Edit this page on GitHub →
        </a>
      </p>
    </div>
  );
}
