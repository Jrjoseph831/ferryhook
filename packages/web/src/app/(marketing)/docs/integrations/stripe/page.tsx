import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/marketing/CodeBlock";

export const metadata: Metadata = {
  title: "Stripe Integration",
  description: "Step-by-step guide for receiving Stripe webhooks via Ferryhook with signature verification.",
};

export default function StripeIntegrationPage() {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">Integration Guide</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-white">Stripe</h1>
      <p className="mt-3 text-base leading-relaxed text-slate-400">
        Receive Stripe webhooks through Ferryhook with automatic signature verification, guaranteed delivery, and full observability.
      </p>

      {/* Prerequisites */}
      <div className="mt-8 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
        <p className="text-xs font-semibold text-amber-400">Prerequisites</p>
        <ul className="mt-2 space-y-1 text-sm text-slate-400">
          <li>• A Ferryhook account (<Link href="/signup" className="text-blue-400 hover:text-blue-300">sign up free</Link>)</li>
          <li>• A Stripe account with webhook events to capture</li>
        </ul>
      </div>

      {/* Step 1 */}
      <div className="mt-10">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600/20 font-mono text-xs font-bold text-blue-400">1</span>
          <h2 className="font-display text-lg font-semibold text-white">Create a Stripe source in Ferryhook</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          In your Ferryhook dashboard, create a new source. Select <strong className="text-slate-200">&quot;Stripe&quot;</strong> as the provider.
        </p>
        <div className="mt-3">
          <CodeBlock
            language="json"
            code={`{
  "name": "Stripe Production",
  "provider": "stripe",
  "signingAlgorithm": "stripe"
}`}
          />
        </div>
        <p className="mt-3 text-sm text-slate-400">
          Copy the generated webhook URL — you&apos;ll need it in the next step.
        </p>
      </div>

      {/* Step 2 */}
      <div className="mt-10">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600/20 font-mono text-xs font-bold text-blue-400">2</span>
          <h2 className="font-display text-lg font-semibold text-white">Configure Stripe webhook endpoint</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Go to <strong className="text-slate-200">Stripe Dashboard → Developers → Webhooks → Add endpoint</strong>. Paste your Ferryhook URL and select the events you want to receive (e.g. <code className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-slate-300">payment_intent.succeeded</code>, <code className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-slate-300">checkout.session.completed</code>).
        </p>
      </div>

      {/* Step 3 */}
      <div className="mt-10">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600/20 font-mono text-xs font-bold text-blue-400">3</span>
          <h2 className="font-display text-lg font-semibold text-white">Add the signing secret</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          After creating the endpoint in Stripe, reveal and copy the <strong className="text-slate-200">signing secret</strong> (starts with <code className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-slate-300">whsec_</code>). Go back to your Ferryhook source settings and paste it as the signing secret.
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Ferryhook will now verify the <code className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-slate-300">Stripe-Signature</code> header on every incoming webhook, rejecting any tampered or replayed requests.
        </p>
      </div>

      {/* Step 4 */}
      <div className="mt-10">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600/20 font-mono text-xs font-bold text-blue-400">4</span>
          <h2 className="font-display text-lg font-semibold text-white">Add a connection to your server</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Create a connection on the source to forward events to your application. Optionally add filters to only receive specific event types:
        </p>
        <div className="mt-3">
          <CodeBlock
            language="json"
            code={`{
  "name": "Payment Events Only",
  "destinationUrl": "https://api.yourapp.com/webhooks/stripe",
  "filters": [
    {
      "path": "$.type",
      "operator": "contains",
      "value": "payment_intent"
    }
  ]
}`}
          />
        </div>
      </div>

      {/* Step 5 */}
      <div className="mt-10">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600/20 font-mono text-xs font-bold text-blue-400">5</span>
          <h2 className="font-display text-lg font-semibold text-white">Verify Ferryhook&apos;s signature in your app</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          When Ferryhook delivers a webhook to your server, it signs the payload with your connection&apos;s secret. Verify the signature in your handler:
        </p>
        <div className="mt-3">
          <CodeBlock
            language="typescript"
            filename="webhook-handler.ts"
            code={`import crypto from "crypto";

function verifyFerryhookSignature(
  payload: string,
  header: string,
  secret: string
): boolean {
  const elements = Object.fromEntries(
    header.split(",").map((e) => e.split("="))
  );
  const timestamp = elements["t"];
  const signed = timestamp + "." + payload;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(signed)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(elements["v1"])
  );
}

// In your Express/Hono/Fastify handler:
const signature = req.headers["x-ferryhook-signature"];
const isValid = verifyFerryhookSignature(
  req.body,
  signature,
  process.env.FERRYHOOK_SECRET
);`}
            showLineNumbers
          />
        </div>
      </div>

      {/* Test */}
      <div className="mt-10">
        <h2 className="font-display text-lg font-semibold text-white">Test it</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Use Stripe&apos;s &quot;Send test webhook&quot; button or trigger a real event. You&apos;ll see it appear in your Ferryhook dashboard instantly, with full payload inspection and delivery status.
        </p>
      </div>

      <p className="mt-12 border-t border-slate-800/40 pt-6 text-xs text-slate-600">
        <a href="https://github.com/ferryhook/ferryhook/edit/main/docs/integrations/stripe.md" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 transition-colors">
          Edit this page on GitHub →
        </a>
      </p>
    </div>
  );
}
