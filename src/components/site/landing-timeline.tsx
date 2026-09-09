"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState, type CSSProperties } from "react";
import { useSiteData } from "./site-data-provider";

const colors = ["#fec541", "#36d484", "#32ccf4"];

/** Homepage-only presentation; the detailed achievements browser is independent. */
export function LandingTimeline() {
  const { achievements } = useSiteData();
  const records = useMemo(() => [...achievements].sort((a, b) => a.year - b.year), [achievements]);
  const periods = useMemo(() => Array.from(new Set(records.map(record => Math.floor(record.year / 10) * 10))), [records]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [animate, setAnimate] = useState(false);
  const [direction, setDirection] = useState<"next" | "previous">("next");
  const activeIndex = Math.max(0, records.findIndex(record => record.id === selectedId));
  const active = records[activeIndex];
  const activePeriod = active ? Math.floor(active.year / 10) * 10 : 0;
  const periodIndex = periods.indexOf(activePeriod);
  const rail = useRef<HTMLDivElement>(null);
  const id = useId();
  const panelId = `${id}-panel`;

  useEffect(() => {
    const viewport = rail.current;
    if (!viewport) return;
    const center = (smooth: boolean) => {
      const node = viewport.querySelector<HTMLElement>('[aria-selected="true"]');
      if (!node) return;
      const offset = node.getBoundingClientRect().left - viewport.getBoundingClientRect().left;
      viewport.scrollTo({ left: viewport.scrollLeft + offset - viewport.clientWidth / 2 + node.clientWidth / 2, behavior: smooth && !window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "smooth" : "instant" });
    };
    center(animate);
    const observer = new ResizeObserver(() => center(false));
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [active?.id, animate]);

  const select = (index: number, withMotion = true) => {
    if (index < 0 || index >= records.length || index === activeIndex) return;
    setDirection(index > activeIndex ? "next" : "previous");
    setAnimate(withMotion); setSelectedId(records[index].id);
  };
  const selectPeriod = (index: number) => {
    if (index < 0 || index >= periods.length) return;
    select(records.findIndex(record => Math.floor(record.year / 10) * 10 === periods[index]));
  };

  if (!active) return null;
  const previous = records[activeIndex - 1];
  const next = records[activeIndex + 1];
  const accent = colors[periodIndex % colors.length];
  return <section className="landing-timeline" id="school-history" aria-labelledby={`${id}-heading`} style={{ "--timeline-accent": accent } as CSSProperties}>
    <div className="shell mx-auto w-[var(--shell)]">
      <header className="landing-timeline-heading"><div><p className="landing-timeline-eyebrow">БИДНИЙ ЗАМНАЛ</p><h2 id={`${id}-heading`}>Он жилүүдээр аялъя.</h2></div><Link href="/achievements" className="text-action">Бүх амжилт <ArrowUpRight /></Link></header>
      <div className="landing-timeline-periods" aria-label="Түүхийн үе сонгох">
        <button className="landing-timeline-arrow" type="button" aria-label="Өмнөх үе" disabled={periodIndex <= 0} onClick={() => selectPeriod(periodIndex - 1)}><ArrowLeft size={22} /></button>
        <div className="landing-timeline-period-label"><span>ТҮҮХИЙН ҮЕ</span><strong aria-live="polite">{activePeriod}<i>—</i>{activePeriod + 9}</strong><span>{String(periodIndex + 1).padStart(2, "0")} / {String(periods.length).padStart(2, "0")}</span></div>
        <button className="landing-timeline-arrow" type="button" aria-label="Дараах үе" disabled={periodIndex >= periods.length - 1} onClick={() => selectPeriod(periodIndex + 1)}><ArrowRight size={22} /></button>
      </div>
      <div className="landing-timeline-cards">
        <button type="button" className="landing-timeline-neighbor" disabled={!previous} aria-label={previous ? `${previous.year} оны үйл явдлыг харах` : "Өмнөх жил байхгүй"} aria-controls={panelId} onClick={event => select(activeIndex - 1, event.detail !== 0)}>{previous && <><span>{previous.year}</span><span className="landing-timeline-neighbor-title">{previous.highlight_mn || "Онцлох үйл явдал"}</span></>}</button>
        <article key={active.id} id={panelId} className="landing-timeline-card" data-animate={animate} data-direction={direction} role="tabpanel" aria-labelledby={`${id}-node-${active.id}`} tabIndex={0}>
          <div className="landing-timeline-card-copy"><div className="landing-timeline-card-meta"><span>{active.is_milestone ? "ТҮҮХЭН ҮЙЛ ЯВДАЛ" : "ОНЦЛОХ ЖИЛ"}</span><span>{String(activeIndex + 1).padStart(2, "0")} / {String(records.length).padStart(2, "0")}</span></div><p className="landing-timeline-year">{active.year}</p><h3>{active.highlight_mn || "Онцлох үйл явдал"}</h3>{active.description_mn && <p className="landing-timeline-description">{active.description_mn}</p>}</div>
          {active.image_url && <div className="landing-timeline-image"><Image src={active.image_url} alt={active.highlight_mn || `${active.year} он`} fill sizes="(max-width: 700px) 90vw, 55vw" unoptimized /></div>}
        </article>
        <button type="button" className="landing-timeline-neighbor" disabled={!next} aria-label={next ? `${next.year} оны үйл явдлыг харах` : "Дараах жил байхгүй"} aria-controls={panelId} onClick={event => select(activeIndex + 1, event.detail !== 0)}>{next && <><span>{next.year}</span><span className="landing-timeline-neighbor-title">{next.highlight_mn || "Онцлох үйл явдал"}</span></>}</button>
      </div>
      <div className="landing-timeline-navigation">
        <button className="landing-timeline-arrow" type="button" aria-label="Өмнөх үйл явдал" disabled={activeIndex === 0} onClick={() => select(activeIndex - 1)}><ArrowLeft size={22} /></button>
        <div className="landing-timeline-rail" ref={rail} role="tablist" aria-label="Он жилээр аялах">
          {records.map((record, index) => <button type="button" className="landing-timeline-node" role="tab" key={record.id} id={`${id}-node-${record.id}`} aria-label={`${record.year}: ${record.highlight_mn || "Онцлох үйл явдал"}`} aria-selected={index === activeIndex} aria-controls={panelId} tabIndex={index === activeIndex ? 0 : -1} style={{ "--node-accent": colors[periods.indexOf(Math.floor(record.year / 10) * 10) % colors.length] } as CSSProperties} onClick={() => select(index)} onKeyDown={event => {
            const destination = event.key === "ArrowRight" ? Math.min(index + 1, records.length - 1) : event.key === "ArrowLeft" ? Math.max(index - 1, 0) : event.key === "Home" ? 0 : event.key === "End" ? records.length - 1 : -1;
            if (destination < 0) return;
            event.preventDefault(); select(destination, false);
            document.getElementById(`${id}-node-${records[destination].id}`)?.focus({ preventScroll: true });
          }}><span className="landing-timeline-dot" /><span>{record.year}</span></button>)}
        </div>
        <button className="landing-timeline-arrow" type="button" aria-label="Дараах үйл явдал" disabled={activeIndex === records.length - 1} onClick={() => select(activeIndex + 1)}><ArrowRight size={22} /></button>
      </div>
      <p className="landing-timeline-caption">Он сонгож сургуулийн түүхтэй танилцаарай.</p>
    </div>
  </section>;
}
