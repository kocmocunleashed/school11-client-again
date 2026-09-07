"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="state-page"><p className="school-eyebrow">Алдаа гарлаа</p><h1>Хуудсыг нээж чадсангүй</h1><p>Сүлжээгээ шалгаад дахин оролдоно уу.</p><button className="primary-button" type="button" onClick={reset}>Дахин оролдох</button></main>;
}
