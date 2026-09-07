"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, Medal, Pause, Play, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useSiteData } from "./site-data-provider";
import type { HallRecord } from "@/types/database";

type Honoree = HallRecord;
const source = "https://www.famhall.school11.edu.mn/";
const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribeMotion(callback: () => void) {
  const query = window.matchMedia(motionQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
const latestYear = (person: Honoree) => Math.max(0, ...person.medals.flatMap(medal => (medal.year.match(/\d{4}/g) || []).map(Number)));
const medalTone = (medal: string) => medal.toLowerCase().includes("алт") ? "gold" : medal.toLowerCase().includes("мөнгө") ? "silver" : "bronze";

function HonoreeCard({ person }: { person: Honoree }) {
  const [failed, setFailed] = useState(false);
  const medals = [...person.medals].sort((a, b) => Number(b.year.match(/\d{4}/g)?.at(-1) || 0) - Number(a.year.match(/\d{4}/g)?.at(-1) || 0));
  return <article className="honoree-card">
    <div className="honoree-photo">
      {!failed && person.photo ? <Image src={person.photo} alt={person.name} fill sizes="(max-width: 700px) 260px, 290px" unoptimized loading="lazy" onError={() => setFailed(true)} /> : <span className="honoree-initials" aria-hidden="true">{person.name.split(/[.\s]+/).filter(Boolean).map(part => part[0]).slice(0, 2).join("")}</span>}
      <span className="honoree-level">{person.scope === "international" ? "Олон улс" : "Улс"}</span>
      {latestYear(person) > 0 && <span className="honoree-year">{latestYear(person)}</span>}
    </div>
    <div className="honoree-copy"><h3>{person.name}</h3><ul>{medals.slice(0, 3).map((medal, index) => <li key={`${medal.competition}-${medal.year}-${index}`}><Medal aria-hidden="true" className={`medal-${medalTone(medal.medal)}`} size={19} /><span><strong>{medal.competition} · {medal.medal}</strong><small>{/\d{4}/.test(medal.year) ? medal.year : "Он тэмдэглээгүй"}</small></span></li>)}</ul>{medals.length > 3 && <details className="honoree-more"><summary>+{medals.length - 3} бусад амжилт</summary><ul>{medals.slice(3).map((medal, index) => <li key={index}><Medal aria-hidden="true" size={19} className={`medal-${medalTone(medal.medal)}`} /><span><strong>{medal.competition} · {medal.medal}</strong><small>{/\d{4}/.test(medal.year) ? medal.year : "Он тэмдэглээгүй"}</small></span></li>)}</ul></details>}</div>
  </article>;
}

export function HallOfFame({ home = false }: { home?: boolean }) {
  const { hallOfFame: records } = useSiteData();
  const [scope, setScope] = useState("all");
  const [query, setQuery] = useState("");
  const [playing, setPlaying] = useState(true);
  const reducedMotion = useSyncExternalStore(subscribeMotion, () => window.matchMedia(motionQuery).matches, () => true);
  const rail = useRef<HTMLDivElement>(null);
  const hovered = useRef(false);
  const focused = useRef(false);
  const filtered = useMemo(() => records.filter(person => (scope === "all" || person.scope === scope) && `${person.name} ${person.medals.map(m => `${m.competition} ${m.medal} ${m.year}`).join(" ")}`.toLocaleLowerCase("mn-MN").includes(query.trim().toLocaleLowerCase("mn-MN"))).sort((a, b) => a.display_order - b.display_order || latestYear(b) - latestYear(a) || a.name.localeCompare(b.name, "mn-MN")), [records, scope, query]);
  const visible = home ? filtered.filter(person => person.is_featured).filter((person, index, items) => items.findIndex(item => item.name === person.name) === index).slice(0, 12) : filtered;

  useEffect(() => {
    const node = rail.current;
    if (!node || !playing || reducedMotion || !visible.length) return;
    let inView = false;
    let frame = 0;
    let previous = 0;
    let position = node.scrollLeft;
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; }, { threshold: 0.15 });
    observer.observe(node);
    function tick(now: number) {
      if (inView && !hovered.current && !focused.current && previous) {
        const max = node!.scrollWidth - node!.clientWidth;
        if (max > 1) {
          position += Math.min(now - previous, 48) * 0.025;
          node!.scrollLeft = position;
          if (node!.scrollLeft >= max - 1) { setPlaying(false); return; }
        }
      }
      if (!inView || hovered.current || focused.current) position = node!.scrollLeft;
      previous = now;
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [playing, reducedMotion, visible.length]);

  function step(direction: number) {
    setPlaying(false);
    const node = rail.current;
    if (node) node.scrollBy({ left: direction * ((node.querySelector("article")?.getBoundingClientRect().width || 290) + 22), behavior: reducedMotion ? "instant" : "smooth" });
  }
  function toggle() {
    if (!playing && rail.current && rail.current.scrollLeft >= rail.current.scrollWidth - rail.current.clientWidth - 2) rail.current.scrollLeft = 0;
    setPlaying(value => !value);
  }
  return <section className={`hall-section ${home ? "hall-home" : "hall-full"}`} aria-labelledby="hall-title">
    <div className={home ? "shell" : undefined}>
      <div className="hall-heading"><div><span className="hall-kicker"><Medal size={20} aria-hidden="true" /> ХҮНДЭТ САМБАР</span><h2 id="hall-title">Амжилтын ард<br /><span>өөрийн нэр бий.</span></h2></div>{home ? <Link href="/achievements#hall-of-fame" className="text-action">Бүх нэрийг харах <ArrowUpRight /></Link> : <p>Олимпиадын медальт сурагчдын нэр, амжилт, он жил.</p>}</div>
      {!home && <div className="hall-tools"><div className="hall-filters" role="group" aria-label="Олимпиадын түвшин">{[["all", "Бүгд"], ["international", "Олон улс"], ["national", "Улс"]].map(([value, label]) => <button type="button" aria-pressed={scope === value} key={value} onClick={() => { setScope(value); setPlaying(false); if (rail.current) rail.current.scrollLeft = 0; }}>{label}</button>)}</div><label className="hall-search"><Search size={18} aria-hidden="true" /><input aria-label="Нэр, олимпиад, оноор хайх" placeholder="Нэр, олимпиад, он…" value={query} onChange={event => { setQuery(event.target.value); setPlaying(false); if (rail.current) rail.current.scrollLeft = 0; }} /></label><span className="hall-count" aria-live="polite">{filtered.length} бүртгэл</span></div>}
      <div className="hall-controls"><span>{reducedMotion ? "Хажуу тийш гүйлгэж үзээрэй" : "Нэр бүрийг нээж, амжилтаар нь аялаарай"}</span><div>{!reducedMotion && <button type="button" className="hall-pause" onClick={toggle} aria-label={playing ? "Автомат гүйлгэлтийг түр зогсоох" : "Автомат гүйлгэлтийг эхлүүлэх"} aria-pressed={!playing}>{playing ? <Pause size={16} /> : <Play size={16} />}<span>{playing ? "Түр зогсоох" : "Үргэлжлүүлэх"}</span></button>}<button type="button" onClick={() => step(-1)} aria-label="Өмнөх сурагчид"><ArrowLeft size={20} /></button><button type="button" onClick={() => step(1)} aria-label="Дараах сурагчид"><ArrowRight size={20} /></button></div></div>
      {visible.length ? <div className="honoree-rail" ref={rail} tabIndex={0} role="region" aria-label="Медальт сурагчдын гүйлгэх жагсаалт" onMouseEnter={() => { hovered.current = true; }} onMouseLeave={() => { hovered.current = false; }} onFocus={() => { focused.current = true; }} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) focused.current = false; }} onPointerDown={() => setPlaying(false)} onWheel={() => setPlaying(false)} onKeyDown={event => { if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); step(event.key === "ArrowRight" ? 1 : -1); } }}>
        {visible.map(person => <HonoreeCard key={person.id} person={person} />)}
      </div> : <p className="hall-empty">Тохирох нэр олдсонгүй. Өөр нэр, олимпиад эсвэл оноор хайна уу.</p>}
      {records.some(person => person.source_url === source) && <p className="hall-source">Архивын эх сурвалж: <a href={source} target="_blank" rel="noreferrer">11-р сургуулийн хүндэт самбар <ArrowUpRight size={12} /></a><span>Архивыг 2026.09.05-нд авсан. Дараагийн өөрчлөлтийг сургуулийн удирдлага шинэчилнэ.</span></p>}

    </div>
  </section>;
}
