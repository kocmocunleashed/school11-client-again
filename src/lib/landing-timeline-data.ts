import type { LandingTimelineEntry } from "@/types/database";

import anniversaryHistory from "./data/anniversary-history.json";

// Use the anniversary archive for preview history. Published history is still CMS-backed.
export const fallbackLandingTimeline: LandingTimelineEntry[] = anniversaryHistory.map((entry, index) => ({
  ...entry,
  id: `landing-${entry.year}`,
  image_url: entry.image_url ?? null,
  is_milestone: true,
  is_published: true,
  display_order: index,
}));

export function landingTimelineResult(result: { data: unknown; error: { code?: string; message?: string } | null }) {
  if (result.error) {
    if (["42P01", "PGRST205"].includes(result.error.code || "") && result.error.message?.includes("landing_timeline_entries")) return { entries: [] as LandingTimelineEntry[], ready: false };
    throw result.error;
  }
  return { entries: (result.data || []) as LandingTimelineEntry[], ready: true };
}
