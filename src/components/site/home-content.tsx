"use client";
import Image from "next/image";
import { unoptimizedPublicImage } from "@/lib/image-policy";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ArrowDown } from "lucide-react";
import type { ReactNode } from "react";
import anniversaryFacts from "@/lib/data/anniversary-facts.json";
import { defaultSiteCopy } from "@/lib/site-copy";
import { SchoolSculpture } from "@/components/site/school-sculpture";
import { NewsBrowser } from "@/components/site/news-browser";
import { useSiteData } from "@/components/site/site-data-provider";
import { LandingTimeline } from "@/components/site/landing-timeline";
import { Podcasts } from "@/components/site/podcasts";

export function HomeContent({ children }: { children: ReactNode }) {
  const { settings } = useSiteData();
  const copy = { ...defaultSiteCopy, ...settings.site_copy };
  return <main id="main-content">
    <section className="arrival">
      <div className="arrival-grid shell mx-auto w-[var(--shell)]">
        <div className="arrival-copy">
          <a href="#oin-ajil" className="arrival-anniversary">80 жилийн ой <ArrowDown size={16} aria-hidden="true" /></a>
          <h1>{copy.hero_line_1}<br /><span>{copy.hero_line_2}</span><br />{copy.hero_line_3}</h1>
          <div className="arrival-actions"><Link href="/about" className="primary-button">Манай ертөнцөөр аялаарай <ArrowUpRight /></Link><Link href="/apply" className="text-action">Элсэлт <ArrowRight /></Link></div>
        </div>
        <div className="arrival-collage"><SchoolSculpture /><Link href="/about" className="campus-postcard" aria-label="Сургуулийн тухай"><div className="postcard-photo"><Image src={settings.hero_image_url || "/school-bg.jpg"} alt="Улаанбаатар хотын 11-р сургуулийн хичээлийн байр" fill sizes="(max-width: 700px) 80vw, 32vw" loading="eager" fetchPriority="high" unoptimized={unoptimizedPublicImage(settings.hero_image_url || "/school-bg.jpg")} /></div></Link></div>
      </div>
      <div className="arrival-bottom shell mx-auto w-[var(--shell)]">
        <a href="#discover" className="ml-auto">Цааш нээх <ArrowDown aria-hidden="true" /></a>
      </div>
    </section>
    <section className="school-introduction shell mx-auto w-[var(--shell)]" id="discover">
      <div className="intro-symbol" aria-hidden="true">( x + y )<sup>∞</sup></div>
      <div>
        <h2>{copy.intro_title}</h2>
        <p>{copy.intro_description}</p>
        <Link href="/about" className="text-action">Бидний тухай <ArrowUpRight /></Link>
      </div>
      <div className="school-numbers">
        <p><strong>{settings.student_count.toLocaleString("mn-MN")}</strong><span>6–12-р ангийн сурагч</span></p>
        <p><strong>{settings.teacher_count}</strong><span>Багш</span></p>
        {anniversaryFacts.medals.map(({ label, total, gold, silver, bronze }) => (
          <p key={label}>
            <strong>{total}</strong>
            <span>{label}<br />{gold} алт · {silver} мөнгө · {bronze} хүрэл</span>
          </p>
        ))}
      </div>
    </section>
    <LandingTimeline />
    <Podcasts />
    {children}
    <section className="section shell mx-auto w-[var(--shell)] home-news" id="news"><div className="section-heading"><div><h2>Манай сургуулийн хэмнэл.</h2></div><Link href="/news" className="text-action">Бүх мэдээ <ArrowUpRight /></Link></div><NewsBrowser home /></section>
    <section className="join-section shell mx-auto w-[var(--shell)]"><Link className="join-link" href="/apply"><h2>{copy.join_title}</h2><ArrowUpRight aria-hidden="true" /></Link></section>
  </main>;
}
