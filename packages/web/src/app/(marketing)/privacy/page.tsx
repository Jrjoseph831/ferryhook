import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Ferryhook Privacy Policy. How we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-white">Privacy Policy</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: February 15, 2026</p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-slate-400">
        <section>
          <h2 className="font-display text-lg font-semibold text-slate-200">What Data We Collect</h2>
          <p className="mt-3">We collect the minimum data necessary to provide the Service:</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-slate-500">
            <li><strong className="text-slate-300">Account information:</strong> Name, email address, and hashed password</li>
            <li><strong className="text-slate-300">Webhook payloads:</strong> The content of webhook requests sent to your Ferryhook URLs, including headers and body</li>
            <li><strong className="text-slate-300">Usage metrics:</strong> Event counts, delivery success rates, latency measurements</li>
            <li><strong className="text-slate-300">Billing data:</strong> Payment processing is handled entirely by Stripe. We store your Stripe customer ID but never your credit card number</li>
            <li><strong className="text-slate-300">Technical data:</strong> IP addresses of inbound webhooks (for audit logging), source IP of API requests</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-slate-200">How We Use Your Data</h2>
          <ul className="mt-3 list-inside list-disc space-y-1 text-slate-500">
            <li>To provide, maintain, and improve the Service</li>
            <li>To process and deliver webhooks to your configured destinations</li>
            <li>To provide customer support and respond to your requests</li>
            <li>To send transactional emails (delivery failure alerts, plan limit warnings, billing receipts)</li>
            <li>To monitor service health and detect abuse</li>
            <li>To enforce our Terms of Service and rate limits</li>
          </ul>
          <p className="mt-2">
            We do <strong className="text-slate-200">not</strong> analyze the content of your webhook payloads for advertising, profiling, or any purpose beyond delivering them to your destinations and displaying them in your dashboard.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-slate-200">How We Store Your Data</h2>
          <p className="mt-3">All data is stored on Amazon Web Services (AWS) in the us-east-1 region:</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-slate-500">
            <li><strong className="text-slate-300">Database:</strong> Amazon DynamoDB with AES-256 encryption at rest via AWS KMS</li>
            <li><strong className="text-slate-300">Cache:</strong> Amazon ElastiCache (Redis) with in-transit and at-rest encryption</li>
            <li><strong className="text-slate-300">In transit:</strong> All traffic encrypted with TLS 1.2+. HTTP connections are rejected</li>
            <li><strong className="text-slate-300">Secrets:</strong> Signing secrets encrypted per-user. API keys stored as SHA-256 hashes. Passwords hashed with bcrypt</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-slate-200">Data Retention</h2>
          <p className="mt-3">Webhook event data is retained according to your plan:</p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="pb-2 pr-6 text-left text-xs font-semibold text-slate-500">Plan</th>
                  <th className="pb-2 text-left text-xs font-semibold text-slate-500">Event Retention</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                <tr><td className="py-2 pr-6 text-slate-300">Free</td><td className="py-2 text-slate-400">24 hours</td></tr>
                <tr><td className="py-2 pr-6 text-slate-300">Starter</td><td className="py-2 text-slate-400">7 days</td></tr>
                <tr><td className="py-2 pr-6 text-slate-300">Pro</td><td className="py-2 text-slate-400">30 days</td></tr>
                <tr><td className="py-2 pr-6 text-slate-300">Team</td><td className="py-2 text-slate-400">90 days</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3">
            After the retention period, event data (headers, body, delivery attempts) is automatically and permanently deleted via DynamoDB TTL. Account data is retained until you delete your account.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-slate-200">Third-Party Data Sharing</h2>
          <p className="mt-3">
            We do <strong className="text-slate-200">not</strong> sell, rent, or share your personal data or webhook payloads with third parties for marketing or advertising purposes. Period.
          </p>
          <p className="mt-2">We share data only with:</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-slate-500">
            <li><strong className="text-slate-300">Stripe:</strong> For payment processing (name, email, billing details)</li>
            <li><strong className="text-slate-300">Amazon Web Services:</strong> As our infrastructure provider (all data at rest and in transit)</li>
            <li><strong className="text-slate-300">Law enforcement:</strong> Only when legally required with a valid court order</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-slate-200">Cookies</h2>
          <p className="mt-3">
            We do <strong className="text-slate-200">not</strong> use tracking cookies, analytics cookies, or advertising cookies. We use only:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-slate-500">
            <li><strong className="text-slate-300">Session cookie:</strong> An httpOnly, secure, SameSite=Strict cookie containing your encrypted refresh token. This is essential for authentication and cannot be disabled</li>
          </ul>
          <p className="mt-2">That&apos;s it. No cookie banner needed because we don&apos;t track you.</p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-slate-200">Your Rights (GDPR)</h2>
          <p className="mt-3">
            If you are a resident of the European Economic Area, you have the following rights under GDPR:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-slate-500">
            <li><strong className="text-slate-300">Right of access:</strong> Request a copy of all data we hold about you</li>
            <li><strong className="text-slate-300">Right to rectification:</strong> Correct inaccurate personal data</li>
            <li><strong className="text-slate-300">Right to erasure:</strong> Request deletion of your account and all associated data</li>
            <li><strong className="text-slate-300">Right to data portability:</strong> Export your data in a machine-readable format (JSON)</li>
            <li><strong className="text-slate-300">Right to restrict processing:</strong> Request that we limit how we use your data</li>
            <li><strong className="text-slate-300">Right to object:</strong> Object to processing of your personal data</li>
          </ul>
          <p className="mt-2">
            To exercise any of these rights, email{" "}
            <a href="mailto:privacy@ferryhook.io" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
              privacy@ferryhook.io
            </a>
            . We will respond within 30 days.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-slate-200">Children&apos;s Privacy</h2>
          <p className="mt-3">
            The Service is not directed to children under 16. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, contact us and we will delete it promptly.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-slate-200">Changes to This Policy</h2>
          <p className="mt-3">
            We may update this policy from time to time. We will notify you of material changes via email at least 30 days before they take effect. The &quot;last updated&quot; date at the top reflects the most recent revision.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-slate-200">Contact</h2>
          <p className="mt-3">
            For privacy-related questions, email{" "}
            <a href="mailto:privacy@ferryhook.io" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
              privacy@ferryhook.io
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
