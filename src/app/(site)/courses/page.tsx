import type { Metadata } from "next";
import { CourseCatalog } from "@/components/site/course-catalog";
import { PageIntro } from "@/components/site/page-intro";

export const metadata: Metadata = { title: "Сургалт", description: "Нийслэлийн 11-р сургуулийн гүнзгийрүүлсэн сургалт, олимпиад, клуб, дугуйлан." };

export default async function CoursesPage() {
  return <main id="main-content" className="inner-page shell"><PageIntro eyebrow="Сургалтын орчин" title="Мэдлэгийг туршлага болгох хөтөлбөрүүд" description="Гүнзгийрүүлсэн хичээл, лаборатори, олимпиад, сонирхлын клубүүд нэг сургалтын системд ажиллана." /><CourseCatalog /></main>;
}
