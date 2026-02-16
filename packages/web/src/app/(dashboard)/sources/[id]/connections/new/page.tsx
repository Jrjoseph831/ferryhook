"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

export default function CreateConnectionPage() {
  const { id: sourceId } = useParams<{ id: string }>();
  const router = useRouter();
  const [name, setName] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post(`/v1/sources/${sourceId}/connections`, {
        name,
        destinationUrl,
      });
      toast.success("Connection created!");
      router.push(`/sources/${sourceId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create connection");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-lg font-semibold text-slate-100">Add Connection</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="name"
          label="Name"
          placeholder="Production Server"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          id="destinationUrl"
          label="Destination URL"
          placeholder="https://api.example.com/webhooks"
          type="url"
          value={destinationUrl}
          onChange={(e) => setDestinationUrl(e.target.value)}
          required
        />

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Connection"}
          </Button>
          <Button variant="secondary" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
