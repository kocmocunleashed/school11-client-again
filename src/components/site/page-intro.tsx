export function PageIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <header className="page-intro"><p>{eyebrow}</p><h1>{title}</h1><div className="intro-rule" aria-hidden="true" /><span>{description}</span></header>;
}
