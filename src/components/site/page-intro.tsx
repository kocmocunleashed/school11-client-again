import { BookOpen, GraduationCap, Megaphone, School, Trophy } from "lucide-react";

const symbols = { about: School, courses: BookOpen, achievements: Trophy, news: Megaphone, apply: GraduationCap };

export function PageIntro({ page, title, description }: {
  page: keyof typeof symbols;
  title: string;
  description?: string;
}) {
  const Symbol = symbols[page];
  return <header className="page-intro">
    <h1>{title}</h1>{description && <p className="intro-description">{description}</p>}
    <div className="chapter-symbol" aria-hidden="true"><Symbol /></div>
  </header>;
}
