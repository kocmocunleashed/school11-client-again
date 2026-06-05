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
import { applicationLookupHandler } from "@/lib/api-handlers/application-lookup";
import { requireMethod } from "@/lib/api-handlers/http";
import { siteDataHandler } from "@/lib/api-handlers/site-data";

const server = serve({
  port: Number(process.env.PORT || 3000),
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/site-data": req => requireMethod(req, ["GET"], siteDataHandler),

    "/api/check-application": req => requireMethod(req, ["POST"], applicationLookupHandler, true),

    "/api/admin/login": req => requireMethod(req, ["POST"], adminLogin, true),

    "/api/admin/logout": req => requireMethod(req, ["POST"], adminLogout, true),

    "/api/admin/me": req => requireMethod(req, ["GET"], adminMe, true),

    "/api/admin/bootstrap": req => requireMethod(req, ["GET"], adminBootstrap, true),

    "/api/admin/save/:resource": req => requireMethod(req, ["POST"], () => adminSave(req, req.params.resource), true),

    "/api/admin/delete/:resource/:id": req => requireMethod(req, ["DELETE"], () => adminDelete(req, req.params.resource, req.params.id), true),

    "/api/admin/toggle-news/:id": req => requireMethod(req, ["POST"], () => toggleNews(req, req.params.id), true),

    "/api/admin/upload/:bucket": req => requireMethod(req, ["POST"], () => adminUpload(req, req.params.bucket), true),

    "/api/admin/bulk-applications": req => requireMethod(req, ["POST"], bulkApplications, true),

    "/admin": index,
    "/admin/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
