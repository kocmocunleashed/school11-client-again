import Image from "next/image";
import Link from "next/link";
import { PT_Serif } from "next/font/google";
import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import { unoptimizedPublicImage } from "@/lib/image-policy";
import anniversaryFacts from "@/lib/data/anniversary-facts.json";
import type { SiteCopy } from "@/lib/site-copy";
import styles from "./home-hero.module.css";

const serif = PT_Serif({
  weight: "700",
  style: ["normal", "italic"],
  subsets: ["cyrillic", "cyrillic-ext"],
  display: "swap",
  variable: "--hero-serif",
});

const milestones = [
  { value: anniversaryFacts.established, label: "Байгуулагдсан он" },
  { value: 80, label: "Жилийн түүх" },
  { value: 2016, label: "Шинэ байранд нүүсэн он" },
];

export function HomeHero({ copy, photo }: { copy: SiteCopy; photo: string }) {
  return (
    <section className={`${styles.hero} ${serif.variable}`} aria-labelledby="home-title">
      <div className={styles.photo} aria-hidden="true">
        <Image src={photo} alt="" fill sizes="100vw" unoptimized={unoptimizedPublicImage(photo)} />
      </div>
      <span className={styles.watermark} aria-hidden="true">80</span>
      <div className={styles.frame} aria-hidden="true" />
      <div className={styles.content}>
        <Image className={styles.seal} src="/school-logo.png" alt="" width={108} height={108} />
        <a href="#oin-ajil" className={styles.anniversary}>80 жилийн ой <ArrowDown size={16} aria-hidden="true" /></a>
        <h1 id="home-title" className={styles.title}>
          {copy.hero_line_1}
          <em>{copy.hero_line_2} {copy.hero_line_3}</em>
        </h1>
        {copy.hero_description && <p className={styles.lede}>{copy.hero_description}</p>}
        <div className={styles.actions}>
          <Link href="/about" className={styles.primary}>Манай ертөнцөөр аялаарай <ArrowUpRight size={18} aria-hidden="true" /></Link>
          <Link href="/apply" className={styles.secondary}>Элсэлт <ArrowRight size={18} aria-hidden="true" /></Link>
        </div>
        <dl className={styles.milestones}>
          {milestones.map(({ value, label }) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <a href="#discover" className={styles.scroll}>Цааш нээх <ArrowDown size={16} aria-hidden="true" /></a>
    </section>
  );
}
