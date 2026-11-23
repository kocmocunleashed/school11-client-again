import type { MetadataRoute } from "next";
import { schoolSiteUrl } from "@/lib/school-site-url";

export default function robots(): MetadataRoute.Robots {
  const base = schoolSiteUrl;
  return { rules: [{ userAgent: "*", allow: "/", disallow: "/admin/" }], sitemap: `${base}/sitemap.xml` };
}
