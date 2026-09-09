import type { Podcast } from "@/types/database";

/** Accept video links only; normalize away tracking and arbitrary redirects. */
export function youtubeVideoUrl(value: string): string | null {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || url.username || url.password || url.port) return null;
    let id: string | null = null;
    if (url.hostname === "youtu.be") id = url.pathname.slice(1);
    if (["youtube.com", "www.youtube.com", "m.youtube.com"].includes(url.hostname)) {
      if (url.pathname === "/watch") id = url.searchParams.get("v");
      else id = url.pathname.match(/^\/(?:shorts|live|embed)\/([\w-]{11})\/?$/)?.[1] || null;
    }
    return id && /^[\w-]{11}$/.test(id) ? `https://www.youtube.com/watch?v=${id}` : null;
  } catch { return null; }
}

export function podcastResult(result: { data: unknown; error: { code?: string; message?: string } | null }) {
  if (result.error) {
    if (["42P01", "PGRST205"].includes(result.error.code || "") && result.error.message?.includes("podcasts")) return { entries: [] as Podcast[], ready: false };
    throw result.error;
  }
  return { entries: (result.data || []) as Podcast[], ready: true };
}
