"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SourceUrlDisplay } from "@/components/dashboard/SourceUrlDisplay";
import { api } from "@/lib/api";

const providers = [
  { value: "stripe", label: "Stripe" },
  { value: "github", label: "GitHub" },
  { value: "shopify", label: "Shopify" },
  { value: "twilio", label: "Twilio" },
  { value: "sendgrid", label: "SendGrid" },
  { value: "slack", label: "Slack" },
  { value: "custom", label: "Custom" },
];

export default function CreateSourcePage() {
  const [name, setName] = useState("");
  const [provider, setProvider] = useState("custom");
  const [signingSecret, setSigningSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<{ id: string; url: string } | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await api.post<{ id: string; url: string }>("/v1/sources", {
        name,
        provider,
        ...(signingSecret ? { signingSecret } : {}),
      });
      setCreated(result);
      toast.success("Source created!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create source");
    } finally {
      setLoading(false);
    }
  }

  if (created) {
    return (
      <div className="max-w-lg space-y-6">
        <h1 className="text-lg font-semibold text-slate-100">Source Created</h1>
        <p className="text-sm text-slate-400">
          Your webhook URL is ready. Configure your provider to send webhooks to this URL:
        </p>
        <SourceUrlDisplay url={created.url} />
        <div className="flex gap-3">
          <Button onClick={() => router.push(`/sources/${created.id}`)}>
            View Source
          </Button>
          <Button variant="secondary" onClick={() => router.push("/sources")}>
            Back to Sources
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-lg font-semibold text-slate-100">Create Source</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="name"
          label="Name"
          placeholder="My Stripe Webhooks"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-300">
            Provider
          </label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {providers.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <Input
          id="signingSecret"
          label="Signing Secret (optional)"
          placeholder="whsec_..."
          type="password"
          value={signingSecret}
          onChange={(e) => setSigningSecret(e.target.value)}
        />

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Source"}
          </Button>
          <Button variant="secondary" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
