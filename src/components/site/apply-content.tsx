"use client";

import { useState } from "react";
import { BookOpen, ChevronDown, Download, ExternalLink, FileText, Mail, Phone } from "lucide-react";
import { NewsArticleBody } from "./news-article-body";
import { PageIntro } from "./page-intro";
import { useSiteData } from "./site-data-provider";

export function ApplyContent() {
  const { settings, news, preview } = useSiteData();
  const [openNotice, setOpenNotice] = useState<string | null>(null);
  const guide = settings.application_guide_url || (preview ? "/application-guide.pdf" : null);

  return <main id="main-content" className="inner-page shell mx-auto w-[var(--shell)]">
    <PageIntro page="apply" title="Элсэлт" />
    {settings.site_copy?.admissions_summary?.trim() && <section className="admissions-summary" aria-labelledby="summary-title">
      <h2 id="summary-title">Бүртгэлийн мэдээлэл</h2><p>{settings.site_copy.admissions_summary}</p>
    </section>}
    <div className="admissions-layout">
      <div>
        {news.length > 0 && <section className="admissions-notices" aria-labelledby="notices-title">
          <h2 id="notices-title">Элсэлтийн мэдээ</h2>
          {news.map(item => <article key={item.id}>
            <time dateTime={item.published_at}>{item.published_at.slice(0, 10).replaceAll("-", ".")}</time>
            <h3>{item.title_mn}</h3><p>{item.excerpt_mn}</p>
            <button className="text-action" type="button" aria-expanded={openNotice === item.id}
              onClick={() => setOpenNotice(openNotice === item.id ? null : item.id)}>
              {openNotice === item.id ? "Хураах" : "Мэдээг унших"} <ChevronDown aria-hidden="true" />
            </button>
            {openNotice === item.id && <NewsArticleBody summary={item} preview={preview} />}
          </article>)}
        </section>}
        <section className="guide-card" aria-labelledby="guide-title">
          <div className="guide-file">
            <FileText aria-hidden="true" />
            <div><h2 id="guide-title">Элсэлтийн гарын авлага</h2>{guide && <p>PDF баримт бичиг</p>}</div>
          </div>
          {guide ? <div className="guide-actions">
            <a className="primary-button" href={guide} download><Download aria-hidden="true" /> PDF татаж авах</a>
            <a className="text-action" href={guide} target="_blank" rel="noreferrer">Шинэ цонхонд нээх <ExternalLink aria-hidden="true" /></a>
          </div> : <p className="empty-state">Элсэлтийн гарын авлага хараахан нийтлэгдээгүй байна.</p>}
        </section>
      </div>
      <aside className="admissions-desk">
        <BookOpen aria-hidden="true" /><h2>Сургуулиас лавлах</h2>
        {settings.phone && <a className="admissions-contact text-action" href={`tel:${settings.phone.replace(/\s/g, "")}`}><Phone aria-hidden="true" />{settings.phone}</a>}
        {settings.email && <a className="text-action" href={`mailto:${settings.email}`}><Mail aria-hidden="true" />{settings.email}</a>}
      </aside>
    </div>
  </main>;
}
