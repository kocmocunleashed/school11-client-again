import { notFound } from "next/navigation";
import { AdminApp } from "@/components/admin/admin-app";

const sections = new Set(["hall-of-fame", "news", "teachers", "achievements", "courses", "applications", "settings"]);

export default async function AdminSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!sections.has(section)) notFound();
  return <AdminApp />;
}
