"use client";

import Image from "next/image";
import Link from "next/link";
import { BookOpen, GraduationCap, House, Menu, Newspaper, School, Trophy } from "lucide-react";
import { useRef } from "react";
import { usePathname } from "next/navigation";
import { unoptimizedPublicImage } from "@/lib/image-policy";

const navItems = [
  ["/", "Нүүр", House], ["/about", "Сургууль", School], ["/courses", "Сургалт", BookOpen],
  ["/achievements", "Амжилт", Trophy], ["/news", "Мэдээ", Newspaper], ["/apply", "Элсэлт", GraduationCap],
] as const;

export function SiteHeader({ schoolName, logo }: { schoolName: string; logo?: string | null }) {
  const pathname = usePathname();
  const menu = useRef<HTMLDetailsElement>(null);
  const compactName = schoolName.replace(/^Нийслэлийн (?:ерөнхий боловсролын )?(?=\d)/iu, "");
  const renderLink = ([href, label, Icon]: typeof navItems[number]) => (
    <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}
      onClick={() => { if (menu.current) menu.current.open = false; }}>
      <Icon size={18} aria-hidden="true" />{label}
    </Link>
  );
  return <header className="site-header">
    <div className="header-inner">
      <Link className="site-brand" href="/" aria-label={schoolName + " · Нүүр"} aria-current={pathname === "/" ? "page" : undefined}>
        <Image src={logo || "/school-logo.png"} unoptimized={unoptimizedPublicImage(logo || "/school-logo.png")} alt="" width={52} height={52} loading="eager" />
        <strong className="brand-full">{schoolName}</strong><strong className="brand-short">{compactName}</strong>
      </Link>
      <nav className="desktop-nav" aria-label="Үндсэн цэс">{navItems.map(renderLink)}</nav>
      <details key={pathname} ref={menu} className="mobile-directory"
        onKeyDown={event => {
          if (event.key === "Escape" && menu.current?.open) {
            menu.current.open = false;
            menu.current.querySelector("summary")?.focus();
          }
        }}
        onBlur={event => {
          if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false;
        }}>
        <summary><Menu size={18} aria-hidden="true" />Цэс</summary>
        <nav aria-label="Үндсэн цэс">{navItems.map(renderLink)}</nav>
      </details>
      <nav className="mobile-primary" aria-label="Шуурхай цэс">
        {navItems.filter(([href]) => ["/courses", "/news", "/apply"].includes(href)).map(renderLink)}
      </nav>
    </div>
  </header>;
}
