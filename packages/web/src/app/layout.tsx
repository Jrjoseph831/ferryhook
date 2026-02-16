import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Ferryhook — Never miss a webhook again",
    template: "%s | Ferryhook",
  },
  description:
    "Receive, transform, and deliver webhooks with guaranteed reliability. Free forever for small projects.",
  metadataBase: new URL("https://ferryhook.io"),
  openGraph: {
    title: "Ferryhook — Never miss a webhook again",
    description:
      "Receive, transform, and deliver webhooks with guaranteed reliability.",
    url: "https://ferryhook.io",
    siteName: "Ferryhook",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ferryhook — Never miss a webhook again",
    description:
      "Receive, transform, and deliver webhooks with guaranteed reliability.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans">
        <Providers>
          {children}
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#1e293b",
                border: "1px solid #334155",
                color: "#f8fafc",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
