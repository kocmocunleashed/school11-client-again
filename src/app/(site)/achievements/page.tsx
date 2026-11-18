import { SitePage } from "@/components/site/site-page";
import type { Metadata } from "next";
import { HallOfFame } from "@/components/site/hall-of-fame";
import { AchievementBrowser } from "@/components/site/achievement-browser";
import { PageIntro } from "@/components/site/page-intro";

export const metadata: Metadata = { title: "Амжилт", description: "Нийслэлийн 11-р сургуулийн олимпиад, судалгаа, сургалтын онцлох амжилтууд." };

export default async function AchievementsPage() {
  return <SitePage page="achievements"><main id="main-content" className="inner-page shell mx-auto w-[var(--shell)]"><PageIntro page="achievements" title="Сургуулийн амжилт" description="Олимпиадын медальтнууд болон сургуулийн амжилтыг он жилээр үзээрэй." /><AchievementBrowser /><div id="hall-of-fame"><HallOfFame /></div></main></SitePage>;
}
