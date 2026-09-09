"use client";
import Image from "next/image";
import { useSiteData } from "./site-data-provider";
export function TeachersGallery({ featured = false }: { featured?: boolean }) {
  const { teachers } = useSiteData();
  const management = teachers.filter(item => /захирал|менежер|нийгмийн ажилтан|эрхлэгч/i.test(item.subject_mn));
  const visible = featured ? management.filter(item => item.is_featured).slice(0, 8) : management;
  return <section className="cms-teachers section" aria-label="Удирдлагын баг"><div className={featured ? "shell mx-auto w-[var(--shell)]" : undefined}>
    <div className="section-heading"><h2>Удирдлагын баг</h2></div>
    <div className="management-intro"><h3>Сургуулийн хөгжлийг чиглүүлэгчид</h3><p>Сургалтын чанар, сурагчдын хөгжил, сургуулийн өдөр тутмын үйл ажиллагааг хариуцан ажилладаг манай удирдлагын багтай танилцаарай.</p></div>
    <div className="cms-teacher-grid">{visible.map(person => <article key={person.id}><div className="cms-teacher-photo">{person.photo_url ? <Image src={person.photo_url} alt={person.name_mn} fill sizes="(max-width: 700px) 50vw, 25vw" style={{ objectFit: "cover", objectPosition: "center 25%" }} unoptimized /> : <span>{person.subject_mn}</span>}</div><h3>{person.name_mn}</h3><p>{person.subject_mn}</p>{person.bio_mn && <p>{person.bio_mn}</p>}</article>)}</div>
    {!visible.length && <p>Удирдлагын багийн танилцуулга удахгүй нэмэгдэнэ.</p>}
  </div></section>;
}
