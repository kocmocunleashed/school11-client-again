import type { LandingTimelineEntry } from "@/types/database";

// Independent demo content; never derive it from the achievements collection.
export const fallbackLandingTimeline: LandingTimelineEntry[] = [
  { id: "landing-1940", year: 1940, highlight_mn: "Үүсгэн байгуулагдсан", description_mn: "Нийслэлийн боловсролын салбарт математик, байгалийн ухааны чиглэлээр ялгарах сууриа тавьсан.", image_url: null, is_milestone: true, is_published: true, display_order: 0 },
  { id: "landing-1989", year: 1989, highlight_mn: "Гүнзгийрүүлсэн сургалт", description_mn: "Математик, физикийн сонгон сургалт тогтмолжиж, олимпиадын багш-сурагчийн систем бүрэлдсэн.", image_url: null, is_milestone: true, is_published: true, display_order: 1 },
  { id: "landing-2016", year: 2016, highlight_mn: "Шинэ хичээлийн байр", description_mn: "Орчин үеийн сургалтын орчинтой шинэ байр ашиглалтад орж, лаборатори, танхимын хүртээмж сайжирсан.", image_url: null, is_milestone: true, is_published: true, display_order: 2 },
  { id: "landing-2026", year: 2026, highlight_mn: "Олон улсын гараа", description_mn: "Сурагчдын судалгааны төслүүд олон улсын уралдаанд шалгарч, ахлах ангийн академик соёл улам бэхжив.", image_url: null, is_milestone: false, is_published: true, display_order: 3 },
];

export function landingTimelineResult(result: { data: unknown; error: { code?: string; message?: string } | null }) {
  if (result.error) {
    if (["42P01", "PGRST205"].includes(result.error.code || "") && result.error.message?.includes("landing_timeline_entries")) return { entries: [] as LandingTimelineEntry[], ready: false };
    throw result.error;
  }
  return { entries: (result.data || []) as LandingTimelineEntry[], ready: true };
}
