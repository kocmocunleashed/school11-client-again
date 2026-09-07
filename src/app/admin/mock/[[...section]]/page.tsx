import { notFound } from "next/navigation";
import { AdminApp } from "@/components/admin/admin-app";

const sections = new Set(["hall-of-fame", "news", "teachers", "achievements", "courses", "applications", "settings"]);

export default async function MockAdminPage({ params }: { params: Promise<{ section?: string[] }> }) {
  const { section = [] } = await params;
  if (section.length > 1 || (section[0] && !sections.has(section[0]))) notFound();

  return <AdminApp mode="mock" />;
}
