"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { schoolBrandName } from "./school-brand";

const navItems = [
  ["/", "Нүүр"],
  ["/about", "Бидний тухай"],
  ["/courses", "Сургалт"],
  ["/achievements", "Амжилт"],
  ["/news", "Мэдээ"],
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const closeButton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback(() => {
    menuButton.current?.focus();
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    closeButton.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
      if (event.key !== "Tab") return;
      const controls = panel.current?.querySelectorAll<HTMLElement>("button, a");
      if (!controls?.length) return;
      const first = controls[0]; const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = previousOverflow; };
  }, [closeMenu, open]);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="site-brand" href="/" aria-label="Нүүр хуудас">
          <Image
            src="/school-anniversary-logo.jpg"
            alt=""
            width={1056}
            height={824}
            sizes="(max-width: 700px) 80px, (max-width: 1100px) 96px, 124px"
            loading="eager"
          />
          <strong>{schoolBrandName}</strong>
        </Link>
        <nav className="desktop-nav" aria-label="Үндсэн цэс">
          {navItems.map(([href, label]) => <Link aria-current={pathname === href ? "page" : undefined} key={href} href={href}>{label}</Link>)}
        </nav>
        <Link className="header-apply" aria-current={pathname === "/apply" ? "page" : undefined} href="/apply">Элсэлт <span aria-hidden="true">↗</span></Link>
        <button ref={menuButton} className="menu-button" type="button" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="mobile-menu" aria-label="Цэс нээх"><Menu /></button>
      </div>
      <div ref={panel} role={open ? "dialog" : undefined} aria-modal={open || undefined} aria-label="Үндсэн цэс" inert={!open} className={`mobile-nav ${open ? "is-open" : ""}`} id="mobile-menu" aria-hidden={!open}>
        <button ref={closeButton} type="button" tabIndex={open ? 0 : -1} onClick={closeMenu} aria-label="Цэс хаах"><X /></button>
        <nav aria-label="Гар утасны үндсэн цэс">
          {[...navItems, ["/apply", "Элсэлт"] as const].map(([href, label]) => <Link aria-current={pathname === href ? "page" : undefined} key={href} href={href} tabIndex={open ? 0 : -1} onClick={closeMenu}>{label}</Link>)}
        </nav>
      </div>
    </header>
  );
}
