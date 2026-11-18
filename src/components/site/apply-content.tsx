"use client";
import { Download, FileText } from "lucide-react";
import { PageIntro } from "@/components/site/page-intro";
import { useSiteData } from "@/components/site/site-data-provider";


export function ApplyContent() {
  const { settings, preview } = useSiteData();
  const guide = settings.application_guide_url || (preview ? "/application-guide.pdf" : null);
  return <main id="main-content" className="inner-page shell mx-auto w-[var(--shell)]"><PageIntro page="apply" title="Элсэлт" description="Элсэлтийн материал, хугацаа, бүртгэлийн дарааллыг нэг дороос үзнэ үү." /><section className="apply-layout"><article className="guide-card"><div><FileText aria-hidden="true" /><h2>Элсэлтийн гарын авлага</h2></div>{guide ? <><object data={guide} type="application/pdf" aria-label="Элсэлтийн гарын авлага"><p>PDF харагдахгүй байна. Доорх холбоосоор татаж авна уу.</p></object><a className="secondary-button" href={guide} download><Download /> PDF татаж авах</a></> : <p className="empty-state">Элсэлтийн гарын авлага хараахан нийтлэгдээгүй байна.</p>}</article></section></main>;
}
