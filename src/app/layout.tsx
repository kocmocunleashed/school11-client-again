import type { Metadata, Viewport } from "next";
import { Roboto_Condensed } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const robotoCondensed = Roboto_Condensed({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  style: ["normal", "italic"],
  display: "swap",
});

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

export const viewport: Viewport = { themeColor: "#2149C6", colorScheme: "light" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="mn" className={`${robotoCondensed.variable} ${robotoCondensed.className}`} data-scroll-behavior="smooth">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
