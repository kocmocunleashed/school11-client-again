import { SitePage } from "@/components/site/site-page";
import type { Metadata } from "next";
import { CourseCatalog } from "@/components/site/course-catalog";
import { PageIntro } from "@/components/site/page-intro";

export const metadata: Metadata = { title: "Сургалт", description: "Нийслэлийн 11-р сургуулийн гүнзгийрүүлсэн сургалт, олимпиад, клуб, дугуйлан." };

export default async function CoursesPage() {
  return <SitePage page="courses"><main id="main-content" className="inner-page shell mx-auto w-[var(--shell)]"><PageIntro page="courses" title="Сургалтын хөтөлбөр" description="Хичээлийн хуваарь, гүнзгийрүүлсэн сургалт, олимпиадын бэлтгэл, клуб, дугуйлан." /><CourseCatalog /></main></SitePage>;
}
