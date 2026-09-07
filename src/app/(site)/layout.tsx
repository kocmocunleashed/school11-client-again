import { SiteDataProvider } from "@/components/site/site-data-provider";
import { getSiteData } from "@/lib/site-data";
export const dynamic = "force-dynamic";
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteDataProvider initial={await getSiteData()}>{children}</SiteDataProvider>;
}
