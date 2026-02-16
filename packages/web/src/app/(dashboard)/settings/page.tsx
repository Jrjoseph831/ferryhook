"use client";

import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { formatNumber } from "@/lib/utils";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  plan: string;
  usage: number;
  limit: number;
  stripeCustomerId: string | null;
  createdAt: string;
}

export default function SettingsPage() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => api.get<UserProfile>("/v1/auth/me"),
  });

  async function handleUpgrade() {
    try {
      const { url } = await api.post<{ url: string }>("/v1/billing/checkout", {
        plan: "starter",
      });
      window.location.href = url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start checkout");
    }
  }

  async function handleManageBilling() {
    try {
      const { url } = await api.post<{ url: string }>("/v1/billing/portal");
      window.location.href = url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to open billing portal");
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 bg-slate-800 animate-pulse rounded" />
        <div className="h-48 bg-slate-800 animate-pulse rounded" />
        <div className="h-48 bg-slate-800 animate-pulse rounded" />
      </div>
    );
  }

  if (!profile) {
    return <p className="text-slate-500">Failed to load profile</p>;
  }

  const usagePercent = profile.limit > 0
    ? Math.min((profile.usage / profile.limit) * 100, 100)
    : 0;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-lg font-semibold text-slate-100">Settings</h1>

      {/* Account Info */}
      <Card>
        <CardTitle>Account</CardTitle>
        <div className="mt-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">Name</span>
            <span className="text-sm text-slate-200">{profile.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">Email</span>
            <span className="text-sm text-slate-200">{profile.email}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">Member since</span>
            <span className="text-sm text-slate-200">
              {new Date(profile.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </Card>

      {/* Plan & Usage */}
      <Card>
        <div className="flex items-center justify-between">
          <CardTitle>Plan & Usage</CardTitle>
          <Badge
            variant={
              profile.plan === "free"
                ? "default"
                : profile.plan === "starter"
                  ? "received"
                  : profile.plan === "pro"
                    ? "delivered"
                    : "processing"
            }
          >
            {profile.plan}
          </Badge>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-500">
                Events this month
              </span>
              <span className="text-slate-400">
                {formatNumber(profile.usage)} / {formatNumber(profile.limit)}
              </span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  usagePercent > 90
                    ? "bg-red-500"
                    : usagePercent > 70
                      ? "bg-amber-500"
                      : "bg-blue-500"
                }`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            {profile.plan === "free" ? (
              <Button size="sm" onClick={handleUpgrade}>
                Upgrade Plan
              </Button>
            ) : (
              <Button size="sm" variant="secondary" onClick={handleManageBilling}>
                <ExternalLink className="w-3.5 h-3.5" />
                Manage Billing
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="border border-red-500/20">
        <CardTitle>Danger Zone</CardTitle>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-300">Delete Account</p>
            <p className="text-xs text-slate-600 mt-0.5">
              Permanently remove your account and all data
            </p>
          </div>
          <Button
            size="sm"
            variant="danger"
            onClick={() =>
              toast.error("Contact support@ferryhook.io to delete your account")
            }
          >
            Delete Account
          </Button>
        </div>
      </Card>
    </div>
  );
}
