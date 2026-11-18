"use client";
import { useSiteData } from "./site-data-provider";
import { SchoolCalendar } from "./school-calendar";

import { ArrowDownRight, BookOpen, ChevronDown, Clock3, MapPin, Trophy, Users } from "lucide-react";
import { useState } from "react";

function SectionIcon({ icon }: { icon: string | null }) {
  if (icon === "trophy") return <Trophy aria-hidden="true" />;
  if (icon === "users") return <Users aria-hidden="true" />;
  return <BookOpen aria-hidden="true" />;
}

export function CourseCatalog() {
  const { courses: sections } = useSiteData();
  const calendarSection = sections.find(section => section.slug === "calendar" || /календар|хуанли/i.test(section.title_mn));
  const programs = sections.filter(section => section.id !== calendarSection?.id);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  return (
    <div className="course-catalog">
      <div className="study-overview">
        <section className="study-index" id="programs">
          <header><h2>Сургалтын чиглэлүүд</h2><a href="#school-calendar" className="study-calendar-link">Хуанли <ArrowDownRight size={16} aria-hidden="true" /></a></header>
          <nav aria-label="Сургалтын ангилал">
            {programs.map(section => <a href={`#course-${section.slug}`} key={section.id}>
              <span className="study-icon"><SectionIcon icon={section.icon} /></span>
              <span><strong>{section.title_mn}</strong><span>{section.description_mn}</span></span>
              <ArrowDownRight size={20} aria-hidden="true" />
            </a>)}
          </nav>
          {!programs.length && <p className="empty-state">Сургалтын мэдээлэл хараахан нийтлэгдээгүй байна.</p>}
        </section>
        <section className="study-calendar" id={`course-${calendarSection?.slug || "calendar"}`}>
          <h2>Хичээлийн хуанли</h2><div id="school-calendar"><SchoolCalendar /></div>
        </section>
      </div>
      <div className="course-sections">
        {programs.map(section => {
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
