"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { formatRelativeTime } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";

interface EventItem {
  id: string;
  sourceId: string;
  status: string;
  sourceIp: string;
  receivedAt: string;
}

interface EventLogProps {
  sourceId: string;
  status?: string;
}

export function EventLog({ sourceId, status }: EventLogProps) {
  const router = useRouter();
  const query = status ? `?status=${status}` : "";

  const { data, isLoading } = useQuery({
    queryKey: ["events", sourceId, status],
    queryFn: () =>
      api.get<EventItem[]>(`/v1/sources/${sourceId}/events${query}`),
    refetchInterval: 5000, // Poll every 5 seconds
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-10 bg-slate-800/50 rounded animate-pulse"
          />
        ))}
      </div>
    );
  }

  const events = data ?? [];

  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 text-sm">
        No events yet. Send a webhook to get started.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableHead>Time</TableHead>
        <TableHead>Event ID</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Source IP</TableHead>
      </TableHeader>
      <TableBody>
        {events.map((evt) => (
          <TableRow
            key={evt.id}
            onClick={() => router.push(`/events/${evt.id}`)}
          >
            <TableCell className="text-xs text-slate-500 whitespace-nowrap">
              {formatRelativeTime(evt.receivedAt)}
            </TableCell>
            <TableCell>
              <code className="text-xs font-mono text-slate-400">
                {evt.id.substring(0, 16)}...
              </code>
            </TableCell>
            <TableCell>
              <StatusBadge status={evt.status} />
            </TableCell>
            <TableCell className="text-xs font-mono text-slate-500">
              {evt.sourceIp}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
