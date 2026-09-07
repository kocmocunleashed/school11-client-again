import { noStoreJson } from "./http";

export async function siteDataHandler() {
  try {
    const { getSiteData } = await import("../site-data");
    return noStoreJson(await getSiteData());
  } catch (error) {
    console.error("Site data fetch failed:", error);
    return noStoreJson({ error: "Сургуулийн мэдээллийг одоогоор ачаалж чадсангүй." }, { status: 503 });
  }
}
