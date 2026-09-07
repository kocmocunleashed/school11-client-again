"use client";
import Image from "next/image";
import { useSiteData } from "./site-data-provider";
export function TeachersGallery({ featured = false }: { featured?: boolean }) {
  const { teachers } = useSiteData();
  const visible = featured ? teachers.filter(item => item.is_featured).slice(0, 8) : teachers;
  if (!visible.length) return null;
  return <section className="cms-teachers section" aria-label="Багш нар"><div className={featured ? "shell" : undefined}><div className="section-heading"><h2>Мэдлэгийг хуваалцдаг<br />манай багш нар.</h2></div><div className="cms-teacher-grid">{visible.map(teacher => <article key={teacher.id}><div className="cms-teacher-photo">{teacher.photo_url ? <Image src={teacher.photo_url} alt={teacher.name_mn} fill sizes="(max-width: 700px) 50vw, 25vw" unoptimized /> : <span>{teacher.name_mn}</span>}</div><h3>{teacher.name_mn}</h3><p>{teacher.subject_mn} · {teacher.years_exp} жилийн туршлага</p>{teacher.bio_mn && <p>{teacher.bio_mn}</p>}</article>)}</div></div></section>;
}
