import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import type { SchoolSettings } from "@/types/database";

export function SiteFooter({ settings }: { settings: SchoolSettings }) {
  const socials = [[settings.facebook_url, "Facebook"], [settings.instagram_url, "Instagram"], [settings.youtube_url, "YouTube"], [settings.twitter_url, "X"]].filter(([url]) => url);
  return <footer className="site-footer">
    <div className="footer-grid">
      <div className="footer-identity"><Image src={settings.logo_url || "/school-logo.png"} unoptimized={Boolean(settings.logo_url)} alt="" width={66} height={66} /><strong>{settings.school_name_mn}</strong><p>Эрдэм. Хүмүүжил. Ирээдүй.</p>{socials.length > 0 && <div className="footer-socials">{socials.map(([url,label]) => <a href={url!} key={label} target="_blank" rel="noreferrer">{label}</a>)}</div>}</div>
      <div><h2>Сургуультай танилцах</h2><Link href="/about">Бидний тухай</Link><Link href="/courses">Сургалт</Link><Link href="/achievements">Амжилт</Link><Link href="/news">Мэдээ</Link><Link href="/apply">Элсэлт</Link></div>
      <div><h2>Холбоо барих</h2><a href={`tel:${settings.phone.replace(/\s/g, "")}`}>{settings.phone}</a><a href={`mailto:${settings.email}`}>{settings.email}</a><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${settings.address_mn}, ${settings.city}`)}`} target="_blank" rel="noreferrer"><MapPin size={16} /> {settings.address_mn}, {settings.city}</a></div>
    </div>
    <div className="footer-signature" aria-hidden="true">Ирээдүйг хамтдаа.</div>
    <div className="footer-bottom"><p>© {new Date().getFullYear()} {settings.school_name_mn}</p><span>{settings.city}, Монгол Улс</span></div>
  </footer>;
}
