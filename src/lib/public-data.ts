import type { AdminData } from "./admin/contracts";
import type { AchievementYear, CourseSection, HallRecord, NewsArticle, SchoolSettings, Teacher } from "@/types/database";
import { defaultSiteCopy } from "./site-copy";
import { fallbackSettings } from "./content";

export type PublicSiteData = {
  news: NewsArticle[]; teachers: Teacher[]; settings: SchoolSettings;
  achievements: AchievementYear[]; courses: CourseSection[]; hallOfFame: HallRecord[];
  preview: boolean;
};
export function publicSettings(settings: SchoolSettings | null): SchoolSettings {
  return { ...fallbackSettings, ...settings, site_copy: { ...defaultSiteCopy, ...settings?.site_copy } };
}
export function publishableData(data: PublicSiteData): PublicSiteData {
  return { ...data, settings: publicSettings(data.settings),
    news: data.news.filter(item => item.is_published).toSorted((a,b) => Number(b.is_featured) - Number(a.is_featured) || Date.parse(b.published_at) - Date.parse(a.published_at)),
    teachers: data.teachers.filter(item => item.is_active !== false).toSorted((a,b) => a.display_order - b.display_order),
    achievements: data.achievements.map(year => ({ ...year, achievements: (year.achievements || []).filter(item => item.is_published !== false).toSorted((a,b) => (a.display_order || 0) - (b.display_order || 0)) })),
    courses: data.courses.filter(section => section.is_active !== false).toSorted((a,b) => a.display_order - b.display_order).map(section => ({ ...section, items: (section.items || []).filter(item => item.is_active !== false).toSorted((a,b) => (a.display_order || 0) - (b.display_order || 0)) })),
    hallOfFame: data.hallOfFame.filter(item => item.is_published && item.name.trim()).toSorted((a,b) => a.display_order - b.display_order),
  };
}
/** Only public fields leave the browser-local demo CMS. Application records stay private. */
export function mockPublicData(data: AdminData): PublicSiteData {
  return publishableData({ preview: true, settings: publicSettings(data.settings), news: data.news, teachers: data.teachers,
    achievements: data.years.map(year => ({ ...year, achievements: data.achievements.filter(item => item.year_id === year.id).map(item => ({ ...item, category: data.achievementCategories.find(category => category.id === item.category_id) })) as unknown as NonNullable<AchievementYear["achievements"]> })),
    courses: data.sections.map(section => ({ ...section, items: data.courseItems.filter(item => item.section_id === section.id) })),
    hallOfFame: data.hallOfFame,
  });
}
