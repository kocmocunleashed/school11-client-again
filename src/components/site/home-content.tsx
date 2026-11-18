"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Atom, BookOpen, CalendarDays, GraduationCap, MapPin, Music2, Phone, Trophy } from "lucide-react";
import { unoptimizedPublicImage } from "@/lib/image-policy";
import { defaultSiteCopy } from "@/lib/site-copy";
import { HallOfFame } from "./hall-of-fame";
import { LandingTimeline } from "./landing-timeline";
import { NewsBrowser } from "./news-browser";
import { Podcasts } from "./podcasts";
import { useSiteData } from "./site-data-provider";

export function HomeContent() {
  const { settings, courses, courseCounts } = useSiteData();
  const copy = { ...defaultSiteCopy, ...settings.site_copy };
  const campus = settings.hero_image_url || "/school-bg.jpg";
  const shortcuts = [
    { href: "/courses#school-calendar", label: "Хуанли", Icon: CalendarDays },
    { href: "/courses#programs", label: "Хөтөлбөрүүд", Icon: BookOpen },
    { href: "/apply", label: "Элсэлт", Icon: GraduationCap },
    { href: "/about#contact", label: "Холбоо барих", Icon: Phone },
  ];
  const facts = [
    [settings.established, "Үүсгэн байгуулагдсан он"],
    [settings.student_count.toLocaleString("mn-MN"), "Сурагч"],
    [settings.teacher_count, "Багш"],
    [settings.club_count, "Клуб, дугуйлан"],
  ];

  return <main id="main-content">
    <section className="notebook-hero">
      <div className="hero-spread shell">
        <div className="hero-story">
          <h1>{copy.hero_line_1} <span>{copy.hero_line_2} {copy.hero_line_3}</span></h1>
          <p className="hero-description">{copy.hero_description}</p>
          <div className="hero-actions">
            <Link className="primary-button" href="/about">Сургуулийн тухай <ArrowRight size={18} /></Link>
            <Link className="secondary-button" href="/courses">Сургалт</Link>
          </div>
        </div>
        <div className="campus-board">
          <figure className="campus-print">
            <div className="campus-photo"><Image src={campus} alt="Нийслэлийн 11-р сургуулийн хичээлийн байр" fill sizes="(max-width: 740px) 85vw, (max-width: 1280px) 40vw, 490px" loading="eager" fetchPriority="high" unoptimized={unoptimizedPublicImage(campus)} /></div>
            <figcaption><MapPin size={16} aria-hidden="true" />{settings.city}</figcaption>
          </figure>
          <span className="math-seal" aria-hidden="true">π</span>
        </div>
      </div>
    </section>
    <nav className="shortcuts shell" aria-label="Шуурхай холбоос">
      {shortcuts.map(({ href, label, Icon }) => <Link href={href} key={href}><Icon size={20} aria-hidden="true" /><strong>{label}</strong></Link>)}
    </nav>
    <section className="home-section shell" id="news">
      <div className="section-heading"><h2>Сургуулийн мэдээ</h2><Link href="/news" className="text-action">Бүх мэдээ <ArrowRight /></Link></div>
      <NewsBrowser home />
    </section>
    <section className="school-profile"><div className="shell profile-layout">
      <div><h2>{copy.intro_title}</h2><p>{copy.intro_description}</p><Link href="/about" className="text-action">Бидний тухай <ArrowRight /></Link></div>
      <dl className="school-facts">{facts.map(([value, label]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    </div></section>
    <section className="home-section shell">
      <div className="section-heading"><h2>Сургалтын чиглэлүүд</h2><Link className="text-action" href="/courses">Бүх хөтөлбөр <ArrowRight /></Link></div>
      <div className="subject-grid">{courses.map(section => {
        const Icon = section.icon === "trophy" ? Trophy : section.icon === "users" ? Music2 : section.slug === "calendar" ? CalendarDays : Atom;
        return <Link href={`/courses#course-${section.slug}`} className="subject-card" key={section.id}>
          <Icon className="subject-symbol" aria-hidden="true" />
          <h3>{section.title_mn}</h3><p>{section.description_mn}</p><small>{courseCounts?.[section.id] || 0} хөтөлбөр</small><ArrowRight className="subject-arrow" size={19} aria-hidden="true" />
        </Link>;
      })}</div>
      {!courses.length && <p className="empty-state">Сургалтын мэдээлэл хараахан нийтлэгдээгүй байна.</p>}
    </section>
    <HallOfFame home />
    <LandingTimeline />
    <Podcasts />
    <section className="enrol-strip shell"><Link href="/apply"><GraduationCap aria-hidden="true" /><h2>{copy.join_title}</h2><ArrowRight aria-hidden="true" /></Link></section>
  </main>;
}
