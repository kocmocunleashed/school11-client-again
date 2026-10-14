import { SitePage } from "@/components/site/site-page";
import { AboutContent } from "@/components/site/about-content";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Бидний тухай", description: "Нийслэлийн 11-р сургуулийн түүх, зорилго, үнэт зүйл, холбоо барих мэдээлэл." };
export default function Page() { return <SitePage page="about"><AboutContent /></SitePage>; }
