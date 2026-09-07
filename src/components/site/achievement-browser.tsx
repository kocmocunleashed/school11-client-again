"use client";
import { useSiteData } from "./site-data-provider";

import Image from "next/image";
import { Award, GraduationCap, Medal, Microscope, Star, Users, Pause, Play } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { AchievementYear } from "@/types/database";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
function subscribeMotion(callback: () => void) {
  const query = window.matchMedia(reducedMotionQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

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
  const [playing, setPlaying] = useState(true);
  const reducedMotion = useSyncExternalStore(subscribeMotion, () => window.matchMedia(reducedMotionQuery).matches, () => true);
  const container = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const hovered = useRef(false);
  const focused = useRef(false);
  useEffect(() => {
    const node = container.current;
    if (!node || !playing || reducedMotion || sorted.length < 2) return;
    let inView = false;
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; }, { threshold: .15 });
    observer.observe(node);
    const timer = window.setInterval(() => {
      if (!inView || hovered.current || focused.current || document.hidden) return;
      setActiveId(current => {
        const index = sorted.findIndex(year => year.id === current);
        return sorted[(index + 1) % sorted.length].id;
      });
    }, 8000);
    return () => { observer.disconnect(); clearInterval(timer); };
  }, [playing, reducedMotion, sorted]);
  useEffect(() => {
    const node = rail.current;
    const tab = node?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!node || !tab) return;
    const bounds = tab.getBoundingClientRect();
    const viewport = node.getBoundingClientRect();
    if (bounds.left < viewport.left || bounds.right > viewport.right) {
      node.scrollTo({ left: node.scrollLeft + bounds.left - viewport.left, behavior: reducedMotion ? "instant" : "smooth" });
    }
  }, [activeId, reducedMotion]);
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
    <div className="achievement-browser" ref={container} onMouseEnter={() => { hovered.current = true; }} onMouseLeave={() => { hovered.current = false; }} onFocus={() => { focused.current = true; }} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) focused.current = false; }}>
      {sorted.length > 1 && !reducedMotion && <div className="year-playback"><span>Он жилээр аялах · 8 секунд тутам</span><button type="button" onClick={() => setPlaying(value => !value)} aria-pressed={!playing} aria-label={playing ? "Он жилийн автомат гүйлгэлтийг түр зогсоох" : "Он жилийн автомат гүйлгэлтийг эхлүүлэх"}>{playing ? <Pause size={18} /> : <Play size={18} />}{playing ? "Түр зогсоох" : "Үргэлжлүүлэх"}</button></div>}
      <div className="year-index" ref={rail} role="tablist" aria-label="Амжилтын он сонгох">
        {sorted.map(year => <button type="button" role="tab" aria-selected={year.id === active.id} id={`year-tab-${year.id}`} tabIndex={year.id === active.id ? 0 : -1} onKeyDown={event => {
          const index = sorted.findIndex(item => item.id === year.id);
          const next = event.key === "ArrowRight" ? (index + 1) % sorted.length : event.key === "ArrowLeft" ? (index - 1 + sorted.length) % sorted.length : event.key === "Home" ? 0 : event.key === "End" ? sorted.length - 1 : -1;
          if (next < 0) return;
          event.preventDefault(); setPlaying(false); setActiveId(sorted[next].id);
          document.getElementById(`year-tab-${sorted[next].id}`)?.focus();
        }} aria-controls="achievement-panel" key={year.id} onClick={() => { setPlaying(false); setActiveId(year.id); }}><strong>{year.year}</strong><span>{year.highlight_mn || "Амжилт"}</span></button>)}
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
