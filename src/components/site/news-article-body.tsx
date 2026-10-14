"use client";
import { useEffect, useState } from "react";
import type { NewsSummary } from "@/lib/public-page-data";
import type { NewsArticle } from "@/types/database";

class ArticleLoadError extends Error {}

type ArticleState = { article?: NewsArticle; error?: string };

/** Keyed by the current summary so edits, closing, or switching abort stale reads. */
export function NewsArticleBody({ summary, preview }: { summary: NewsSummary; preview: boolean }) {
  const [result, setResult] = useState<{ source: NewsSummary; value: ArticleState } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const value = result?.source === summary ? result.value : null;
  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const local = preview ? await import("@/lib/admin/mock-public-data") : null;
        let article = local?.readMockPublicArticle(summary.id);
        // Undefined means no local CMS exists yet. Null means a stored record
        // was removed/unpublished and must not resurrect the server seed.
        if (article === undefined) {
          const response = await fetch(`/api/news/${encodeURIComponent(summary.id)}`, { cache: "no-store", signal: controller.signal });
          if (!response.ok) throw new ArticleLoadError(response.status === 404 ? "Мэдээ олдсонгүй." : "Мэдээг ачаалж чадсангүй. Дахин оролдоно уу.");
          article = await response.json() as NewsArticle;
        }
        if (!article) throw new ArticleLoadError("Мэдээ олдсонгүй.");
        if (!controller.signal.aborted) setResult({ source: summary, value: { article } });
      } catch (error) {
        if (!controller.signal.aborted) setResult({ source: summary, value: { error: error instanceof ArticleLoadError ? error.message : "Мэдээг ачаалж чадсангүй. Сүлжээгээ шалгаад дахин оролдоно уу." } });
      }
    };
    void load();
    return () => controller.abort();
  }, [summary, preview, attempt]);
  return <div className="article-body" aria-live="polite" aria-busy={!value}>
    {!value ? <p role="status">Мэдээг ачаалж байна…</p> : value.error ? <><p role="alert">{value.error}</p><button type="button" className="secondary-button" onClick={event => { event.currentTarget.closest('[role="dialog"]')?.querySelector<HTMLButtonElement>(".dialog-close")?.focus(); setResult(null); setAttempt(count => count + 1); }}>Дахин оролдох</button></> : <p>{value.article?.body_mn || summary.excerpt_mn}</p>}
  </div>;
}
