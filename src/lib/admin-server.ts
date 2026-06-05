import { clearRateLimit, consumeRateLimit, getClientIp, loginRateLimit, type RateLimitBucket } from "./api-handlers/rate-limit";
import { noStoreHeaders } from "./api-handlers/http";

const COOKIE_NAME = "school11_admin";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const encoder = new TextEncoder();

const allowedBuckets = new Set(["news-images", "teacher-photos", "achievement-images", "documents", "site-assets"]);
const bucketRules = {
  "news-images": { prefixes: new Set(["news"]), mimeTypes: new Set(["image/jpeg", "image/png", "image/webp"]), extensions: new Set(["jpg", "jpeg", "png", "webp"]), maxSize: 5 * 1024 * 1024 },
  "teacher-photos": { prefixes: new Set(["teachers"]), mimeTypes: new Set(["image/jpeg", "image/png", "image/webp"]), extensions: new Set(["jpg", "jpeg", "png", "webp"]), maxSize: 5 * 1024 * 1024 },
  "achievement-images": { prefixes: new Set(["years", "achievements"]), mimeTypes: new Set(["image/jpeg", "image/png", "image/webp"]), extensions: new Set(["jpg", "jpeg", "png", "webp"]), maxSize: 5 * 1024 * 1024 },
  "documents": { prefixes: new Set(["documents"]), mimeTypes: new Set(["application/pdf"]), extensions: new Set(["pdf"]), maxSize: 10 * 1024 * 1024 },
  "site-assets": { prefixes: new Set(["hero"]), mimeTypes: new Set(["image/jpeg", "image/png", "image/webp"]), extensions: new Set(["jpg", "jpeg", "png", "webp"]), maxSize: 5 * 1024 * 1024 },
} as const;
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
type SessionPayload = { iat: number; exp: number; nonce: string };

const noIndexHeaders = { "X-Robots-Tag": "noindex, nofollow" };
const loginRateLimits = new Map<string, RateLimitBucket>();
const writableFields: Record<Resource, Set<string>> = {
  news: new Set(["title_mn", "title_en", "excerpt_mn", "excerpt_en", "body_mn", "body_en", "cover_image_url", "category_id", "author_name", "author_role", "author_photo", "read_time_min", "is_published", "is_featured", "tags", "published_at"]),
  teachers: new Set(["name_mn", "name_en", "subject_mn", "subject_en", "years_exp", "bio_mn", "bio_en", "photo_url", "is_featured", "display_order", "is_active"]),
  years: new Set(["year", "highlight_mn", "highlight_en", "description_mn", "description_en", "image_url", "is_milestone"]),
  achievements: new Set(["year_id", "category_id", "title_mn", "title_en", "description_mn", "description_en", "image_url", "is_published", "display_order"]),
  courseItems: new Set(["section_id", "title_mn", "title_en", "short_desc_mn", "short_desc_en", "full_desc_mn", "full_desc_en", "teacher_name", "schedule_mn", "location_mn", "max_students", "current_students", "tags", "is_active", "display_order"]),
  applications: new Set(["code", "student_name", "status", "message_mn", "academic_year", "grade_applying", "notes"]),
  settings: new Set(["school_name_mn", "school_name_en", "established", "student_count", "teacher_count", "club_count", "address_mn", "city", "phone", "email", "facebook_url", "instagram_url", "youtube_url", "twitter_url", "hero_image_url", "application_guide_url"]),
};
const applicationStatuses = new Set(["accepted", "pending", "waitlisted", "rejected", "incomplete"]);
const imageFields: Partial<Record<Resource, string[]>> = {
  news: ["cover_image_url", "author_photo"],
  teachers: ["photo_url"],
  years: ["image_url"],
  achievements: ["image_url"],
  settings: ["hero_image_url"],
};

function normalizePassword(value: unknown) {
  return String(value ?? "").trim();
}

async function getAdminClient() {
  const { adminClient } = await import("./supabase/admin");
  return adminClient;
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

function base64UrlEncode(input: string | Uint8Array) {
  const buffer = typeof input === "string" ? Buffer.from(input, "utf8") : Buffer.from(input);
  return buffer.toString("base64").replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string) {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return Buffer.from(padded, "base64").toString("utf8");
}

function timingSafeEqualBytes(left: Uint8Array, right: Uint8Array) {
  if (left.byteLength !== right.byteLength) return false;

  let diff = 0;
  for (let i = 0; i < left.byteLength; i++) {
    diff |= left[i]! ^ right[i]!;
  }
  return diff === 0;
}

async function digestString(value: string) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
}

