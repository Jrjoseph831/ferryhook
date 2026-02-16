import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Ferryhook Terms of Service. Plain-language terms for our webhook infrastructure platform.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-white">Terms of Service</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: February 15, 2026</p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-slate-400">
        <section>
          <h2 className="font-display text-lg font-semibold text-slate-200">1. Service Description</h2>
          <p className="mt-3">
            Ferryhook (&quot;we,&quot; &quot;us,&quot; &quot;our&quot;) provides a webhook relay, transformation, and delivery platform (&quot;the Service&quot;). The Service receives webhook events from third-party providers, processes them according to your configuration (filtering, transformation), and delivers them to your designated endpoints with guaranteed reliability and automatic retries.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-slate-200">2. Account Terms</h2>
          <p className="mt-3">
            You must provide accurate information when creating an account. You are responsible for maintaining the security of your account credentials, API keys, and signing secrets. You must be at least 16 years old to use the Service. One person or legal entity may maintain multiple accounts, but each account must be for a distinct use case.
          </p>
          <p className="mt-2">
            You are responsible for all activity that occurs under your account, including actions taken by any person or system using your API keys.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-slate-200">3. Acceptable Use</h2>
          <p className="mt-3">You agree not to use the Service to:</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-slate-500">
            <li>Relay content that is illegal, abusive, or violates the rights of others</li>
            <li>Distribute malware, phishing content, or spam</li>
            <li>Attempt to circumvent rate limits or plan restrictions</li>
            <li>Use the Service for cryptocurrency mining, DDoS amplification, or similar abusive activities</li>
            <li>Reverse-engineer, decompile, or attempt to extract the source code of the Service</li>
            <li>Resell or redistribute the Service without our written permission</li>
          </ul>
          <p className="mt-2">
            We reserve the right to suspend or terminate accounts that violate these terms, with notice when reasonably possible.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-slate-200">4. Payment Terms</h2>
          <p className="mt-3">
            Paid plans are billed monthly via Stripe. Prices are in USD. You authorize us to charge your payment method on file for the subscription amount plus any overage charges. Upgrades take effect immediately with prorated billing. Downgrades take effect at the start of the next billing cycle. Refunds are provided at our discretion for billing errors.
          </p>
          <p className="mt-2">
            The Free plan has no time limit and does not require a credit card. We reserve the right to modify pricing with 30 days notice to affected users.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-slate-200">5. Data Handling</h2>
          <p className="mt-3">
            Webhook payloads pass through our systems and are stored temporarily for debugging and replay purposes. Retention periods vary by plan (24 hours to 90 days). We do not analyze, sell, or share the content of your webhook payloads. All data is encrypted in transit (TLS 1.2+) and at rest (AES-256). See our <a href="/privacy" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">Privacy Policy</a> for full details.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-slate-200">6. Service Availability</h2>
          <p className="mt-3">
            We strive for 99.9% uptime but do not guarantee it. The Service is provided on an &quot;as is&quot; and &quot;as available&quot; basis. Scheduled maintenance will be communicated in advance when possible. We are not responsible for downtime caused by third-party providers, your destination endpoints, or force majeure events.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-slate-200">7. Limitation of Liability</h2>
          <p className="mt-3">
            To the maximum extent permitted by law, Ferryhook shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including lost profits, data, or business opportunities, arising from your use of the Service. Our total liability is limited to the amount you have paid us in the 12 months preceding the claim.
          </p>
          <p className="mt-2">
            Ferryhook is an intermediary. We are not responsible for the content of webhooks relayed through our platform or for the behavior of third-party services that send or receive those webhooks.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-slate-200">8. Termination</h2>
          <p className="mt-3">
            You may cancel your account at any time from the dashboard settings or by contacting support@ferryhook.io. Upon cancellation, your data will be deleted within 30 days. We may suspend or terminate accounts that violate these terms. If we terminate your account without cause, we will refund any prepaid fees for the unused period.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-slate-200">9. Changes to Terms</h2>
          <p className="mt-3">
            We may update these terms from time to time. We will notify you of significant changes via email or a banner in the dashboard at least 30 days before they take effect. Continued use of the Service after changes take effect constitutes acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-slate-200">10. Contact</h2>
          <p className="mt-3">
            Questions about these terms? Email us at{" "}
            <a href="mailto:legal@ferryhook.io" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
              legal@ferryhook.io
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
