import { json } from "./http";

export async function siteDataHandler() {
  try {
    const [
      { getPublishedNews },
      { getAllTeachers },
      { getSchoolSettings },
      { getAchievementYears },
      { getCourseSections },
    ] = await Promise.all([
      import("../data/news"),
      import("../data/teachers"),
      import("../data/settings"),
      import("../data/achievements"),
      import("../data/courses"),
    ]);

    const [news, teachers, settings, achievements, courses] = await Promise.all([
      getPublishedNews(6),
      getAllTeachers(),
      getSchoolSettings(),
      getAchievementYears(),
      getCourseSections(),
    ]);

    return json({ news, teachers, settings, achievements, courses });
  } catch (error) {
    console.error("Site data fetch failed:", error);
    return json({ news: [], teachers: [], settings: null, achievements: [], courses: [] });
  }
}
