"use client";
import { useSiteData } from "./site-data-provider";
import { SchoolCalendar } from "./school-calendar";

import { BookOpen, ChevronDown, Clock3, MapPin, Trophy, Users } from "lucide-react";
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
    <div className="course-catalog">
      <nav id="programs" className="course-index" aria-label="Сургалтын ангилал">
        {sections.map(section => <a href={`#course-${section.slug}`} key={section.id}><SectionIcon icon={section.icon} /><span><strong>{section.title_mn}</strong></span></a>)}
      </nav>
      <div className="course-sections">
        <section id={`course-${calendarSection?.slug || "calendar"}`}><header><h2>Хичээлийн хуанли</h2></header><div id="school-calendar"><SchoolCalendar /></div></section>
      </div>
      <div className="course-sections">
        {sections.map(section => {
          if (section.slug === "calendar" || /календар|хуанли/i.test(section.title_mn)) return null;
          const open = expanded[section.id];
          const items = open ? section.items || [] : (section.items || []).slice(0, 3);
          return <section id={`course-${section.slug}`} key={section.id}>
            <header><h2>{section.title_mn}</h2><span>{section.description_mn}</span></header>
            <div className="course-list">{items.map((item, index) => <details key={item.id} open={index === 0}><summary><span><strong>{item.title_mn}</strong><em>{item.short_desc_mn}</em></span><ChevronDown className="course-chevron" size={20} aria-hidden="true" /></summary><div><p>{item.full_desc_mn || item.short_desc_mn}</p><ul>{item.teacher_name ? <li><Users /> Багш: {item.teacher_name}</li> : null}{item.schedule_mn ? <li><Clock3 /> {item.schedule_mn}</li> : null}{item.location_mn ? <li><MapPin /> {item.location_mn}</li> : null}</ul></div></details>)}</div>
            {(section.items?.length || 0) > 3 ? <button className="secondary-button" type="button" onClick={() => setExpanded(value => ({ ...value, [section.id]: !value[section.id] }))}>{open ? "Хураах" : "Бүгдийг харуулах"}</button> : null}
          </section>;
        })}
      </div>
    </div>
  );
}
