import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/marketing/CodeBlock";

export const metadata: Metadata = {
  title: "Quickstart",
  description: "Go from zero to receiving webhooks in 60 seconds with Ferryhook.",
};

export default function QuickstartPage() {
  return (
    <div className="prose-docs">
      <h1 className="font-display text-3xl font-bold text-white">Quickstart</h1>
      <p className="mt-3 text-base leading-relaxed text-slate-400">
        Get Ferryhook up and running in under 60 seconds. By the end of this guide, you&apos;ll have received and inspected your first webhook.
      </p>

      {/* Step 1 */}
      <div className="mt-10">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600/20 font-mono text-xs font-bold text-blue-400">1</span>
          <h2 className="font-display text-lg font-semibold text-white">Create an account</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Head to{" "}
          <Link href="/signup" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
            ferryhook.io/signup
          </Link>{" "}
          and create a free account. No credit card required.
        </p>
      </div>

      {/* Step 2 */}
      <div className="mt-10">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600/20 font-mono text-xs font-bold text-blue-400">2</span>
          <h2 className="font-display text-lg font-semibold text-white">Create a source</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          In the dashboard, click <strong className="text-slate-200">&quot;New Source&quot;</strong>. Give it a name (e.g. &quot;Stripe Production&quot;) and select a provider. Ferryhook will generate a unique webhook URL for you:
        </p>
        <div className="mt-4">
          <CodeBlock
            code="https://hooks.ferryhook.io/in/src_a1b2c3d4e5f6g7h8"
            language="bash"
          />
        </div>
      </div>

      {/* Step 3 */}
      <div className="mt-10">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600/20 font-mono text-xs font-bold text-blue-400">3</span>
          <h2 className="font-display text-lg font-semibold text-white">Send a test webhook</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Copy your webhook URL and send a test event using cURL:
        </p>
        <div className="mt-4">
          <CodeBlock
            language="bash"
            code={`$ curl -X POST https://hooks.ferryhook.io/in/src_a1b2c3d4e5f6g7h8 \\
    -H "Content-Type: application/json" \\
    -d '{"event": "payment.completed", "amount": 4999}'`}
          />
        </div>
        <p className="mt-4 text-sm text-slate-400">
          You&apos;ll get an immediate response:
        </p>
        <div className="mt-3">
          <CodeBlock
            language="json"
            code={`{
  "id": "evt_x7k2m9p4q8r1s5t3",
  "status": "received"
}`}
          />
        </div>
      </div>

      {/* Step 4 */}
      <div className="mt-10">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600/20 font-mono text-xs font-bold text-blue-400">4</span>
          <h2 className="font-display text-lg font-semibold text-white">See it in the dashboard</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Go back to your{" "}
          <Link href="/sources" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
            dashboard
          </Link>
          . You&apos;ll see your event appear in real-time with its full payload, headers, and delivery status.
        </p>
      </div>

      {/* Step 5 */}
      <div className="mt-10">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600/20 font-mono text-xs font-bold text-blue-400">5</span>
          <h2 className="font-display text-lg font-semibold text-white">Add a destination</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Create a <strong className="text-slate-200">connection</strong> to forward webhooks to your server. Navigate to your source, click &quot;Add Connection&quot;, and enter your destination URL:
        </p>
        <div className="mt-4">
          <CodeBlock
            language="bash"
            code="https://api.yourapp.com/webhooks/stripe"
          />
        </div>
        <p className="mt-4 text-sm text-slate-400">
          That&apos;s it! All future webhooks sent to your Ferryhook URL will be automatically forwarded to your server with guaranteed delivery and automatic retries.
        </p>
      </div>

      {/* Next steps */}
      <div className="mt-12 rounded-xl border border-slate-800/60 bg-slate-900/20 p-6">
        <h3 className="font-display text-base font-semibold text-white">Next steps</h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-400">
          <li>
            <Link href="/docs/concepts" className="text-blue-400 hover:text-blue-300">
              Learn about Core Concepts
            </Link>{" "}
            — understand Sources, Connections, and Events
          </li>
          <li>
            <Link href="/docs/integrations/stripe" className="text-blue-400 hover:text-blue-300">
              Set up Stripe webhooks
            </Link>{" "}
            — step-by-step guide with signature verification
          </li>
          <li>
            <Link href="/docs/api-reference" className="text-blue-400 hover:text-blue-300">
              Explore the API
            </Link>{" "}
            — automate your webhook infrastructure
          </li>
        </ul>
      </div>

      <p className="mt-10 border-t border-slate-800/40 pt-6 text-xs text-slate-600">
        <a href="https://github.com/ferryhook/ferryhook/edit/main/docs/quickstart.md" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 transition-colors">
          Edit this page on GitHub →
        </a>
      </p>
    </div>
  );
}
