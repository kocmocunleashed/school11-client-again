export default async function handler(request: Request) {
  if (request.method !== "GET") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const [
      { getPublishedNews },
      { getAllTeachers },
      { getSchoolSettings },
      { getAchievementYears },
      { getCourseSections },
    ] = await Promise.all([
      import("../src/lib/data/news"),
      import("../src/lib/data/teachers"),
      import("../src/lib/data/settings"),
      import("../src/lib/data/achievements"),
      import("../src/lib/data/courses"),
    ]);

    const [news, teachers, settings, achievements, courses] = await Promise.all([
      getPublishedNews(6),
      getAllTeachers(),
      getSchoolSettings(),
      getAchievementYears(),
      getCourseSections(),
    ]);

    return Response.json({ news, teachers, settings, achievements, courses });
  } catch (error) {
    console.error("Site data fetch failed:", error);
    return Response.json({ news: [], teachers: [], settings: null, achievements: [], courses: [] });
  }
}
