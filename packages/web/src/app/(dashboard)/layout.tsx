"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Webhook,
  Activity,
  BarChart3,
  Key,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";

const nav = [
  { href: "/dashboard", label: "Overview", icon: Activity },
  { href: "/sources", label: "Sources", icon: Webhook },
  { href: "/analytics", label: "Analytics", icon: BarChart3, disabled: true },
  { href: "/api-keys", label: "API Keys", icon: Key },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r border-slate-800 bg-slate-900 transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center gap-2 px-4 h-14 border-b border-slate-800">
          <Webhook className="w-5 h-5 text-blue-400" />
          <span className="font-semibold text-slate-100">Ferryhook</span>
          <button
            className="ml-auto lg:hidden text-slate-400"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {nav.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.disabled ? "#" : item.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-slate-800 text-slate-100"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50",
                  item.disabled && "opacity-50 pointer-events-none"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-slate-800 p-3 space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="default">{user?.plan ?? "free"}</Badge>
            <span className="text-xs text-slate-500 truncate">
              {user?.email}
            </span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="flex items-center h-14 px-4 border-b border-slate-800 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-400"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="ml-3 font-semibold text-slate-100">Ferryhook</span>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
