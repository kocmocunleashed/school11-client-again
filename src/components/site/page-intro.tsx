import { ArrowRight, BookOpen, GraduationCap, Megaphone, School, Trophy } from "lucide-react";
import Link from "next/link";

const symbols = { about: School, courses: BookOpen, achievements: Trophy, news: Megaphone, apply: GraduationCap };

export function PageIntro({ page, eyebrow, title, description }: {
  page: keyof typeof symbols;
  eyebrow: string;
  title: string;
  description: string;
}) {
  const Symbol = symbols[page];
  return <header className="page-intro">
    <nav aria-label="Хуудасны зам"><Link href="/">Нүүр</Link><ArrowRight size={13} aria-hidden="true" /><span aria-current="page">{eyebrow}</span></nav>
    <h1>{title}</h1><p className="intro-description">{description}</p>
  <div className="chapter-symbol" aria-hidden="true"><Symbol /></div>
  </header>;
}
