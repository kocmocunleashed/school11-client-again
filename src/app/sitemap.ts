import type { MetadataRoute } from "next";
import { schoolSiteUrl } from "@/lib/school-site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = schoolSiteUrl;
  return ["", "/about", "/achievements", "/courses", "/news", "/apply"].map(path => ({ url: `${base}${path}`, lastModified: new Date("2026-09-02"), changeFrequency: path ? "monthly" : "weekly", priority: path ? 0.8 : 1 }));
}
