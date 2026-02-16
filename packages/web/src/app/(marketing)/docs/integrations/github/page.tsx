import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/marketing/CodeBlock";

export const metadata: Metadata = {
  title: "GitHub Integration",
  description: "Step-by-step guide for receiving GitHub webhooks via Ferryhook with signature verification.",
};

export default function GitHubIntegrationPage() {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">Integration Guide</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-white">GitHub</h1>
      <p className="mt-3 text-base leading-relaxed text-slate-400">
        Receive GitHub webhooks through Ferryhook for push events, pull requests, issues, and any other repository or organization events.
      </p>

      <div className="mt-8 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
        <p className="text-xs font-semibold text-amber-400">Prerequisites</p>
        <ul className="mt-2 space-y-1 text-sm text-slate-400">
          <li>• A Ferryhook account (<Link href="/signup" className="text-blue-400 hover:text-blue-300">sign up free</Link>)</li>
          <li>• A GitHub repository or organization with admin access</li>
        </ul>
      </div>

      {/* Step 1 */}
      <div className="mt-10">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600/20 font-mono text-xs font-bold text-blue-400">1</span>
          <h2 className="font-display text-lg font-semibold text-white">Create a GitHub source in Ferryhook</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          In your Ferryhook dashboard, create a new source and select <strong className="text-slate-200">&quot;GitHub&quot;</strong> as the provider:
        </p>
        <div className="mt-3">
          <CodeBlock
            language="json"
            code={`{
  "name": "GitHub - myorg/myrepo",
  "provider": "github",
  "signingAlgorithm": "github"
}`}
          />
        </div>
      </div>

      {/* Step 2 */}
      <div className="mt-10">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600/20 font-mono text-xs font-bold text-blue-400">2</span>
          <h2 className="font-display text-lg font-semibold text-white">Configure the GitHub webhook</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Go to <strong className="text-slate-200">GitHub → Repository Settings → Webhooks → Add webhook</strong>:
        </p>
        <ul className="mt-3 space-y-2 text-sm text-slate-400">
          <li className="flex gap-2"><span className="text-blue-400">•</span><strong className="text-slate-300">Payload URL:</strong> Your Ferryhook source URL</li>
          <li className="flex gap-2"><span className="text-blue-400">•</span><strong className="text-slate-300">Content type:</strong> <code className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-slate-300">application/json</code></li>
          <li className="flex gap-2"><span className="text-blue-400">•</span><strong className="text-slate-300">Secret:</strong> Generate a strong secret and save it</li>
          <li className="flex gap-2"><span className="text-blue-400">•</span><strong className="text-slate-300">Events:</strong> Select specific events or &quot;Send me everything&quot;</li>
        </ul>
      </div>

      {/* Step 3 */}
      <div className="mt-10">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600/20 font-mono text-xs font-bold text-blue-400">3</span>
          <h2 className="font-display text-lg font-semibold text-white">Add the signing secret to Ferryhook</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Copy the secret you set in GitHub and paste it into your Ferryhook source settings. Ferryhook verifies the <code className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-slate-300">X-Hub-Signature-256</code> header on every request.
        </p>
      </div>

      {/* Step 4 */}
      <div className="mt-10">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600/20 font-mono text-xs font-bold text-blue-400">4</span>
          <h2 className="font-display text-lg font-semibold text-white">Add a connection</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Create a connection to forward events to your server. Use filters to route different event types:
        </p>
        <div className="mt-3">
          <CodeBlock
            language="json"
            code={`{
  "name": "Push Events to CI",
  "destinationUrl": "https://ci.yourapp.com/hooks/github",
  "filters": [
    {
      "path": "$.ref",
      "operator": "equals",
      "value": "refs/heads/main"
    }
  ]
}`}
          />
        </div>
      </div>

      {/* Test */}
      <div className="mt-10">
        <h2 className="font-display text-lg font-semibold text-white">Test it</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Push a commit, open a PR, or use GitHub&apos;s &quot;Redeliver&quot; button on a recent delivery. Watch the event appear in your Ferryhook dashboard in real-time.
        </p>
      </div>

      <p className="mt-12 border-t border-slate-800/40 pt-6 text-xs text-slate-600">
        <a href="https://github.com/ferryhook/ferryhook/edit/main/docs/integrations/github.md" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 transition-colors">
          Edit this page on GitHub →
        </a>
      </p>
    </div>
  );
}
