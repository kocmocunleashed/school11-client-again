import "server-only";
import { cache } from "react";
import { fallbackAchievements, fallbackCourses, fallbackNews, fallbackSettings, fallbackTeachers } from "./content";
import { hallSeed } from "./hall-seed";
import { hallDataResult } from "./hall-data-result";
import { hasSupabasePublicEnv } from "./env";
import { getAchievementYears } from "./data/achievements";
import { getCourseSections } from "./data/courses";
import { getPublishedNews } from "./data/news";
import { getSchoolSettings } from "./data/settings";
import { getAllTeachers } from "./data/teachers";
import { createClient } from "./supabase/server";
import { publishableData, type PublicSiteData } from "./public-data";

export const getSiteData = cache(async (): Promise<PublicSiteData> => {
  if (!hasSupabasePublicEnv()) return publishableData({ news: fallbackNews, teachers: fallbackTeachers, settings: fallbackSettings, achievements: fallbackAchievements, courses: fallbackCourses, hallOfFame: hallSeed, preview: true });
  const [news, teachers, settings, achievements, courses, hall] = await Promise.all([
    getPublishedNews(1000), getAllTeachers(), getSchoolSettings(), getAchievementYears(), getCourseSections(),
    createClient().from("hall_of_fame").select("*").eq("is_published", true).order("display_order", { ascending: true }),
  ]);
  const hallOfFame = hallDataResult(hall);
  // Empty published collections are intentional. Never resurrect deleted/draft content as samples.
  return publishableData({ news, teachers, settings, achievements, courses, hallOfFame, preview: false });
});
