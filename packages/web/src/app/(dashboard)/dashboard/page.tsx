"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity, Webhook, CheckCircle, AlertTriangle } from "lucide-react";
import { Card, CardTitle, CardValue } from "@/components/ui/card";
import { api } from "@/lib/api";
import { formatNumber } from "@/lib/utils";

interface OverviewData {
  period: string;
  totalEvents: number;
  byStatus: {
    delivered: number;
    failed: number;
    retrying: number;
    filtered: number;
  };
  successRate: number;
  activeSources: number;
  usage: {
    current: number;
    limit: number;
    plan: string;
  };
}

export default function DashboardOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: () => api.get<OverviewData>("/v1/analytics/overview?period=7d"),
    refetchInterval: 30_000,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-slate-100">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <CardTitle>Events (7d)</CardTitle>
          </div>
          <CardValue>
            {isLoading ? (
              <div className="h-8 w-20 bg-slate-800 animate-pulse rounded" />
            ) : (
              formatNumber(data?.totalEvents ?? 0)
            )}
          </CardValue>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <CardTitle>Success Rate</CardTitle>
          </div>
          <CardValue>
            {isLoading ? (
              <div className="h-8 w-16 bg-slate-800 animate-pulse rounded" />
            ) : (
              <span className={data?.successRate === 100 ? "text-emerald-400" : ""}>
                {data?.successRate ?? 100}%
              </span>
            )}
          </CardValue>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-2">
            <Webhook className="w-4 h-4 text-purple-400" />
            <CardTitle>Active Sources</CardTitle>
          </div>
          <CardValue>
            {isLoading ? (
              <div className="h-8 w-12 bg-slate-800 animate-pulse rounded" />
            ) : (
              data?.activeSources ?? 0
            )}
          </CardValue>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <CardTitle>Failed (7d)</CardTitle>
          </div>
          <CardValue>
            {isLoading ? (
              <div className="h-8 w-12 bg-slate-800 animate-pulse rounded" />
            ) : (
              <span className={(data?.byStatus.failed ?? 0) > 0 ? "text-red-400" : ""}>
                {data?.byStatus.failed ?? 0}
              </span>
            )}
          </CardValue>
        </Card>
      </div>

      {/* Usage bar */}
      {data && (
        <Card>
          <div className="flex items-center justify-between mb-2">
            <CardTitle>Monthly Usage</CardTitle>
            <span className="text-xs text-slate-500">
              {formatNumber(data.usage.current)} / {formatNumber(data.usage.limit)} events
            </span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min((data.usage.current / data.usage.limit) * 100, 100)}%`,
                backgroundColor:
                  data.usage.current / data.usage.limit > 0.9
                    ? "#ef4444"
                    : data.usage.current / data.usage.limit > 0.7
                      ? "#f59e0b"
                      : "#3b82f6",
              }}
            />
          </div>
        </Card>
      )}
    </div>
  );
}
