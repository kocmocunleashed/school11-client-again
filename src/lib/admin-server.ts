import { createHash } from "node:crypto";
import { adminClient } from "./supabase/admin";

const COOKIE_NAME = "school11_admin";
const allowedBuckets = new Set(["news-images", "teacher-photos", "achievement-images", "documents", "site-assets"]);
const tableMap = {
  news: "news",
  teachers: "teachers",
  years: "achievement_years",
  achievements: "achievements",
  courseItems: "course_items",
  applications: "application_results",
  settings: "school_settings",
} as const;

type Resource = keyof typeof tableMap;

const noIndexHeaders = { "X-Robots-Tag": "noindex, nofollow" };

function token() {
  const password = getAdminPassword();
  return createHash("sha256").update(password).digest("hex");
}

function normalizePassword(value: unknown) {
  return String(value ?? "").trim();
}

function getAdminPassword() {
  const password = normalizePassword(process.env.ADMIN_PASSWORD);
  if (!password) {
    throw new Error("ADMIN_PASSWORD is required");
  }
  return password;
}

function adminCookie(value: string, maxAge: number) {
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(value)}`,
    "HttpOnly",
    "SameSite=Lax",
    "Path=/",
    `Max-Age=${maxAge}`,
  ];

  if (process.env.NODE_ENV === "production") {
    parts.push("Secure");
  }

  return parts.join("; ");
}

function parseCookies(req: Request) {
  return Object.fromEntries(
    (req.headers.get("cookie") || "")
      .split(";")
      .map(part => part.trim())
      .filter(Boolean)
      .map(part => {
        const [name, ...value] = part.split("=");
        return [name, decodeURIComponent(value.join("="))];
      }),
  );
}

export function isAdminRequest(req: Request) {
  try {
    return parseCookies(req)[COOKIE_NAME] === token();
  } catch {
    return false;
  }
}

function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401, headers: noIndexHeaders });
}

function json(data: unknown, init?: ResponseInit) {
  return Response.json(data, {
    ...init,
    headers: {
      ...noIndexHeaders,
      ...(init?.headers || {}),
    },
  });
}

export async function adminLogin(req: Request) {
  console.log("ADMIN_PASSWORD set:", Boolean(process.env.ADMIN_PASSWORD));
  console.log("NODE_ENV:", process.env.NODE_ENV);

  let body: { password?: string };
  try {
    body = await req.json() as { password?: string };
  } catch {
    return json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  const stored = normalizePassword(process.env.ADMIN_PASSWORD);
  const given = normalizePassword(body.password);

  if (!stored) {
    console.error("Admin login failed: ADMIN_PASSWORD is not configured");
    return json({ ok: false, error: "Server misconfigured" }, { status: 500 });
  }

  if (given !== stored) {
    console.warn("Admin login rejected", {
      passwordProvided: Boolean(given),
      givenLength: given.length,
      storedLength: stored.length,
    });
    return json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  return json(
    { ok: true },
    {
      headers: {
        ...noIndexHeaders,
        "Set-Cookie": adminCookie(token(), 60 * 60 * 24 * 7),
      },
    },
  );
}

export function adminLogout() {
  return json(
    { ok: true },
    {
      headers: {
        ...noIndexHeaders,
        "Set-Cookie": adminCookie("", 0),
      },
    },
  );
}

export function adminMe(req: Request) {
  return json({ authenticated: isAdminRequest(req) });
}

async function selectAll(table: string, order = "created_at") {
  let query = adminClient.from(table).select("*");
  if (order) query = query.order(order, { ascending: table === "achievement_years" ? false : true });
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function adminBootstrap(req: Request) {
  if (!isAdminRequest(req)) return unauthorized();

  const [news, categories, teachers, years, achievementCategories, achievements, sections, courseItems, applications, settings] = await Promise.all([
    adminClient.from("news").select("*, category:news_categories(*)").order("published_at", { ascending: false }),
    selectAll("news_categories", "name_mn"),
    adminClient.from("teachers").select("*").order("display_order", { ascending: true }),
    adminClient.from("achievement_years").select("*").order("year", { ascending: false }),
    selectAll("achievement_categories", "display_order"),
    adminClient.from("achievements").select("*, category:achievement_categories(*)").order("display_order", { ascending: true }),
    adminClient.from("course_sections").select("*").order("display_order", { ascending: true }),
    adminClient.from("course_items").select("*").order("display_order", { ascending: true }),
    adminClient.from("application_results").select("*").order("applied_at", { ascending: false }),
    adminClient.from("school_settings").select("*").limit(1).single(),
  ]);

  const errors = [news.error, teachers.error, years.error, achievements.error, sections.error, courseItems.error, applications.error, settings.error].filter(Boolean);
  if (errors[0]) throw errors[0];

  return json({
    news: news.data || [],
    categories: categories || [],
    teachers: teachers.data || [],
    years: years.data || [],
    achievementCategories: achievementCategories || [],
    achievements: achievements.data || [],
    sections: sections.data || [],
    courseItems: courseItems.data || [],
    applications: applications.data || [],
    settings: settings.data || null,
  });
}

export async function adminSave(req: Request, resource: string) {
  if (!isAdminRequest(req)) return unauthorized();
  if (!(resource in tableMap)) return json({ error: "Unknown resource" }, { status: 404 });

  const payload = await req.json() as Record<string, unknown>;
  const table = tableMap[resource as Resource];
  const id = payload.id;
  const record = { ...payload };
  delete record.category;
  delete record.items;
  delete record.achievements;

  const query = id
    ? adminClient.from(table).update(record).eq("id", id).select("*").single()
    : adminClient.from(table).insert(record).select("*").single();
  const { data, error } = await query;
  if (error) return json({ error: error.message }, { status: 400 });
  return json({ data });
}

export async function adminDelete(req: Request, resource: string, id: string) {
  if (!isAdminRequest(req)) return unauthorized();
  if (!(resource in tableMap)) return json({ error: "Unknown resource" }, { status: 404 });

  const table = tableMap[resource as Resource];
  const { error } = await adminClient.from(table).delete().eq("id", id);
  if (error) return json({ error: error.message }, { status: 400 });
  return json({ ok: true });
}

export async function toggleNews(req: Request, id: string) {
  if (!isAdminRequest(req)) return unauthorized();
  const { is_published } = await req.json() as { is_published: boolean };
  const { data, error } = await adminClient.from("news").update({ is_published }).eq("id", id).select("*").single();
  if (error) return json({ error: error.message }, { status: 400 });
  return json({ data });
}

export async function adminUpload(req: Request, bucket: string) {
  if (!isAdminRequest(req)) return unauthorized();
  if (!allowedBuckets.has(bucket)) return json({ error: "Unknown bucket" }, { status: 404 });

  const form = await req.formData();
  const file = form.get("file");
  const prefix = String(form.get("prefix") || "uploads");
  if (!(file instanceof File)) return json({ error: "Missing file" }, { status: 400 });

  const uploadFile = file as File;
  const ext = uploadFile.name.split(".").pop() || "bin";
  const path = `${prefix}/${crypto.randomUUID()}.${ext}`;
  const { data, error } = await adminClient.storage.from(bucket).upload(path, uploadFile, {
    contentType: uploadFile.type || undefined,
    upsert: false,
  });
  if (error) return json({ error: error.message }, { status: 400 });

  const { data: publicData } = adminClient.storage.from(bucket).getPublicUrl(data.path);
  return json({ path: data.path, publicUrl: publicData.publicUrl });
}

export async function bulkApplications(req: Request) {
  if (!isAdminRequest(req)) return unauthorized();
  const { rows } = await req.json() as { rows?: Record<string, unknown>[] };
  if (!rows?.length) return json({ error: "No rows" }, { status: 400 });

  const cleaned = rows.map(row => ({
    code: String(row.code || "").trim().toUpperCase(),
    student_name: row.student_name ? String(row.student_name) : null,
    status: String(row.status || "pending"),
    message_mn: row.message_mn ? String(row.message_mn) : null,
    academic_year: String(row.academic_year || "2024-2025"),
    grade_applying: row.grade_applying ? Number(row.grade_applying) : null,
  })).filter(row => row.code.length === 8);

  const { data, error } = await adminClient
    .from("application_results")
    .upsert(cleaned, { onConflict: "code" })
    .select("*");
  if (error) return json({ error: error.message }, { status: 400 });
  return json({ data });
}
