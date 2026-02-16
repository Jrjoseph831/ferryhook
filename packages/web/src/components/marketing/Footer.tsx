import Link from "next/link";
import { Anchor } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Status", href: "/status" },
    { label: "Changelog", href: "#" },
  ],
  Developers: [
    { label: "Documentation", href: "/docs" },
    { label: "API Reference", href: "/docs/api-reference" },
    { label: "Quickstart", href: "/docs/quickstart" },
    { label: "Integrations", href: "/docs/integrations/stripe" },
  ],
  Company: [
    { label: "Blog", href: "#" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
  ],
  Connect: [
    { label: "GitHub", href: "https://github.com/ferryhook" },
    { label: "Twitter / X", href: "https://x.com/ferryhook" },
    { label: "Discord", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-slate-800/60 bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold text-white">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600">
                <Anchor className="h-3.5 w-3.5 text-white" />
              </div>
              Ferryhook
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              Webhook infrastructure that just works. Receive, transform, deliver.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {heading}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 transition-colors hover:text-slate-300"
                      {...(link.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800/60 pt-8 md:flex-row">
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} Ferryhook. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-xs text-slate-600 hover:text-slate-400">
              Terms
            </Link>
            <Link href="/privacy" className="text-xs text-slate-600 hover:text-slate-400">
              Privacy
            </Link>
            <Link href="/status" className="text-xs text-slate-600 hover:text-slate-400">
              Status
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
