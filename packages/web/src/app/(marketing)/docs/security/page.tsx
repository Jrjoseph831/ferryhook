import type { Metadata } from "next";
import { CodeBlock } from "@/components/marketing/CodeBlock";

export const metadata: Metadata = {
  title: "Security",
  description: "How Ferryhook handles encryption, signature verification, SSRF protection, and rate limiting.",
};

export default function SecurityPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-white">Security</h1>
      <p className="mt-3 text-base leading-relaxed text-slate-400">
        Ferryhook is designed with security at every layer. This page details our encryption, authentication, and protection mechanisms.
      </p>

      {/* Encryption */}
      <div className="mt-10">
        <h2 className="font-display text-xl font-bold text-white">Encryption</h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-400">
          <p>
            <strong className="text-slate-200">In transit:</strong> All traffic uses TLS 1.2+ with HSTS headers enforced. HTTP requests are rejected — never redirected — to prevent downgrade attacks.
          </p>
          <p>
            <strong className="text-slate-200">At rest:</strong> DynamoDB uses AWS-managed AES-256 encryption via KMS. Redis has both in-transit and at-rest encryption enabled.
          </p>
          <p>
            <strong className="text-slate-200">Sensitive fields:</strong> Signing secrets are encrypted per-user before storage. API keys are SHA-256 hashed — the plaintext is never stored. Passwords use bcrypt with cost factor 12.
          </p>
        </div>
      </div>

      {/* Inbound Signature Verification */}
      <div className="mt-10">
        <h2 className="font-display text-xl font-bold text-white">Inbound Signature Verification</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          When you configure a signing secret on a source, Ferryhook verifies the signature of every incoming webhook before processing it. We support the signature formats of common providers:
        </p>
        <ul className="mt-4 space-y-2 text-sm text-slate-400">
          <li className="flex gap-2">
            <span className="text-blue-400">•</span>
            <strong className="text-slate-300">Stripe</strong> — <code className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-slate-300">Stripe-Signature</code> header with timestamp-prefixed HMAC-SHA256
          </li>
          <li className="flex gap-2">
            <span className="text-blue-400">•</span>
            <strong className="text-slate-300">GitHub</strong> — <code className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-slate-300">X-Hub-Signature-256</code> header with SHA-256 HMAC
          </li>
          <li className="flex gap-2">
            <span className="text-blue-400">•</span>
            <strong className="text-slate-300">Shopify</strong> — <code className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-slate-300">X-Shopify-Hmac-Sha256</code> header with base64-encoded HMAC
          </li>
          <li className="flex gap-2">
            <span className="text-blue-400">•</span>
            <strong className="text-slate-300">Generic HMAC-SHA256</strong> — For any custom provider
          </li>
        </ul>
        <p className="mt-3 text-sm text-slate-500">
          All verification uses timing-safe comparison to prevent timing attacks.
        </p>
      </div>

      {/* Outbound Signatures */}
      <div className="mt-10">
        <h2 className="font-display text-xl font-bold text-white">Outbound Delivery Signatures</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Every webhook Ferryhook delivers to your destination includes a signature so you can verify it came from us:
        </p>
        <div className="mt-4">
          <CodeBlock
            language="bash"
            code={`X-Ferryhook-Event-Id: evt_abc123
X-Ferryhook-Timestamp: 1709251200
X-Ferryhook-Signature: t=1709251200,v1=5257a869e7ecebeda...`}
          />
        </div>
        <p className="mt-3 text-sm text-slate-400">
          The signature follows the Stripe convention for familiarity. We provide verification code samples for Node.js, Python, Go, Ruby, and PHP in our{" "}
          <a href="/docs/api-reference" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
            API reference
          </a>.
        </p>
      </div>

      {/* SSRF Protection */}
      <div className="mt-10">
        <h2 className="font-display text-xl font-bold text-white">SSRF Protection</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Destination URLs are validated at two points to prevent Server-Side Request Forgery attacks:
        </p>
        <ul className="mt-4 space-y-2 text-sm text-slate-400">
          <li className="flex gap-2">
            <span className="text-blue-400">1.</span>
            <strong className="text-slate-300">Configuration time</strong> — When creating/updating a connection, the URL is checked against a blocklist
          </li>
          <li className="flex gap-2">
            <span className="text-blue-400">2.</span>
            <strong className="text-slate-300">Delivery time</strong> — Before the HTTP request, the resolved IP is re-validated to prevent DNS rebinding attacks
          </li>
        </ul>
        <p className="mt-3 text-sm text-slate-400">
          Blocked patterns include: loopback (127.x), private networks (10.x, 172.16-31.x, 192.168.x), link-local (169.254.x), and all IPv6 equivalents.
        </p>
      </div>

      {/* Rate Limiting */}
      <div className="mt-10">
        <h2 className="font-display text-xl font-bold text-white">Rate Limiting</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Ferryhook applies rate limits at multiple levels to ensure stability:
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="pb-2 pr-6 text-left text-xs font-semibold text-slate-500">Scope</th>
                <th className="pb-2 pr-6 text-left text-xs font-semibold text-slate-500">Limit</th>
                <th className="pb-2 text-left text-xs font-semibold text-slate-500">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr><td className="py-2 pr-6 text-slate-300">Free source</td><td className="py-2 pr-6 text-slate-400">100/min</td><td className="py-2 text-slate-500">Per-source sliding window</td></tr>
              <tr><td className="py-2 pr-6 text-slate-300">Starter source</td><td className="py-2 pr-6 text-slate-400">500/min</td><td className="py-2 text-slate-500">Per-source sliding window</td></tr>
              <tr><td className="py-2 pr-6 text-slate-300">Pro source</td><td className="py-2 pr-6 text-slate-400">2,000/min</td><td className="py-2 text-slate-500">Per-source sliding window</td></tr>
              <tr><td className="py-2 pr-6 text-slate-300">Team source</td><td className="py-2 pr-6 text-slate-400">10,000/min</td><td className="py-2 text-slate-500">Per-source sliding window</td></tr>
              <tr><td className="py-2 pr-6 text-slate-300">API key</td><td className="py-2 pr-6 text-slate-400">100/min</td><td className="py-2 text-slate-500">Per-key</td></tr>
              <tr><td className="py-2 pr-6 text-slate-300">User API</td><td className="py-2 pr-6 text-slate-400">1,000/min</td><td className="py-2 text-slate-500">Across all keys</td></tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-slate-400">
          Exceeded requests return <code className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-slate-300">429 Too Many Requests</code> with a <code className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-slate-300">Retry-After</code> header.
        </p>
      </div>

      {/* Security Headers */}
      <div className="mt-10">
        <h2 className="font-display text-xl font-bold text-white">Security Headers</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          All API responses include industry-standard security headers:
        </p>
        <div className="mt-4">
          <CodeBlock
            language="bash"
            code={`Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()`}
          />
        </div>
      </div>

      <p className="mt-12 border-t border-slate-800/40 pt-6 text-xs text-slate-600">
        <a href="https://github.com/ferryhook/ferryhook/edit/main/docs/security.md" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 transition-colors">
          Edit this page on GitHub →
        </a>
      </p>
    </div>
  );
}
