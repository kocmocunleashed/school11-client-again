import type { Metadata, Viewport } from "next";
import { Golos_Text, PT_Serif } from "next/font/google";
import "./globals.css";
import "./redesign.css";
import "./yearbook.css";

const inter = Golos_Text({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const ptSerif = PT_Serif({
  variable: "--font-display",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
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

export const viewport: Viewport = { themeColor: "#0757A6", colorScheme: "light" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="mn" className={`${inter.variable} ${ptSerif.variable}`} data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
