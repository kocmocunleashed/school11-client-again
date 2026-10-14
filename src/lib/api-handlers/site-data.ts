import { isPublicPage, publicPageData } from "../public-page-data";
import { noStoreJson } from "./http";

export async function siteDataHandler(request?: Request) {
  const page = request ? new URL(request.url).searchParams.get("page") : null;
  if (page !== null && !isPublicPage(page)) return noStoreJson({ error: "Unknown public page" }, { status: 400 });
  try {
    const { getSiteData } = await import("../site-data");
    const data = await getSiteData();
    return noStoreJson(page !== null && isPublicPage(page) ? publicPageData(data, page) : data);
  } catch (error) {
    console.error("Site data fetch failed:", error);
    return noStoreJson({ error: "Сургуулийн мэдээллийг одоогоор ачаалж чадсангүй." }, { status: 503 });
  }
}
