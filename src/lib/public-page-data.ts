import type { PublicSiteData } from "./public-data";
import type { SiteCopy } from "./site-copy";
import type { NewsArticle } from "@/types/database";
import { homeHallHighlights } from "./hall-highlights";

export const publicPages = ["home", "about", "courses", "achievements", "news", "apply"] as const;
export type PublicPage = typeof publicPages[number];
export type NewsSummary = Omit<NewsArticle, "body_mn" | "body_en">;
export type PublicPageData = Omit<PublicSiteData, "news"> & {
  page: PublicPage;
  news: NewsSummary[];
  courseCounts?: Record<string, number>;
};
export function isPublicPage(value: string): value is PublicPage {
  return (publicPages as readonly string[]).includes(value);
}
function without<T extends object, K extends keyof T>(record: T, ...keys: K[]): Omit<T, K> {
  const copy = { ...record };
  for (const key of keys) delete copy[key];
  return copy;
}
export function newsSummary(article: NewsArticle): NewsSummary {
  return without(article, "body_mn", "body_en");
}

/** Project the already-published, cached dataset without another database read. */
export function publicPageData(data: PublicSiteData, page: PublicPage): PublicPageData {
  const settings = without(data.settings, "site_copy");
  const copyKeys: (keyof SiteCopy)[] = page === "home"
    ? ["hero_line_1", "hero_line_2", "hero_line_3", "intro_title", "intro_description", "join_title"]
    : page === "about"
      ? ["about_title", "about_description", "principal_name", "principal_message", "story_title", "story_description", "vision", "mission"]
      : [];
  const copy = data.settings.site_copy;
  const scopedSettings = copy && copyKeys.length
    ? { ...settings, site_copy: Object.fromEntries(copyKeys.filter(key => typeof copy[key] === "string").map(key => [key, copy[key]])) }
    : settings;
  const projected: PublicPageData = {
    page, preview: data.preview,
    settings: scopedSettings,
    news: [], teachers: [], achievements: [], courses: [], hallOfFame: [],
  };
  switch (page) {
    case "home":
      projected.news = data.news.slice(0, 6).map(newsSummary);
      projected.courses = data.courses.map(section => without(section, "items"));
      projected.courseCounts = Object.fromEntries(data.courses.map(section => [section.id, section.items?.length || 0]));
      projected.hallOfFame = homeHallHighlights(data.hallOfFame);
      projected.landingTimeline = data.landingTimeline;
      projected.podcasts = data.podcasts;
      break;
    case "about":
      projected.teachers = data.teachers.filter(item => /захирал|менежер|нийгмийн ажилтан|эрхлэгч/i.test(item.subject_mn));
      projected.achievements = data.achievements.map(year => without(year, "achievements"));
      break;
    case "courses":
      projected.courses = data.courses;
      projected.events = data.events;
      break;
    case "achievements":
      projected.achievements = data.achievements;
      projected.hallOfFame = data.hallOfFame;
      break;
    case "news":
      projected.news = data.news.map(newsSummary);
      break;
  }
  return projected;
}
