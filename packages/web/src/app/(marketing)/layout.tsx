import type { Metadata } from "next";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { Footer } from "@/components/marketing/Footer";

export const metadata: Metadata = {
  title: {
    default: "Ferryhook — Never miss a webhook again",
    template: "%s | Ferryhook",
  },
  description:
    "Receive, transform, and deliver webhooks with guaranteed reliability. Free forever for small projects.",
  openGraph: {
    title: "Ferryhook — Never miss a webhook again",
    description:
      "Receive, transform, and deliver webhooks with guaranteed reliability. Free forever for small projects.",
    url: "https://ferryhook.io",
    siteName: "Ferryhook",
    type: "website",
    images: [{ url: "https://ferryhook.io/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ferryhook — Never miss a webhook again",
    description:
      "Receive, transform, and deliver webhooks with guaranteed reliability.",
    images: ["https://ferryhook.io/og.png"],
  },
  metadataBase: new URL("https://ferryhook.io"),
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <MarketingNav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
