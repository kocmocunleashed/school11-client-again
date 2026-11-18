"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { usePathname } from "next/navigation";
import { unoptimizedPublicImage } from "@/lib/image-policy";

const navItems = [
  ["/", "Нүүр"], ["/about", "Бидний тухай"], ["/courses", "Сургалт"],
  ["/achievements", "Амжилт"], ["/news", "Мэдээ"],
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
        {navItems.map(([href, label]) => <Link aria-current={pathname === href ? "page" : undefined} key={href} href={href}>{href === "/about" ? <><span className="nav-long">{label}</span><span className="nav-short">Сургууль</span></> : label}</Link>)}
      </nav>
      <Link className="header-apply" aria-current={pathname === "/apply" ? "page" : undefined} href="/apply">Элсэлт {pathname === "/apply" ? <Check size={17} aria-hidden="true" /> : <ArrowUpRight size={17} aria-hidden="true" />}</Link>
    </div>
  </header>;
}
