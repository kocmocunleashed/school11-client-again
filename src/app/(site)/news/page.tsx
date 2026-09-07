import type { Metadata } from "next";
import { NewsBrowser } from "@/components/site/news-browser";
import { PageIntro } from "@/components/site/page-intro";
export const metadata: Metadata = { title: "Мэдээ" };
export default async function NewsPage() {
  return <main id="main-content" className="inner-page shell"><PageIntro eyebrow="Сургуулийн амьдрал" title="Бидэнд шинэ сонин." description="Сурагчдын амжилт, сургуулийн үйл явдал, хамт олны мэдээ." /><NewsBrowser /></main>;
}
