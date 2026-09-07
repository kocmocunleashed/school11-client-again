"use client";

import Image from "next/image";
import { CalendarDays, X } from "lucide-react";
import { useEffect, useId, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { useSiteData } from "./site-data-provider";
import type { NewsArticle } from "@/types/database";

const focusable = "a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex='-1'])";
const mongolianMonths = ["нэгдүгээр", "хоёрдугаар", "гуравдугаар", "дөрөвдүгээр", "тавдугаар", "зургадугаар", "долдугаар", "наймдугаар", "есдүгээр", "аравдугаар", "арван нэгдүгээр", "арван хоёрдугаар"];

function dateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getUTCFullYear()} оны ${mongolianMonths[date.getUTCMonth()]} сарын ${date.getUTCDate()}`;
}

function Cover({ item }: { item: NewsArticle }) {
  if (!item.cover_image_url) return <div className={`news-art news-art-${item.category?.slug || "event"}`} aria-hidden="true"><span>{item.category?.slug === "olympiad" ? "∑" : item.category?.slug === "club" ? "✳" : "11"}</span><small>11-Р СУРГУУЛЬ</small></div>;
  return <Image src={item.cover_image_url} alt={item.cover_image_url ? item.title_mn : "Нийслэлийн 11-р сургуулийн байр"} fill sizes="(max-width: 760px) 100vw, 50vw" unoptimized={Boolean(item.cover_image_url)} />;
}

export function NewsBrowser({ home = false }: { items?: NewsArticle[]; home?: boolean }) {
  const { news: feedItems } = useSiteData();
  const [selectedRecord, setSelected] = useState<NewsArticle | null>(null);
  const selected = feedItems.find(item => item.id === selectedRecord?.id) || null;
  const [showAll, setShowAll] = useState(!home);
  const dialog = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const visible = showAll ? feedItems : feedItems.slice(0, 3);

  const open = (item: NewsArticle, event: ReactMouseEvent<HTMLElement>) => {
    opener.current = event.currentTarget;
    setSelected(item);
  };

  useEffect(() => {
    if (!selected) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const node = dialog.current;
    node?.querySelector<HTMLElement>(focusable)?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
      if (event.key !== "Tab" || !node) return;
      const controls = Array.from(node.querySelectorAll<HTMLElement>(focusable));
      if (!controls.length) return;
      const first = controls[0]!;
      const last = controls.at(-1)!;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      opener.current?.focus();
    };
  }, [selected]);

  return (
    <>
      {!feedItems.length && <p className="empty-state">Мэдээ хараахан нийтлэгдээгүй байна.</p>}
      <div className={`news-layout ${home ? "is-home" : ""}`}>
        {visible.map((item, index) => <article className={`news-card ${index === 0 && home ? "is-featured" : ""}`} key={item.id}>
          <button type="button" className="news-cover" onClick={event => open(item, event)} aria-label={`${item.title_mn} мэдээг унших`}><Cover item={item} /></button>
          <div className="news-copy">
            <p className="news-category">{item.category?.name_mn || "Мэдээ"}</p>
            <p className="news-date"><CalendarDays size={15} /> {dateLabel(item.published_at)}</p>
            <h3>{item.title_mn}</h3>
            <p>{item.excerpt_mn}</p>
            <button type="button" className="text-action" onClick={event => open(item, event)}>Дэлгэрэнгүй унших <span aria-hidden="true">→</span></button>
          </div>
        </article>)}
      </div>
      {home && feedItems.length > 3 ? <button className="secondary-button news-more" type="button" onClick={() => setShowAll(value => !value)}>{showAll ? "Хураах" : "Бүх мэдээг харах"}</button> : null}
      {selected ? <div className="dialog-backdrop" onMouseDown={event => event.target === event.currentTarget && setSelected(null)}>
        <div className="news-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} ref={dialog}>
          <button className="dialog-close" type="button" onClick={() => setSelected(null)} aria-label="Мэдээ хаах"><X /></button>
          <div className="dialog-image"><Cover item={selected} /></div>
          <div className="dialog-copy">
            <p className="news-category">{selected.category?.name_mn || "Мэдээ"}</p>
            <p className="news-date">{dateLabel(selected.published_at)} · {selected.read_time_min || 3} минут</p>
            <h2 id={titleId}>{selected.title_mn}</h2>
            <p className="dialog-author">{selected.author_name}{selected.author_role ? ` · ${selected.author_role}` : ""}</p>
            <div className="article-body"><p>{selected.body_mn || selected.excerpt_mn}</p></div>
            <div className="tag-list">{selected.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
          </div>
        </div>
      </div> : null}
    </>
  );
}
