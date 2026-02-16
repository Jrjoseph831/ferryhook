"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Plus, Settings } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { SourceUrlDisplay } from "@/components/dashboard/SourceUrlDisplay";
import { EventLog } from "@/components/dashboard/EventLog";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface SourceDetail {
  id: string;
  name: string;
  provider: string;
  url: string;
  status: string;
  eventCount: number;
  lastEventAt: string | null;
  signingAlgorithm?: string;
  createdAt: string;
}

interface ConnectionItem {
  id: string;
  name: string;
  destinationUrl: string;
  status: string;
  deliveryCount: number;
  failureCount: number;
}

type Tab = "events" | "connections" | "settings";

export default function SourceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<Tab>("events");

  const { data: source } = useQuery({
    queryKey: ["source", id],
    queryFn: () => api.get<SourceDetail>(`/v1/sources/${id}`),
  });

  const { data: connections } = useQuery({
    queryKey: ["connections", id],
    queryFn: () => api.get<ConnectionItem[]>(`/v1/sources/${id}/connections`),
    enabled: activeTab === "connections",
  });

  const tabs: { key: Tab; label: string }[] = [
    { key: "events", label: "Events" },
    { key: "connections", label: "Connections" },
    { key: "settings", label: "Settings" },
  ];

  return (
    <div className="space-y-6">
      {source && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-slate-100">
                {source.name}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">{source.provider}</p>
            </div>
            <Badge
              variant={source.status === "active" ? "delivered" : "default"}
            >
              {source.status}
            </Badge>
          </div>

          <SourceUrlDisplay url={source.url} />
        </>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px",
              activeTab === tab.key
                ? "border-blue-500 text-slate-100"
                : "border-transparent text-slate-500 hover:text-slate-300"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "events" && id && <EventLog sourceId={id} />}

      {activeTab === "connections" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Link href={`/sources/${id}/connections/new`}>
              <Button size="sm">
                <Plus className="w-3.5 h-3.5" />
                Add Connection
              </Button>
            </Link>
          </div>

          {(connections ?? []).length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-slate-500 text-sm">No connections yet</p>
              <p className="text-slate-600 text-xs mt-1">
                Add a connection to start delivering webhooks
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {(connections ?? []).map((conn) => (
                <Card key={conn.id} className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-slate-200">
                      {conn.name}
                    </h3>
                    <code className="text-xs font-mono text-slate-500 mt-0.5 block">
                      {conn.destinationUrl}
                    </code>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">
                      {conn.deliveryCount} delivered
                    </span>
                    <StatusBadge status={conn.status} />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "settings" && source && (
        <Card>
          <div className="space-y-4">
            <div>
              <CardTitle>Source ID</CardTitle>
              <code className="text-xs font-mono text-slate-400 mt-1 block">
                {source.id}
              </code>
            </div>
            <div>
              <CardTitle>Provider</CardTitle>
              <p className="text-sm text-slate-300 mt-1">{source.provider}</p>
            </div>
            <div>
              <CardTitle>Signing Algorithm</CardTitle>
              <p className="text-sm text-slate-300 mt-1">
                {source.signingAlgorithm ?? "none"}
              </p>
            </div>
            <div>
              <CardTitle>Created</CardTitle>
              <p className="text-sm text-slate-300 mt-1">
                {new Date(source.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
