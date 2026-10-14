import { getSiteData } from "@/lib/site-data";
import { publicPageData, type PublicPage } from "@/lib/public-page-data";
import { SiteDataProvider } from "./site-data-provider";

export async function SitePage({ page, children }: { page: PublicPage; children: React.ReactNode }) {
  return <SiteDataProvider initial={publicPageData(await getSiteData(), page)}>{children}</SiteDataProvider>;
}
