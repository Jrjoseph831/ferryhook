import Link from "next/link";
import { Anchor, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold text-white">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
          <Anchor className="h-4 w-4 text-white" />
        </div>
        Ferryhook
      </Link>

      {/* 404 */}
      <div className="mt-12 text-center">
        <p className="font-mono text-7xl font-bold text-slate-800 sm:text-9xl">404</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-white">Page not found</h1>
        <p className="mt-2 text-sm text-slate-500">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Home
        </Link>
        <Link
          href="/docs"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 transition-all hover:border-slate-600 hover:text-white"
        >
          Documentation
        </Link>
      </div>

      {/* Decorative grid */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.015]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}
