"use client";

import Image from "next/image";
import { Mic, Play, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { useSiteData } from "./site-data-provider";
import { youtubeVideoUrl } from "@/lib/podcast-data";
import type { Podcast } from "@/types/database";

function PodcastCard({ item }: { item: Podcast }) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const [failedLogo, setFailedLogo] = useState<string | null>(null);
  const href = youtubeVideoUrl(item.youtube_url);
  if (!href) return null;
  const id = new URL(href).searchParams.get("v");
  const image = item.thumbnail_url || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  return <li><a className="podcast-card" href={href} target="_blank" rel="noopener noreferrer" aria-label={`${item.title_mn} — YouTube дээр үзэх (шинэ цонх)`}>
    <div className="podcast-thumbnail">
      {failedImage !== image ? <Image src={image} alt="" fill sizes="(max-width: 600px) 90vw, (max-width: 1000px) 45vw, 23vw" unoptimized onError={() => setFailedImage(image)} /> : <Mic size={48} aria-hidden="true" />}
      <span className="podcast-play" aria-hidden="true"><Play size={18} fill="currentColor" /></span>
    </div>
    <div className="podcast-details">
      <span className="podcast-logo">{item.channel_logo_url && failedLogo !== item.channel_logo_url ? <Image src={item.channel_logo_url} alt="" width={36} height={36} unoptimized onError={() => setFailedLogo(item.channel_logo_url)} /> : <Mic size={20} aria-hidden="true" />}</span>
      <div><h3>{item.title_mn}</h3><p>{item.channel_name}</p></div>
      <ArrowUpRight className="podcast-external" size={16} aria-hidden="true" />
    </div>
  </a></li>;
}

export function Podcasts() {
  const { podcasts = [] } = useSiteData();
  return <section className="podcasts-section" id="podcasts" aria-labelledby="podcasts-title">
    <div className="shell mx-auto w-[var(--shell)]">
      <div className="section-heading"><div><p>ҮЗЭХ · СОНСОХ · СЭТГЭХ</p><h2 id="podcasts-title">Подкаст</h2></div><span className="podcast-platform">YouTube <ArrowUpRight size={18} aria-hidden="true" /></span></div>
      {podcasts.length ? <ul className="podcast-grid">{podcasts.map(item => <PodcastCard item={item} key={item.id} />)}</ul> : <p className="podcast-empty">Шинэ дугаарууд удахгүй нэмэгдэнэ.</p>}
    </div>
  </section>;
}
