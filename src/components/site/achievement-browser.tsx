"use client";
import { useSiteData } from "./site-data-provider";

import Image from "next/image";
import { Award, GraduationCap, Medal, Microscope, Star, Users } from "lucide-react";
import { useMemo, useState } from "react";
import type { AchievementYear } from "@/types/database";

function CategoryIcon({ name }: { name: string }) {
  if (name.includes("Төгсөгч")) return <GraduationCap aria-hidden="true" />;
  if (name.includes("Хамт")) return <Users aria-hidden="true" />;
  if (name.includes("Судал")) return <Microscope aria-hidden="true" />;
  return <Medal aria-hidden="true" />;
}

export function AchievementBrowser() {
  const { achievements: years } = useSiteData();
  const sorted = useMemo(() => [...years].sort((a, b) => a.year - b.year), [years]);
  const [activeId, setActiveId] = useState(sorted.at(-1)?.id || "");
  const active = sorted.find(item => item.id === activeId) || sorted.at(-1);
  const groups = useMemo(() => {
    const map = new Map<string, NonNullable<AchievementYear["achievements"]>>();
    for (const record of active?.achievements || []) {
      const name = record.category?.name_mn || "Амжилт";
      map.set(name, [...(map.get(name) || []), record]);
    }
    return [...map.entries()];
  }, [active]);

  if (!active) return <p className="empty-state">Амжилтын мэдээлэл удахгүй нэмэгдэнэ.</p>;

  return (
    <div className="achievement-browser">
      <div className="year-index" role="tablist" aria-label="Амжилтын он сонгох">
        {sorted.map(year => <button type="button" role="tab" aria-selected={year.id === active.id} id={`year-tab-${year.id}`} tabIndex={year.id === active.id ? 0 : -1} onKeyDown={event => {
          const index = sorted.findIndex(item => item.id === year.id);
          const next = event.key === "ArrowRight" ? (index + 1) % sorted.length : event.key === "ArrowLeft" ? (index - 1 + sorted.length) % sorted.length : event.key === "Home" ? 0 : event.key === "End" ? sorted.length - 1 : -1;
          if (next < 0) return;
          event.preventDefault(); setActiveId(sorted[next].id);
          document.getElementById(`year-tab-${sorted[next].id}`)?.focus();
        }} aria-controls="achievement-panel" key={year.id} onClick={() => setActiveId(year.id)}><strong>{year.year}</strong><span>{year.highlight_mn || "Амжилт"}</span></button>)}
      </div>
      <article className="achievement-panel" id="achievement-panel" role="tabpanel" aria-labelledby={`year-tab-${active.id}`}>
        <div className="achievement-year"><span>{active.year}</span>{active.is_milestone ? <b><Star size={16} /> Түүхэн үйл явдал</b> : <b><Award size={16} /> Онцлох жил</b>}</div>
        <div className="achievement-summary"><p>Тухайн жилийн онцлох үйл явдал</p><h2>{active.highlight_mn || "Амжилтын жил"}</h2><span>{active.description_mn}</span></div>
        {active.image_url ? <div className="achievement-image"><Image src={active.image_url} alt={active.highlight_mn || `${active.year} оны амжилт`} fill sizes="(max-width: 760px) 100vw, 50vw" unoptimized /></div> : null}
        {groups.length ? <div className="achievement-groups">{groups.map(([name, records]) => <section key={name}><h3><CategoryIcon name={name} /> {name}</h3>{records.map(record => <article key={record.id}><div><h4>{record.title_mn}</h4><p>{record.description_mn}</p></div>{record.image_url ? <Image src={record.image_url} alt="" width={120} height={90} unoptimized /> : null}</article>)}</section>)}</div> : <p className="empty-state">Энэ жилийн дэлгэрэнгүй бүртгэл удахгүй нэмэгдэнэ.</p>}
      </article>
    </div>
  );
}
