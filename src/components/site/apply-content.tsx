"use client";

import { Download, ExternalLink, FileText, Phone } from "lucide-react";
import { PageIntro } from "./page-intro";
import { useSiteData } from "./site-data-provider";

export function ApplyContent() {
  const { settings, preview } = useSiteData();
  const guide = settings.application_guide_url || (preview ? "/application-guide.pdf" : null);

  return <main id="main-content" className="inner-page shell mx-auto w-[var(--shell)]">
    <PageIntro page="apply" title="Элсэлт" description="Элсэлтийн материал, хугацаа, бүртгэлийн дарааллыг гарын авлагаас үзээрэй." />
    {settings.site_copy?.admissions_summary?.trim() && <section className="admissions-summary" aria-labelledby="summary-title">
      <h2 id="summary-title">Бүртгэлийн мэдээлэл</h2><p>{settings.site_copy.admissions_summary}</p>
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
    {settings.phone && <a className="admissions-contact text-action" href={`tel:${settings.phone.replace(/\s/g, "")}`}>
      <Phone aria-hidden="true" /> Сургуулийн утас · {settings.phone}
    </a>}
  </main>;
}
