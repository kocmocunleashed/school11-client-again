"use client";
import { useSiteData } from "./site-data-provider";
import { SchoolCalendar } from "./school-calendar";

import { BookOpen, Clock3, MapPin, Trophy, Users } from "lucide-react";
import { useState } from "react";

function SectionIcon({ icon }: { icon: string | null }) {
  if (icon === "trophy") return <Trophy aria-hidden="true" />;
  if (icon === "users") return <Users aria-hidden="true" />;
  return <BookOpen aria-hidden="true" />;
}

export function CourseCatalog() {
  const { courses: sections } = useSiteData();
  const calendarSection = sections.find(section => section.slug === "calendar" || /календар|хуанли/i.test(section.title_mn));
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  return (
    <div className="course-catalog [border-top:1px_solid_var(--line)] pt-school-3">
      <div className="course-sections">
        <section id={`course-${calendarSection?.slug || "calendar"}`}><header><p>Сургалтын хуваарь</p><h2>Календар</h2><span>Сорил, тэмцээн, хичээлийн үйл ажиллагаа</span></header><SchoolCalendar /></section>
      </div>
      <nav className="course-index" aria-label="Сургалтын ангилал">
        {sections.map(section => <a href={`#course-${section.slug}`} key={section.id}><SectionIcon icon={section.icon} /><span><strong>{section.title_mn}</strong><small>{section.description_mn}</small></span></a>)}
      </nav>
      <div className="course-sections">
        {sections.map(section => {
          if (section.slug === "calendar" || /календар|хуанли/i.test(section.title_mn)) return null;
          const open = expanded[section.id];
          const items = open ? section.items || [] : (section.items || []).slice(0, 3);
          return <section id={`course-${section.slug}`} key={section.id}>
            <header><p>Сургалтын чиглэл</p><h2>{section.title_mn}</h2><span>{section.description_mn}</span></header>
            <div className="course-list">{items.map((item, index) => <details key={item.id} open={index === 0}><summary><span><small>{String(index + 1).padStart(2, "0")}</small><strong>{item.title_mn}</strong><em>{item.short_desc_mn}</em></span><b aria-hidden="true">+</b></summary><div><p>{item.full_desc_mn || item.short_desc_mn}</p><ul>{item.teacher_name ? <li><Users /> Багш: {item.teacher_name}</li> : null}{item.schedule_mn ? <li><Clock3 /> {item.schedule_mn}</li> : null}{item.location_mn ? <li><MapPin /> {item.location_mn}</li> : null}</ul></div></details>)}</div>
            {(section.items?.length || 0) > 3 ? <button className="secondary-button" type="button" onClick={() => setExpanded(value => ({ ...value, [section.id]: !value[section.id] }))}>{open ? "Хураах" : "Бүгдийг харуулах"}</button> : null}
          </section>;
        })}
      </div>
    </div>
  );
}