async function timingSafeEqual(a: string, b: string) {
  return timingSafeEqualBytes(await digestString(a), await digestString(b));
}

function getSessionSecret() {
  const secret = normalizePassword(process.env.ADMIN_SESSION_SECRET);
  if (secret.length < 32) {
    throw new Error("Missing ADMIN_SESSION_SECRET with at least 32 characters");
  }
  return secret;
}

async function signPayload(payload: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return base64UrlEncode(new Uint8Array(signature));
}

async function createSessionCookieValue() {
  const now = Math.floor(Date.now() / 1000);
  const session: SessionPayload = {
    iat: now,
    exp: now + SESSION_MAX_AGE_SECONDS,
    nonce: crypto.randomUUID(),
  };
  const payload = base64UrlEncode(JSON.stringify(session));
  return `${payload}.${await signPayload(payload)}`;
}

async function verifySessionCookie(value: string | undefined) {
  if (!value) return false;
  const [payload, signature, extra] = value.split(".");
  if (!payload || !signature || extra) return false;
  const expected = await signPayload(payload);
  if (!(await timingSafeEqual(signature, expected))) return false;

  let session: SessionPayload;
  try {
    session = JSON.parse(base64UrlDecode(payload)) as SessionPayload;
  } catch {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  return Number.isFinite(session.exp) && session.exp > now;
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

export async function isAdminRequest(req: Request) {
  try {
    return await verifySessionCookie(parseCookies(req)[COOKIE_NAME]);
  } catch (error) {
    console.error("Admin session verification failed:", error);
    return false;
  }
}

function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401, headers: { ...noStoreHeaders, ...noIndexHeaders } });
}

function forbidden() {
  return json({ error: "Forbidden" }, { status: 403 });
}

function json(data: unknown, init?: ResponseInit) {
  return Response.json(data, {
    ...init,
    headers: {
      ...noStoreHeaders,
      ...noIndexHeaders,
      ...(init?.headers || {}),
    },
  });
}

function sameOrigin(req: Request) {
  const requestUrl = new URL(req.url);
  const origin = req.headers.get("origin");
  if (origin) return origin === requestUrl.origin;

  const referer = req.headers.get("referer");
  if (!referer) return false;

  try {
    return new URL(referer).origin === requestUrl.origin;
  } catch {
    return false;
  }
}

export async function adminLogin(req: Request) {
  if (!sameOrigin(req)) return forbidden();

  const rateLimitKey = getClientIp(req);
  if (consumeRateLimit(loginRateLimits, rateLimitKey, loginRateLimit.maxAttempts, loginRateLimit.windowMs)) {
    return json({ error: "Too many attempts" }, { status: 429 });
  }

  let body: { password?: string };
  try {
    body = await req.json() as { password?: string };
  } catch {
    return json({ error: "Invalid JSON" }, { status: 400 });
  }

  const stored = normalizePassword(process.env.ADMIN_PASSWORD);
  const given = normalizePassword(body.password);

  if (!stored) {
    return json({ error: "Server misconfigured - ADMIN_PASSWORD not set" }, { status: 500 });
  }

  if (!(await timingSafeEqual(given, stored))) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  clearRateLimit(loginRateLimits, rateLimitKey);

  return json(
    { ok: true },
    {
      headers: {
        ...noIndexHeaders,
        "Set-Cookie": adminCookie(await createSessionCookieValue(), SESSION_MAX_AGE_SECONDS),
      },
    },
  );
}

