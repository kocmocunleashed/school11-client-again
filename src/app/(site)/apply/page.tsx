import { SitePage } from "@/components/site/site-page";
import { ApplyContent } from "@/components/site/apply-content";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Элсэлт", description: "Элсэлтийн гарын авлага, бүртгэлийн мэдээлэл." };
export default function Page() { return <SitePage page="apply"><ApplyContent /></SitePage>; }
