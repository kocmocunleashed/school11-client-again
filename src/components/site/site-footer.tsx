import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import type { SchoolSettings } from "@/types/database";
import styles from "./site-footer.module.css";

const socialIcons = {
  Facebook: <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.095 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.931-1.956 1.887v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.095 24 18.1 24 12.073Z" />,
  Instagram: <><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="17.5" cy="6.5" r="1" /></>,
  YouTube: <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.546 12 3.546 12 3.546s-7.505 0-9.377.504A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.121 2.136c1.872.504 9.377.504 9.377.504s7.505 0 9.376-.504a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.546 15.568V8.432L15.818 12l-6.272 3.568Z" />,
  X: <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.64 7.584H.47l8.6-9.835L0 1.154h7.594l5.243 6.932 6.064-6.933Zm-1.29 19.49h2.039L6.487 3.24H4.3l13.31 17.403Z" />,
};

export function SiteFooter({ settings }: { settings: SchoolSettings }) {
  const socials = ([[settings.facebook_url, "Facebook"], [settings.instagram_url, "Instagram"], [settings.youtube_url, "YouTube"], [settings.twitter_url, "X"]] as const).filter(([url]) => url);
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.identity}>
            <strong>{settings.school_name_mn}</strong>
            <p>Эрдэм. Хүмүүжил. Ирээдүй.</p>
            {socials.length > 0 && (
              <div className={styles.socials}>
                {socials.map(([url, label]) => (
                  <a href={url!} key={label} target="_blank" rel="noreferrer" aria-label={label} title={label}>
                    <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden="true" focusable="false">{socialIcons[label]}</svg>
                  </a>
                ))}
              </div>
            )}
          </div>
          <nav className={styles.column} aria-label="Сургуулийн хөтөлбөрүүд">
            <h2>Хөтөлбөрүүд</h2>
            <Link href="/courses">Сургалт</Link>
            <Link href="/courses#course-olympiad">Олимпиадын бэлтгэл</Link>
            <Link href="/courses#course-club">Клуб ба дугуйлан</Link>
            <Link href="/achievements">Амжилт</Link>
          </nav>
          <div className={styles.column}>
            <h2>Холбоо барих</h2>
            <a href={`tel:${settings.phone.replace(/\s/g, "")}`}><Phone size={16} aria-hidden="true" /><span>{settings.phone}</span></a>
            <a href={`mailto:${settings.email}`}><Mail size={16} aria-hidden="true" /><span>{settings.email}</span></a>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${settings.address_mn}, ${settings.city}`)}`} target="_blank" rel="noreferrer"><MapPin size={16} aria-hidden="true" /><span>{settings.address_mn}, {settings.city}</span></a>
          </div>
        </div>
        <div className={styles.bottom}>
          <p>© {new Date().getFullYear()} {settings.school_name_mn}.</p>
          <nav aria-label="Нэмэлт холбоосууд">
            <Link href="/about">Бидний тухай</Link>
            <Link href="/apply">Элсэх</Link>
            <Link href="/news">Мэдээ</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
