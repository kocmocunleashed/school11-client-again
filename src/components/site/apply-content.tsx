"use client";
import { Download, FileText } from "lucide-react";
import { ApplicationChecker } from "@/components/site/application-checker";
import { PageIntro } from "@/components/site/page-intro";
import { useSiteData } from "@/components/site/site-data-provider";


export function ApplyContent() {
  const { settings, preview } = useSiteData();
  const guide = settings.application_guide_url || (preview ? "/application-guide.pdf" : null);
  return <main id="main-content" className="inner-page shell"><PageIntro eyebrow="Элсэлт" title="Дараагийн алхмаа тодорхой хараарай" description="Элсэлтийн материал, хугацаа, баталгаажуулалтын дараалал болон өргөдлийн төлвийг нэг дороос шалгана." /><section className="apply-layout"><ApplicationChecker /><article className="guide-card"><div><FileText /><p>Элсэлтийн баримт бичиг</p><h2>Элсэлтийн гарын авлага</h2><span>Шаардлагатай материал, хугацаа, бүртгэлийн дарааллыг PDF файлаас үзнэ үү.</span></div>{guide ? <><object data={guide} type="application/pdf" aria-label="Элсэлтийн гарын авлага"><p>PDF харагдахгүй байна. Доорх холбоосоор татаж авна уу.</p></object><a className="secondary-button" href={guide} download><Download /> PDF татаж авах</a></> : <p className="empty-state">Элсэлтийн гарын авлага хараахан нийтлэгдээгүй байна.</p>}</article></section></main>;
}
