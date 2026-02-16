import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://ferryhook.io";

  const marketingPages = [
    "",
    "/pricing",
    "/terms",
    "/privacy",
    "/status",
  ];

  const docsPages = [
    "/docs",
    "/docs/quickstart",
    "/docs/concepts",
    "/docs/api-reference",
    "/docs/security",
    "/docs/integrations/stripe",
    "/docs/integrations/github",
    "/docs/integrations/shopify",
  ];

  const authPages = [
    "/login",
    "/signup",
  ];

  const allPages = [...marketingPages, ...docsPages, ...authPages];

  return allPages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path.startsWith("/docs") ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/pricing" ? 0.9 : path.startsWith("/docs") ? 0.7 : 0.5,
  }));
}
