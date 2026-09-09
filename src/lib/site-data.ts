import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { fallbackAchievements, fallbackCourses, fallbackNews, fallbackSettings, fallbackTeachers } from "./content";
import { hallSeed } from "./hall-seed";
import { hallDataResult } from "./hall-data-result";
import { env, hasSupabasePublicEnv } from "./env";
import { getAchievementYears } from "./data/achievements";
import { getCourseSections } from "./data/courses";
import { getPublishedNews } from "./data/news";
import { getSchoolSettings } from "./data/settings";
import { getAllTeachers } from "./data/teachers";
import { createClient } from "./supabase/server";
import { publishableData, type PublicSiteData } from "./public-data";
import { PUBLIC_CONTENT_CACHE_SECONDS, PUBLIC_CONTENT_CACHE_TAG } from "./public-cache";
import { hallPublicSelect } from "./data/public-selects";

class UncacheableSiteData extends Error {
  constructor(readonly data: PublicSiteData) {
    super("Optional Hall of Fame migration is pending");
  }
}

async function loadSiteData(): Promise<PublicSiteData> {
  const [news, teachers, settings, achievements, courses, hall, calendar] = await Promise.all([
    getPublishedNews(1000), getAllTeachers(), getSchoolSettings(), getAchievementYears(), getCourseSections(),
    createClient().from("hall_of_fame").select(hallPublicSelect).eq("is_published", true).order("display_order", { ascending: true }),
    createClient().from("calendar_events").select("id,title_mn,description_mn,event_type,start_date,end_date,start_time,end_time,location_mn,color,is_all_day,is_public").eq("is_public", true).order("start_date", { ascending: true }),
  ]);
  const hallOfFame = hallDataResult(hall);
  if (calendar.error) throw calendar.error;
  // Empty published collections are intentional. Never resurrect deleted/draft content as samples.
  const data = publishableData({ news, teachers, settings, achievements, courses, hallOfFame, events: calendar.data || [], preview: false });
  // Preserve the existing migration fallback, but do not persist partial data.
  // Other database errors throw above, so failures never become cache entries.
  if (hall.error) throw new UncacheableSiteData(data);
  return data;
}

// Keep the current rendering model. Opting the entire application into Cache
// Components would require unrelated routing and Suspense changes.
const getCachedSiteData = unstable_cache(loadSiteData, [PUBLIC_CONTENT_CACHE_TAG, env.supabaseUrl], {
  revalidate: PUBLIC_CONTENT_CACHE_SECONDS,
  tags: [PUBLIC_CONTENT_CACHE_TAG],
});

export const getSiteData = cache(async (): Promise<PublicSiteData> => {
  // Browser-local demo content must never enter the production data cache.
  if (!hasSupabasePublicEnv()) return publishableData({ news: fallbackNews, teachers: fallbackTeachers, settings: fallbackSettings, achievements: fallbackAchievements, courses: fallbackCourses, hallOfFame: hallSeed, preview: true });
  try {
    return await getCachedSiteData();
  } catch (error) {
    if (error instanceof UncacheableSiteData) return error.data;
    throw error;
  }
});
