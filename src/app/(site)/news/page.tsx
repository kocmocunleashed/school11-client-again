import { SitePage } from "@/components/site/site-page";
import type { Metadata } from "next";
import { NewsBrowser } from "@/components/site/news-browser";
import { PageIntro } from "@/components/site/page-intro";
export const metadata: Metadata = { title: "Мэдээ" };
export default async function NewsPage() {
  return <SitePage page="news"><main id="main-content" className="inner-page shell mx-auto w-[var(--shell)]"><PageIntro page="news" title="Сургуулийн мэдээ" description="Сурагчдын амжилт, сургуулийн үйл явдал, хамт олны мэдээ." /><NewsBrowser /></main></SitePage>;
}
