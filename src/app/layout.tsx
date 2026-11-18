import type { Metadata, Viewport } from "next";
import "@fontsource-variable/roboto-condensed";
import "@fontsource-variable/roboto-condensed/wght-italic.css";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "http://localhost:3000"),
  title: { default: "Нийслэлийн 11-р сургууль", template: "%s | Нийслэлийн 11-р сургууль" },
  description: "Нийслэлийн 11-р сургуулийн мэдээ, сургалт, багш нар, амжилт болон элсэлтийн мэдээлэл.",
  icons: { icon: "/school-logo.png", apple: "/school-logo.png" },
  openGraph: {
    type: "website",
    locale: "mn_MN",
    siteName: "Нийслэлийн 11-р сургууль",
    images: [{ url: "/school-bg.jpg", width: 1600, height: 1067, alt: "Нийслэлийн 11-р сургуулийн байр" }],
  },
};

export const viewport: Viewport = { themeColor: "#203ea1", colorScheme: "light" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="mn" data-scroll-behavior="smooth">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
