import type { Metadata } from "next";
import "@/styles/admin.css";

export const metadata: Metadata = { title: "Удирдлагын систем", robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
