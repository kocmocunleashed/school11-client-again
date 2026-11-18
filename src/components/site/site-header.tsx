"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { unoptimizedPublicImage } from "@/lib/image-policy";

const navItems = [
  ["/", "Нүүр"], ["/about", "Бидний тухай"], ["/courses", "Сургалт"],
  ["/achievements", "Амжилт"], ["/news", "Мэдээ"],
] as const;

export function SiteHeader({ schoolName, logo }: { schoolName: string; logo?: string | null }) {
  const pathname = usePathname();
  const drawer = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const wide = window.matchMedia("(min-width: 981px)");
    const closeOnResize = () => { if (wide.matches) drawer.current?.close(); };
    wide.addEventListener("change", closeOnResize);
    return () => wide.removeEventListener("change", closeOnResize);
  }, [open]);

  return <header className="site-header">
    <div className="header-inner">
      <Link className="site-brand" href="/">
        <Image src={logo || "/school-logo.png"} unoptimized={unoptimizedPublicImage(logo || "/school-logo.png")} alt="" width={52} height={52} loading="eager" />
        <span><strong>{schoolName}</strong></span>
      </Link>
      <nav className="desktop-nav" aria-label="Үндсэн цэс">
        {navItems.map(([href, label]) => <Link aria-current={pathname === href ? "page" : undefined} key={href} href={href}>{label}</Link>)}
      </nav>
      <Link className="header-apply" aria-current={pathname === "/apply" ? "page" : undefined} href="/apply">Элсэлт <ArrowUpRight size={17} aria-hidden="true" /></Link>
      <button className="menu-button" type="button" onClick={() => { drawer.current?.showModal(); setOpen(true); }} aria-expanded={open} aria-controls="mobile-menu" aria-label="Цэс нээх"><Menu /></button>
    </div>
    <dialog ref={drawer} id="mobile-menu" className="school-drawer" aria-label="Үндсэн цэс" onClose={() => setOpen(false)} onClick={event => { if (event.target === drawer.current) drawer.current.close(); }}>
      <div><header><strong>{schoolName}</strong><button type="button" onClick={() => drawer.current?.close()} aria-label="Цэс хаах"><X /></button></header>
        <nav>{[...navItems, ["/apply", "Элсэлт"] as const].map(([href, label]) => <Link aria-current={pathname === href ? "page" : undefined} key={href} href={href} onClick={() => drawer.current?.close()}>{label}<ArrowUpRight size={19} /></Link>)}</nav>
      </div>
    </dialog>
  </header>;
}
