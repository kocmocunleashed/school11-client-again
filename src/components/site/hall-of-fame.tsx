"use client";

import { getImageProps } from "next/image";
import { unoptimizedPublicImage } from "@/lib/image-policy";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, Medal, Pause, Play, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useSiteData } from "./site-data-provider";
import { compareHallRecords, homeHallHighlights, latestHallYear } from "@/lib/hall-highlights";
import { createVisibleAnimation } from "@/lib/visible-animation";
import type { HallRecord } from "@/types/database";

type Honoree = HallRecord;
const source = "https://www.famhall.school11.edu.mn/";
const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribeMotion(callback: () => void) {
  const query = window.matchMedia(motionQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
const medalTone = (medal: string) => medal.toLowerCase().includes("алт") ? "gold" : medal.toLowerCase().includes("мөнгө") ? "silver" : "bronze";

function Portrait({ src, name, onError }: { src: string; name: string; onError: () => void }) {
  const { props } = getImageProps({ src, alt: name, width: 290, height: 250, loading: "lazy", unoptimized: unoptimizedPublicImage(src) });
  // Cards have a fixed 260–282px width. Use Next's 2x optimized source without
  // repeating candidate URLs across 172 archive records in the HTML.
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...props} alt={name} srcSet={undefined} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={onError} />;
}

function HonoreeCard({ person }: { person: Honoree }) {
  const [failed, setFailed] = useState(false);
  const medals = [...person.medals].sort((a, b) => Number(b.year.match(/\d{4}/g)?.at(-1) || 0) - Number(a.year.match(/\d{4}/g)?.at(-1) || 0));
  return <article className="honoree-card">
    <div className="honoree-photo">
      {!failed && person.photo ? <Portrait src={person.photo} name={person.name} onError={() => setFailed(true)} /> : <span className="honoree-initials" aria-hidden="true">{person.name.split(/[.\s]+/).filter(Boolean).map(part => part[0]).slice(0, 2).join("")}</span>}
      <span className="honoree-level">{person.scope === "international" ? "Олон улс" : "Улс"}</span>
      {latestHallYear(person) > 0 && <span className="honoree-year">{latestHallYear(person)}</span>}
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
  const motion = useRef<ReturnType<typeof createVisibleAnimation> | null>(null);
  const hovered = useRef(false);
  const focused = useRef(false);
  const filtered = useMemo(() => records.filter(person => (scope === "all" || person.scope === scope) && `${person.name} ${person.medals.map(m => `${m.competition} ${m.medal} ${m.year}`).join(" ")}`.toLocaleLowerCase("mn-MN").includes(query.trim().toLocaleLowerCase("mn-MN"))).sort(compareHallRecords), [records, scope, query]);
  const visible = home ? homeHallHighlights(filtered) : filtered;

  useEffect(() => {
    const node = rail.current;
    if (!node || !playing || reducedMotion || !visible.length) return;
    let position = node.scrollLeft;
    const animation = createVisibleAnimation(elapsed => {
      const max = node.scrollWidth - node.clientWidth;
      if (max > 1) {
        position += elapsed * 0.025;
        node.scrollLeft = position;
        if (node.scrollLeft >= max - 1) { setPlaying(false); return false; }
      }
      return true;
    }, () => { position = node.scrollLeft; });
    motion.current = animation;
    const onVisibility = () => animation.setDocumentVisible(!document.hidden);
    onVisibility();
    animation.setPaused(hovered.current || focused.current);
    const observer = new IntersectionObserver(([entry]) => animation.setInView(entry.isIntersecting), { threshold: 0.15 });
    observer.observe(node);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      animation.dispose();
      motion.current = null;
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
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
    <div className={home ? "shell mx-auto w-[var(--shell)]" : undefined}>
      <div className="hall-heading"><div><span className="hall-kicker"><Medal size={20} aria-hidden="true" /> ХҮНДЭТ САМБАР</span><h2 id="hall-title">Амжилтын ард<br /><span>өөрийн нэр бий.</span></h2></div>{home ? <Link href="/achievements#hall-of-fame" className="text-action">Бүх нэрийг харах <ArrowUpRight /></Link> : <p>Олимпиадын медальт сурагчдын нэр, амжилт, он жил.</p>}</div>
      {!home && <div className="hall-tools"><div className="hall-filters" role="group" aria-label="Олимпиадын түвшин">{[["all", "Бүгд"], ["international", "Олон улс"], ["national", "Улс"]].map(([value, label]) => <button type="button" aria-pressed={scope === value} key={value} onClick={() => { setScope(value); setPlaying(false); if (rail.current) rail.current.scrollLeft = 0; }}>{label}</button>)}</div><label className="hall-search"><Search size={18} aria-hidden="true" /><input aria-label="Нэр, олимпиад, оноор хайх" placeholder="Нэр, олимпиад, он…" value={query} onChange={event => { setQuery(event.target.value); setPlaying(false); if (rail.current) rail.current.scrollLeft = 0; }} /></label><span className="hall-count" aria-live="polite">{filtered.length} бүртгэл</span></div>}
      <div className="hall-controls"><span>{reducedMotion ? "Хажуу тийш гүйлгэж үзээрэй" : "Нэр бүрийг нээж, амжилтаар нь аялаарай"}</span><div>{!reducedMotion && <button type="button" className="hall-pause" onClick={toggle} aria-label={playing ? "Автомат гүйлгэлтийг түр зогсоох" : "Автомат гүйлгэлтийг эхлүүлэх"} aria-pressed={!playing}>{playing ? <Pause size={16} /> : <Play size={16} />}<span>{playing ? "Түр зогсоох" : "Үргэлжлүүлэх"}</span></button>}<button type="button" onClick={() => step(-1)} aria-label="Өмнөх сурагчид"><ArrowLeft size={20} /></button><button type="button" onClick={() => step(1)} aria-label="Дараах сурагчид"><ArrowRight size={20} /></button></div></div>
      {visible.length ? <div className="honoree-rail" ref={rail} tabIndex={0} role="region" aria-label="Медальт сурагчдын гүйлгэх жагсаалт" onMouseEnter={() => { hovered.current = true; motion.current?.setPaused(true); }} onMouseLeave={() => { hovered.current = false; motion.current?.setPaused(focused.current); }} onFocus={() => { focused.current = true; motion.current?.setPaused(true); }} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) focused.current = false; motion.current?.setPaused(hovered.current || focused.current); }} onPointerDown={() => setPlaying(false)} onWheel={() => setPlaying(false)} onKeyDown={event => { if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); step(event.key === "ArrowRight" ? 1 : -1); } }}>
        {visible.map(person => <HonoreeCard key={person.id} person={person} />)}
      </div> : <p className="hall-empty p-[35px] [border:1px_solid_#79849a] text-[14px]">Тохирох нэр олдсонгүй. Өөр нэр, олимпиад эсвэл оноор хайна уу.</p>}
      {records.some(person => person.source_url === source) && <p className="hall-source">Архивын эх сурвалж: <a href={source} target="_blank" rel="noreferrer">11-р сургуулийн хүндэт самбар <ArrowUpRight size={12} /></a><span>Архивыг 2026.09.05-нд авсан. Дараагийн өөрчлөлтийг сургуулийн удирдлага шинэчилнэ.</span></p>}

    </div>
  </section>;
}
