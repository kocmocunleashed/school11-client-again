import type {
  AchievementCategory,
  AchievementYear,
  ApplicationResult,
  CourseItem,
  CourseSection,
  NewsArticle,
  NewsCategory,
  SchoolSettings,
  Teacher,
  HallRecord,
  CalendarEvent,
  LandingTimelineEntry,
} from "@/types/database";

export type AdminData = {
  landingTimeline: LandingTimelineEntry[];
  landingTimelineReady?: boolean;
  events: CalendarEvent[];
  news: NewsArticle[];
  categories: NewsCategory[];
  teachers: Teacher[];
  years: AchievementYear[];
  achievementCategories: AchievementCategory[];
  achievements: Array<Record<string, unknown>>;
  sections: CourseSection[];
  courseItems: CourseItem[];
  applications: ApplicationResult[];
  settings: SchoolSettings | null;
  hallOfFame: HallRecord[];
};

export type AdminRequest = <T = unknown>(path: string, init?: RequestInit) => Promise<T>;

export const emptyAdminData: AdminData = {
  landingTimeline: [],
  events: [],
  news: [],
  categories: [],
  teachers: [],
  years: [],
  achievementCategories: [],
  achievements: [],
  sections: [],
  courseItems: [],
  applications: [],
  settings: null,
  hallOfFame: [],
};
