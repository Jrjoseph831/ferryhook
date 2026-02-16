"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { PayloadViewer } from "@/components/dashboard/PayloadViewer";
import { api } from "@/lib/api";

interface EventDetail {
  id: string;
  sourceId: string;
  status: string;
  headers: Record<string, string>;
  body: string;
  sourceIp: string;
  receivedAt: string;
  processedAt: string | null;
  deliveredAt: string | null;
  attempts?: AttemptDetail[];
}

interface AttemptDetail {
  number: number;
  connectionId: string;
  destinationUrl: string;
  statusCode: number;
  latencyMs: number;
  error: string | null;
  attemptedAt: string;
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: () => api.get<EventDetail>(`/v1/events/${id}`),
  });

  const replay = useMutation({
    mutationFn: () => api.post(`/v1/events/${id}/replay`),
    onSuccess: () => {
      toast.success("Event replayed");
      queryClient.invalidateQueries({ queryKey: ["event", id] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Replay failed");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-slate-800 animate-pulse rounded" />
        <div className="h-64 bg-slate-800 animate-pulse rounded" />
      </div>
    );
  }

  if (!event) {
    return <p className="text-slate-500">Event not found</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-slate-100">Event Detail</h1>
          <StatusBadge status={event.status} />
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => replay.mutate()}
          disabled={replay.isPending}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {replay.isPending ? "Replaying..." : "Replay"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardTitle>Event ID</CardTitle>
          <code className="text-xs font-mono text-slate-400 mt-1 block break-all">
            {event.id}
          </code>
        </Card>
        <Card>
          <CardTitle>Source IP</CardTitle>
          <code className="text-xs font-mono text-slate-400 mt-1 block">
            {event.sourceIp}
          </code>
        </Card>
        <Card>
          <CardTitle>Received</CardTitle>
          <p className="text-sm text-slate-300 mt-1">
            {new Date(event.receivedAt).toLocaleString()}
          </p>
        </Card>
      </div>

      {/* Headers */}
      <Card>
        <CardTitle>Headers</CardTitle>
        <div className="mt-2">
          <PayloadViewer data={JSON.stringify(event.headers)} maxHeight="200px" />
        </div>
      </Card>

      {/* Body */}
      <Card>
        <CardTitle>Payload</CardTitle>
        <div className="mt-2">
          <PayloadViewer data={event.body} />
        </div>
      </Card>

      {/* Delivery Attempts */}
      {event.attempts && event.attempts.length > 0 && (
        <Card>
          <CardTitle>Delivery Attempts</CardTitle>
          <div className="mt-3 space-y-2">
            {event.attempts.map((att) => (
              <div
                key={att.number}
                className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-6">
                    #{att.number}
                  </span>
                  <code className="text-xs font-mono text-slate-400 truncate max-w-xs">
                    {att.destinationUrl}
                  </code>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">
                    {att.latencyMs}ms
                  </span>
                  <span
                    className={`text-xs font-mono ${
                      att.statusCode >= 200 && att.statusCode < 300
                        ? "text-emerald-400"
                        : att.statusCode > 0
                          ? "text-red-400"
                          : "text-slate-500"
                    }`}
                  >
                    {att.statusCode > 0 ? att.statusCode : "ERR"}
                  </span>
                  {att.error && (
                    <span className="text-xs text-red-400 truncate max-w-32">
                      {att.error}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
