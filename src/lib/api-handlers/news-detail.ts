import { noStoreJson } from "./http";

export async function newsDetailHandler(id: string) {
  if (!id || id.length > 200) return noStoreJson({ error: "Мэдээ олдсонгүй." }, { status: 404 });
  try {
    const { getSiteData } = await import("../site-data");
    const article = (await getSiteData()).news.find(item => item.id === id && item.is_published);
    if (!article) return noStoreJson({ error: "Мэдээ олдсонгүй." }, { status: 404 });
    return noStoreJson(article);
  } catch (error) {
    console.error("News detail fetch failed:", error);
    return noStoreJson({ error: "Мэдээг одоогоор ачаалж чадсангүй." }, { status: 503 });
  }
}
