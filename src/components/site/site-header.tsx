"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BookOpen, House, Newspaper, School, Trophy } from "lucide-react";
import { usePathname } from "next/navigation";
import { unoptimizedPublicImage } from "@/lib/image-policy";

const navItems = [
  ["/", "Нүүр", House], ["/about", "Сургууль", School], ["/courses", "Сургалт", BookOpen],
  ["/achievements", "Амжилт", Trophy], ["/news", "Мэдээ", Newspaper],
] as const;

export function SiteHeader({ schoolName, logo }: { schoolName: string; logo?: string | null }) {
  const pathname = usePathname();
  const compactName = schoolName.replace(/^Нийслэлийн (?:ерөнхий боловсролын )?(?=\d)/iu, "");
  return <header className="site-header">
    <div className="header-inner">
      <Link className="site-brand" href="/" aria-label={schoolName + " · Нүүр"} aria-current={pathname === "/" ? "page" : undefined}>
        <Image src={logo || "/school-logo.png"} unoptimized={unoptimizedPublicImage(logo || "/school-logo.png")} alt="" width={52} height={52} loading="eager" />
        <span>
          <strong className="school-name-full">{schoolName}</strong>
          <strong className="school-name-compact">{compactName}</strong>
        </span>
      </Link>
      <nav className="desktop-nav" aria-label="Үндсэн цэс">
        {navItems.map(([href, label, Icon]) => <Link aria-current={pathname === href ? "page" : undefined} key={href} href={href}><Icon size={20} aria-hidden="true" />{label}</Link>)}
      </nav>
      <Link className="header-apply" aria-current={pathname === "/apply" ? "page" : undefined} href="/apply">Элсэлт {pathname !== "/apply" && <ArrowUpRight size={17} aria-hidden="true" />}</Link>
    </div>
  </header>;
}
