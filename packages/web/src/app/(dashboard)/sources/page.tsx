"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Plus, Webhook, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SourceUrlDisplay } from "@/components/dashboard/SourceUrlDisplay";
import { api } from "@/lib/api";
import { formatRelativeTime, formatNumber } from "@/lib/utils";

interface SourceItem {
  id: string;
  name: string;
  provider: string;
  url: string;
  status: string;
  eventCount: number;
  lastEventAt: string | null;
  createdAt: string;
}

const providerIcons: Record<string, string> = {
  stripe: "S",
  github: "G",
  shopify: "Sh",
  twilio: "T",
  sendgrid: "SG",
  slack: "Sl",
  custom: "C",
};

export default function SourcesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["sources"],
    queryFn: () => api.get<SourceItem[]>("/v1/sources"),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-100">Sources</h1>
        <Link href="/sources/new">
          <Button size="sm">
            <Plus className="w-3.5 h-3.5" />
            Create Source
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 bg-slate-900 border border-slate-800 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (data ?? []).length === 0 ? (
        <Card className="text-center py-12">
          <Webhook className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No sources yet</p>
          <p className="text-slate-600 text-xs mt-1">
            Create a source to start receiving webhooks
          </p>
          <Link href="/sources/new">
            <Button size="sm" className="mt-4">
              <Plus className="w-3.5 h-3.5" />
              Create Source
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {(data ?? []).map((source) => (
            <Link key={source.id} href={`/sources/${source.id}`}>
              <Card className="hover:border-slate-700 transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-xs font-medium text-slate-400">
                      {providerIcons[source.provider] ?? "?"}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-200">
                        {source.name}
                      </h3>
                      <p className="text-xs text-slate-500">{source.provider}</p>
                    </div>
                  </div>
                  <Badge
                    variant={source.status === "active" ? "delivered" : "default"}
                  >
                    {source.status}
                  </Badge>
                </div>

                <SourceUrlDisplay url={source.url} />

                <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                  <span>{formatNumber(source.eventCount)} events</span>
                  {source.lastEventAt && (
                    <span>Last: {formatRelativeTime(source.lastEventAt)}</span>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
