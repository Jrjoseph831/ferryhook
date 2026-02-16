import type { Metadata } from "next";
import { DocsNav } from "@/components/marketing/DocsNav";

export const metadata: Metadata = {
  title: {
    default: "Documentation",
    template: "%s — Ferryhook Docs",
  },
  description: "Learn how to use Ferryhook to receive, transform, and deliver webhooks with guaranteed reliability.",
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="flex gap-10 py-10 lg:py-16">
        <DocsNav />
        <article className="min-w-0 flex-1 max-w-[720px]">
          {children}
        </article>
      </div>
    </div>
  );
}