export function adminLogout(req?: Request) {
  if (req && !sameOrigin(req)) return forbidden();

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

export async function adminMe(req: Request) {
  return json({ authenticated: await isAdminRequest(req) });
}

async function selectAll(table: string, order = "created_at") {
  const adminClient = await getAdminClient();
  let query = adminClient.from(table).select("*");
  if (order) query = query.order(order, { ascending: table === "achievement_years" ? false : true });
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function adminBootstrap(req: Request) {
  if (!(await isAdminRequest(req))) return unauthorized();
  const adminClient = await getAdminClient();

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
  if (!sameOrigin(req)) return forbidden();
  if (!(await isAdminRequest(req))) return unauthorized();
  if (!(resource in tableMap)) return json({ error: "Unknown resource" }, { status: 404 });
  const adminClient = await getAdminClient();

  const payload = await req.json() as Record<string, unknown>;
  const table = tableMap[resource as Resource];
  const id = payload.id;
  let record: Record<string, unknown>;
  try {
    record = sanitizeRecord(resource as Resource, payload);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Invalid payload" }, { status: 400 });
  }

  const query = id
    ? adminClient.from(table).update(record).eq("id", id).select("*").single()
    : adminClient.from(table).insert(record).select("*").single();
  const { data, error } = await query;
  if (error) return json({ error: error.message }, { status: 400 });
  return json({ data });
}

export async function adminDelete(req: Request, resource: string, id: string) {
  if (!sameOrigin(req)) return forbidden();
  if (!(await isAdminRequest(req))) return unauthorized();
  if (!(resource in tableMap)) return json({ error: "Unknown resource" }, { status: 404 });
  const adminClient = await getAdminClient();

  const table = tableMap[resource as Resource];
  const { error } = await adminClient.from(table).delete().eq("id", id);
  if (error) return json({ error: error.message }, { status: 400 });
  return json({ ok: true });
}

export async function toggleNews(req: Request, id: string) {
  if (!sameOrigin(req)) return forbidden();
  if (!(await isAdminRequest(req))) return unauthorized();
  const adminClient = await getAdminClient();
  const { is_published } = await req.json() as { is_published: boolean };
  const { data, error } = await adminClient.from("news").update({ is_published }).eq("id", id).select("*").single();
  if (error) return json({ error: error.message }, { status: 400 });
  return json({ data });
}

export async function adminUpload(req: Request, bucket: string) {
  if (!sameOrigin(req)) return forbidden();
  if (!(await isAdminRequest(req))) return unauthorized();
  if (!allowedBuckets.has(bucket)) return json({ error: "Unknown bucket" }, { status: 404 });
  const adminClient = await getAdminClient();

  const form = await req.formData();
  const file = form.get("file");
  const requestedPrefix = String(form.get("prefix") || "");
  if (!(file instanceof File)) return json({ error: "Missing file" }, { status: 400 });

  const uploadFile = file as File;
  const rules = bucketRules[bucket as keyof typeof bucketRules];
  const prefix = rules.prefixes.has(requestedPrefix as never) ? requestedPrefix : Array.from(rules.prefixes)[0];
  const ext = (uploadFile.name.split(".").pop() || "").toLowerCase();
  const mimeType = uploadFile.type.toLowerCase();
  if (uploadFile.size > rules.maxSize) return json({ error: "File too large" }, { status: 400 });
  if (!rules.extensions.has(ext as never) || !rules.mimeTypes.has(mimeType as never)) {
    return json({ error: "Unsupported file type" }, { status: 400 });
  }

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
  if (!sameOrigin(req)) return forbidden();
  if (!(await isAdminRequest(req))) return unauthorized();
  const adminClient = await getAdminClient();
  const { rows } = await req.json() as { rows?: Record<string, unknown>[] };
  if (!rows?.length) return json({ error: "No rows" }, { status: 400 });

  const cleaned = rows.map(row => ({
    code: String(row.code || "").trim().toUpperCase(),
    student_name: row.student_name ? String(row.student_name) : null,
    status: String(row.status || "pending"),
    message_mn: row.message_mn ? String(row.message_mn) : null,
    academic_year: String(row.academic_year || "2024-2025"),
    grade_applying: row.grade_applying ? Number(row.grade_applying) : null,
  })).filter(row => row.code.length === 8 && applicationStatuses.has(row.status));
  if (!cleaned.length) return json({ error: "No valid rows" }, { status: 400 });

  const { data, error } = await adminClient
    .from("application_results")
    .upsert(cleaned, { onConflict: "code" })
    .select("*");
  if (error) return json({ error: error.message }, { status: 400 });
  return json({ data });
}

function sanitizeRecord(resource: Resource, payload: Record<string, unknown>) {
  const allowed = writableFields[resource];
  const record: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(payload)) {
    if (allowed.has(key)) record[key] = value;
  }

  for (const field of imageFields[resource] || []) {
    if (field in record) {
      record[field] = sanitizeHttpsImageUrl(record[field], field);
    }
  }

  if (resource === "applications") {
    record.code = String(record.code || "").trim().toUpperCase();
    if (String(record.code).length !== 8) throw new Error("Application code must be 8 characters");
    if (!applicationStatuses.has(String(record.status || ""))) throw new Error("Invalid application status");
  }

  return record;
}

function sanitizeHttpsImageUrl(value: unknown, field: string) {
  if (value === null || value === undefined) return value;
  const text = String(value).trim();
  if (!text) return "";

  try {
    const url = new URL(text);
    if (url.protocol !== "https:") throw new Error("Invalid protocol");
    return url.toString();
  } catch {
    throw new Error(`${field} must be an HTTPS URL`);
  }
}
