"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ArrowDown, BookOpen, Atom, Trophy } from "lucide-react";
import { defaultSiteCopy } from "@/lib/site-copy";
import { HallOfFame } from "@/components/site/hall-of-fame";
import { SchoolSculpture } from "@/components/site/school-sculpture";
import { NewsBrowser } from "@/components/site/news-browser";
import { useSiteData } from "@/components/site/site-data-provider";

export function HomeContent() {
  const { news, settings, courses } = useSiteData();
  const copy = { ...defaultSiteCopy, ...settings.site_copy };
  return <main id="main-content">
    <section className="arrival">
      <div className="arrival-grid shell">
        <div className="arrival-copy"><div className="school-tag">{settings.city}, МОНГОЛ · {settings.school_name_mn}</div><h1>{copy.hero_line_1}<br /><span>{copy.hero_line_2}</span><br />{copy.hero_line_3}</h1><p className="arrival-lead">{copy.hero_description}</p><div className="arrival-actions"><Link href="/about" className="primary-button">Манай ертөнцөөр аялаарай <ArrowUpRight /></Link><Link href="/apply" className="text-action">Элсэлт <ArrowRight /></Link></div></div>
        <div className="arrival-collage"><SchoolSculpture /><Link href="/about" className="campus-postcard"><div className="postcard-photo"><Image src={settings.hero_image_url || "/school-bg.jpg"} alt="Улаанбаатар хотын 11-р сургуулийн хичээлийн байр" fill sizes="(max-width: 700px) 80vw, 32vw" loading="eager" fetchPriority="high" unoptimized={Boolean(settings.hero_image_url)} /></div><div className="postcard-caption"><span>Бидний өдөр бүрийн эхлэл.</span><ArrowUpRight /></div></Link></div>
      </div>
      <div className="arrival-bottom shell"><span>МЭДЛЭГ + СОНИУЧ ЗАН + ЧИ</span><a href="#discover">Цааш нээх <ArrowDown /></a></div>
    </section>
    <div className="school-ribbon" aria-label="Сургуулийн үнэт зүйл"><span>АСУУ.</span><svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 0v40M0 20h40M6 6l28 28M6 34L34 6" /></svg><span>ТУРШ.</span><svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 0v40M0 20h40M6 6l28 28M6 34L34 6" /></svg><span>БҮТЭЭ.</span><svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 0v40M0 20h40M6 6l28 28M6 34L34 6" /></svg><span>ӨӨРӨӨ БАЙ.</span></div>
    <section className="school-introduction shell" id="discover"><div className="intro-symbol" aria-hidden="true">( x + y )<sup>∞</sup></div><div><h2>{copy.intro_title}</h2><p>{copy.intro_description}</p><Link href="/about" className="text-action">Бидний тухай <ArrowUpRight /></Link></div><div className="school-numbers"><p><strong>{settings.established}</strong><span>оноос эрдмийн замд</span></p><p><strong>{settings.student_count.toLocaleString("mn-MN")}<i>+</i></strong><span>сурагчийн хүсэл мөрөөдөл</span></p><p><strong>{settings.teacher_count}<i>+</i></strong><span>багшийн мэдлэг, туршлага</span></p><p><strong>{settings.club_count}<i>+</i></strong><span>клуб, дугуйлан</span></p></div></section>
    <section className="learning-section"><div className="shell"><div className="section-heading"><div><h2>Юунд дуртай вэ?</h2></div><Link className="text-action" href="/courses">Бүх хөтөлбөр <ArrowUpRight /></Link></div><div className="learning-grid">{courses.map((section, index) => {
      const styles = ["mathematics", "science", "clubs"];
      const Icon = index % 3 === 1 ? Atom : index % 3 === 2 ? Trophy : BookOpen;
      return <Link href={`/courses#course-${section.slug}`} className={`learning-card ${styles[index % 3]}`} key={section.id}>{index % 3 === 0 ? <div className="subject-art" aria-hidden="true"><span>ƒ</span><i>（x）</i></div> : index % 3 === 1 ? <div className="subject-art orbital" aria-hidden="true"><i /><i /><i /><b /></div> : <div className="subject-art club-art" aria-hidden="true">✳</div>}<div className="learning-label"><Icon /><span>{section.items?.length || 0} ХӨТӨЛБӨР</span></div><h3>{section.title_mn}</h3><p>{section.description_mn}</p><span className="learning-arrow"><ArrowUpRight /></span></Link>;
    })}</div>{!courses.length && <p className="empty-state">Сургалтын мэдээлэл хараахан нийтлэгдээгүй байна.</p>}</div></section>
    <HallOfFame home />
    <section className="section shell home-news" id="news"><div className="section-heading"><div><h2>Манай сургуулийн хэмнэл.</h2></div><Link href="/news" className="text-action">Бүх мэдээ <ArrowUpRight /></Link></div><NewsBrowser items={news} home /></section>
    <section className="join-section shell"><div><h2>{copy.join_title}</h2><Link className="primary-button" href="/apply">Элсэлттэй танилцах <ArrowRight /></Link></div><span className="join-mark" aria-hidden="true"><ArrowUpRight /></span></section>
  </main>;
}
