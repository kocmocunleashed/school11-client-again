import { expect, test } from "bun:test";
import { createMockAdminDatabase } from "../src/lib/admin/mock-database";
import { mockPublicData } from "../src/lib/public-data";
import { isPublicPage, publicPageData, publicPages } from "../src/lib/public-page-data";
import { homeHallHighlights } from "../src/lib/hall-highlights";

const data = mockPublicData(createMockAdminDatabase());

test("admissions sends settings without unrelated collections, article bodies or page copy", () => {
  const apply = publicPageData(data, "apply");
  expect(apply.settings.school_name_mn).toBe(data.settings.school_name_mn);
  expect(apply.settings.application_guide_url).toBe(data.settings.application_guide_url);
  expect(apply.settings).not.toHaveProperty("site_copy");
  for (const collection of [apply.news, apply.teachers, apply.courses, apply.achievements, apply.hallOfFame]) expect(collection).toEqual([]);
  expect(JSON.stringify(apply)).not.toContain(data.hallOfFame[0]!.name);
  expect(JSON.stringify(apply).length).toBeLessThan(JSON.stringify(data).length / 10);
});

test("news summaries preserve filters and attribution but never serialize article bodies", () => {
  const news = publicPageData(data, "news");
  expect(news.news.length).toBe(data.news.length);
  expect(news.news[0]!.category).toEqual(data.news[0]!.category);
  expect(news.news[0]!.tags).toEqual(data.news[0]!.tags);
  expect(news.news[0]!.author_name).toBe(data.news[0]!.author_name);
  for (const item of news.news) {
    expect(item).not.toHaveProperty("body_mn");
    expect(item).not.toHaveProperty("body_en");
  }
  expect(data.news[0]).toHaveProperty("body_mn");
});

test("homepage retains the same highlights, course counts and news previews", () => {
  const home = publicPageData(data, "home");
  expect(home.hallOfFame).toEqual(homeHallHighlights(data.hallOfFame));
  expect(home.hallOfFame.length).toBeLessThanOrEqual(12);
  expect(new Set(home.hallOfFame.map(item => item.name)).size).toBe(home.hallOfFame.length);
  expect(home.settings.site_copy?.hero_line_1).toBe(data.settings.site_copy?.hero_line_1);
  expect(home.settings.site_copy).not.toHaveProperty("principal_message");
  expect(home.news.map(item => item.id)).toEqual(data.news.slice(0, 6).map(item => item.id));
  expect(home.courses[0]).not.toHaveProperty("items");
  expect(home.courseCounts?.[data.courses[0]!.id]).toBe(data.courses[0]!.items!.length);
});

test("route projections retain the collections their interfaces use", () => {
  const about = publicPageData(data, "about");
  expect(about.achievements[0]).not.toHaveProperty("achievements");
  expect(about.achievements[0]!.description_mn).toBe(data.achievements[0]!.description_mn);
  expect(about.settings.site_copy?.principal_message).toBe(data.settings.site_copy?.principal_message);
  expect(about.settings.site_copy).not.toHaveProperty("hero_line_1");
  const courses = publicPageData(data, "courses");
  expect(courses.courses).toEqual(data.courses);
  expect(courses.events).toEqual(data.events);
  const achievements = publicPageData(data, "achievements");
  expect(achievements.achievements).toEqual(data.achievements);
  expect(achievements.hallOfFame).toEqual(data.hallOfFame);
  expect(achievements.news).toEqual([]);
});

test("only supported public pages are accepted and projections never leak applications", () => {
  for (const page of publicPages) {
    expect(isPublicPage(page)).toBe(true);
    const encoded = JSON.stringify(publicPageData(data, page));
    expect(encoded).not.toContain("SCH11001");
    expect(encoded).not.toContain("student_name");
  }
  expect(isPublicPage("admin")).toBe(false);
  expect(isPublicPage("__proto__")).toBe(false);
});
