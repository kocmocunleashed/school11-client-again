import { serve } from "bun";
import index from "./index.html";
import {
  adminBootstrap,
  adminDelete,
  adminLogin,
  adminLogout,
  adminMe,
  adminSave,
  adminUpload,
  bulkApplications,
  toggleNews,
} from "@/lib/admin-server";

const server = serve({
  port: Number(process.env.PORT || 3000),
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/site-data": {
      async GET() {
        try {
          const [
            { getPublishedNews },
            { getAllTeachers },
            { getSchoolSettings },
            { getAchievementYears },
            { getCourseSections },
          ] = await Promise.all([
            import("./lib/data/news"),
            import("./lib/data/teachers"),
            import("./lib/data/settings"),
            import("./lib/data/achievements"),
            import("./lib/data/courses"),
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
      },
    },

    "/api/check-application": {
      async POST(req) {
        try {
          const { code } = await req.json() as { code?: string };
          const { checkApplicationCode } = await import("./lib/data/applications");
          const result = await checkApplicationCode(code || "");

          if (!result) {
            return Response.json({ found: false }, { status: 404 });
          }

          return Response.json({
            found: true,
            status: result.status,
            message_mn: result.message_mn,
            student_name: result.student_name,
            academic_year: result.academic_year,
          });
        } catch (error) {
          console.error("Application check failed:", error);
          return Response.json({ found: false }, { status: 500 });
        }
      },
    },

    "/api/admin/login": {
      async POST(req) {
        return adminLogin(req);
      },
    },

    "/api/admin/logout": {
      async POST() {
        return adminLogout();
      },
    },

    "/api/admin/me": {
      async GET(req) {
        return adminMe(req);
      },
    },

    "/api/admin/bootstrap": {
      async GET(req) {
        return adminBootstrap(req);
      },
    },

    "/api/admin/save/:resource": {
      async POST(req) {
        return adminSave(req, req.params.resource);
      },
    },

    "/api/admin/delete/:resource/:id": {
      async DELETE(req) {
        return adminDelete(req, req.params.resource, req.params.id);
      },
    },

    "/api/admin/toggle-news/:id": {
      async POST(req) {
        return toggleNews(req, req.params.id);
      },
    },

    "/api/admin/upload/:bucket": {
      async POST(req) {
        return adminUpload(req, req.params.bucket);
      },
    },

    "/api/admin/bulk-applications": {
      async POST(req) {
        return bulkApplications(req);
      },
    },

    "/admin": index,
    "/admin/*": index,

    "/api/hello": {
      async GET(req) {
        return Response.json({
          message: "Hello, world!",
          method: "GET",
        });
      },
      async PUT(req) {
        return Response.json({
          message: "Hello, world!",
          method: "PUT",
        });
      },
    },

    "/api/hello/:name": async req => {
      const name = req.params.name;
      return Response.json({
        message: `Hello, ${name}!`,
      });
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
