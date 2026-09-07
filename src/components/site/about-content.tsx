"use client";
import { BookOpen, Compass, HeartHandshake, Mail, MapPin, Phone, Scale, Sparkles } from "lucide-react";
import { defaultSiteCopy } from "@/lib/site-copy";
import { TeachersGallery } from "./teachers-gallery";
import { PageIntro } from "@/components/site/page-intro";
import { useSiteData } from "@/components/site/site-data-provider";


export function AboutContent() {
  const { settings, achievements } = useSiteData();
  const copy = { ...defaultSiteCopy, ...settings.site_copy };
  const values = [[BookOpen, "Эрдэм", "Гүн ойлголт, нотолгоо, тасралтгүй суралцах дадал."], [HeartHandshake, "Хүндлэл", "Багш, сурагч, гэр бүлийн итгэлцэл."], [Compass, "Манлайлал", "Хариуцлагатай санаачилга, бодит үр дүн."], [Scale, "Ёс зүй", "Шударга байдал, сургалтын зөв соёл."]] as const;
  return <main id="main-content" className="inner-page shell">
    <PageIntro eyebrow="Бидний тухай" title={copy.about_title} description={copy.about_description} />
    <nav className="about-index" aria-label="Бидний тухай хэсгүүд"><a href="#principal">Захирлын үг</a><a href="#school-history">Сургуулийн түүх</a><a href="#school-journey">Он жилээр бүтсэн замнал</a></nav>
    <section className="principal-section" id="principal"><header><p className="overline">Мэндчилгээ</p><h2>Захирлын үг</h2><span className="principal-mark" aria-hidden="true">“</span></header><div>{copy.principal_message ? <><p className="principal-message">{copy.principal_message}</p>{copy.principal_name && <p className="principal-signature"><strong>{copy.principal_name}</strong><span>Сургуулийн захирал</span></p>}</> : <p className="empty-state">Захирлын мэндчилгээ удахгүй нийтлэгдэнэ.</p>}</div></section>
    <section className="story-grid" id="school-history"><div><p className="overline">Сургуулийн түүх</p><h2>{copy.story_title}</h2></div><div><p>{copy.story_description}</p></div></section>
    <section className="mission-grid"><article><Sparkles /><p>Алсын хараа</p><h2>{copy.vision}</h2></article><article><Compass /><p>Эрхэм зорилго</p><h2>{copy.mission}</h2></article></section>
    <section className="values-section"><header><p className="overline">Бидний баримтлах зарчим</p><h2>Өдөр тутмын дөрвөн үнэт зүйл</h2></header><div className="value-grid">{values.map(([Icon, title, text]) => <article key={title}><Icon /><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <section className="history-section" id="school-journey"><header><p className="overline">Түүхэн замнал</p><h2>Он жилээр бүтсэн замнал</h2></header><ol>{achievements.toSorted((a,b) => a.year-b.year).map(year => <li key={year.id}><time>{year.year}</time><div><h3>{year.highlight_mn}</h3><p>{year.description_mn}</p></div></li>)}</ol></section>
    <TeachersGallery />
    <section className="contact-section" id="contact"><header><p className="overline">Холбоо барих</p><h2>Сургуультай холбогдох</h2></header><div className="contact-grid"><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${settings.address_mn}, ${settings.city}`)}`} target="_blank" rel="noreferrer"><MapPin /><span><small>Хаяг</small><strong>{settings.address_mn}, {settings.city}</strong></span></a><a href={`tel:${settings.phone.replace(/\s/g, "")}`}><Phone /><span><small>Утас</small><strong>{settings.phone}</strong></span></a><a href={`mailto:${settings.email}`}><Mail /><span><small>И-мэйл</small><strong>{settings.email}</strong></span></a></div></section>
  </main>;
}
