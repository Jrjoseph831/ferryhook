"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Copy, Check, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { api } from "@/lib/api";
import { formatRelativeTime } from "@/lib/utils";

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
}

interface CreateKeyResponse {
  id: string;
  name: string;
  prefix: string;
  key: string;
}

export default function ApiKeysPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [revealedKey, setRevealedKey] = useState<CreateKeyResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: keys, isLoading } = useQuery({
    queryKey: ["api-keys"],
    queryFn: () => api.get<ApiKey[]>("/v1/api-keys"),
  });

  const createKey = useMutation({
    mutationFn: (name: string) =>
      api.post<CreateKeyResponse>("/v1/api-keys", { name }),
    onSuccess: (data) => {
      setRevealedKey(data);
      setShowCreate(false);
      setNewKeyName("");
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to create key");
    },
  });

  const deleteKey = useMutation({
    mutationFn: (id: string) => api.delete(`/v1/api-keys/${id}`),
    onSuccess: () => {
      toast.success("API key deleted");
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to delete key");
    },
  });

  function handleCopy(key: string) {
    navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-100">API Keys</h1>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="w-3.5 h-3.5" />
          Create Key
        </Button>
      </div>

      {/* Create Key Form */}
      {showCreate && (
        <Card>
          <CardTitle>Create API Key</CardTitle>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newKeyName.trim()) createKey.mutate(newKeyName.trim());
            }}
            className="mt-3 flex gap-3 items-end"
          >
            <div className="flex-1">
              <Input
                id="key-name"
                label="Key Name"
                placeholder="Production API Key"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={createKey.isPending}>
              {createKey.isPending ? "Creating..." : "Create"}
            </Button>
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setShowCreate(false);
                setNewKeyName("");
              }}
            >
              Cancel
            </Button>
          </form>
        </Card>
      )}

      {/* Revealed Key Modal */}
      {revealedKey && (
        <Card className="border border-amber-500/30 bg-amber-950/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-sm font-medium text-amber-200">
                  Save your API key now
                </p>
                <p className="text-xs text-amber-400/70 mt-0.5">
                  This key will not be shown again. Store it securely.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-slate-900 rounded-md p-3">
                <code className="text-xs font-mono text-slate-200 flex-1 break-all select-all">
                  {revealedKey.key}
                </code>
                <button
                  onClick={() => handleCopy(revealedKey.key)}
                  className="text-slate-400 hover:text-slate-200 shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setRevealedKey(null)}
              >
                I&apos;ve saved this key
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Keys Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-10 bg-slate-800/50 rounded animate-pulse"
            />
          ))}
        </div>
      ) : (keys ?? []).length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-slate-500 text-sm">No API keys yet</p>
          <p className="text-slate-600 text-xs mt-1">
            Create a key to access the Ferryhook API programmatically
          </p>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableHead>Name</TableHead>
            <TableHead>Key</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Last Used</TableHead>
            <TableHead className="w-10" />
          </TableHeader>
          <TableBody>
            {(keys ?? []).map((k) => (
              <TableRow key={k.id}>
                <TableCell className="text-sm text-slate-200">
                  {k.name}
                </TableCell>
                <TableCell>
                  <code className="text-xs font-mono text-slate-500">
                    {k.prefix}...
                  </code>
                </TableCell>
                <TableCell className="text-xs text-slate-500">
                  {formatRelativeTime(k.createdAt)}
                </TableCell>
                <TableCell className="text-xs text-slate-500">
                  {k.lastUsedAt ? formatRelativeTime(k.lastUsedAt) : "Never"}
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => {
                      if (confirm(`Delete API key "${k.name}"?`)) {
                        deleteKey.mutate(k.id);
                      }
                    }}
                    className="text-slate-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
