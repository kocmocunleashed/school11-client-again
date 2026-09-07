import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.SITE_URL || "http://localhost:3000";
  return ["", "/about", "/achievements", "/courses", "/news", "/apply"].map(path => ({ url: `${base}${path}`, lastModified: new Date("2026-09-02"), changeFrequency: path ? "monthly" : "weekly", priority: path ? 0.8 : 1 }));
}
