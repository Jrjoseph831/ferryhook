"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, X } from "lucide-react";

const navSections = [
  {
    title: "Getting Started",
    links: [
      { label: "Overview", href: "/docs" },
      { label: "Quickstart", href: "/docs/quickstart" },
      { label: "Core Concepts", href: "/docs/concepts" },
    ],
  },
  {
    title: "Reference",
    links: [
      { label: "API Reference", href: "/docs/api-reference" },
      { label: "Security", href: "/docs/security" },
    ],
  },
  {
    title: "Integrations",
    links: [
      { label: "Stripe", href: "/docs/integrations/stripe" },
      { label: "GitHub", href: "/docs/integrations/github" },
      { label: "Shopify", href: "/docs/integrations/shopify" },
    ],
  },
];

export function DocsNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <>
      {/* Search placeholder */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
        <input
          type="text"
          placeholder="Search docs..."
          disabled
          className="w-full rounded-lg border border-slate-800 bg-slate-900/50 py-2 pl-9 pr-3 text-sm text-slate-400 placeholder:text-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
          title="Search coming soon — powered by Algolia DocSearch"
        />
      </div>

      <nav className="space-y-6">
        {navSections.map((section) => (
          <div key={section.title}>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {section.title}
            </h4>
            <ul className="mt-2.5 space-y-0.5">
              {section.links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`block rounded-md px-3 py-1.5 text-sm transition-colors ${
                        isActive
                          ? "bg-blue-600/10 font-medium text-blue-400"
                          : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg lg:hidden"
        aria-label="Toggle docs navigation"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-full w-72 overflow-y-auto border-r border-slate-800 bg-slate-950 p-6 pt-20 transition-transform lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 lg:block">
        <div className="sticky top-24">
          {sidebarContent}
        </div>
      </aside>
    </>
  );
}
