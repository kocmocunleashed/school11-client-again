import type { Metadata } from "next";
import { HallOfFame } from "@/components/site/hall-of-fame";
import { AchievementBrowser } from "@/components/site/achievement-browser";
import { PageIntro } from "@/components/site/page-intro";

export const metadata: Metadata = { title: "Амжилт", description: "Нийслэлийн 11-р сургуулийн олимпиад, судалгаа, сургалтын онцлох амжилтууд." };

export default async function AchievementsPage() {
  return <main id="main-content" className="inner-page shell"><PageIntro eyebrow="Амжилтын замнал" title="Он жилээр бүтсэн үр дүн" description="Сурагч, багш, гэр бүлийн хамтын хичээл зүтгэлийг жил бүрийн баримт, амжилтаар нь харна уу." /><div id="hall-of-fame"><HallOfFame /></div><div className="achievement-history-heading"><h2>Он жилээр бүтсэн замнал</h2></div><AchievementBrowser /></main>;
}
