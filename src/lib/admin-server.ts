import { clearSharedRateLimit, consumeSharedRateLimit, getClientIp, loginRateLimit, makeRateLimitKey, type RateLimitBucket } from "./api-handlers/rate-limit";
import { noStoreHeaders } from "./api-handlers/http";
import { sanitizeAdminRecord, sanitizeBulkApplicationRows, validateToggleNewsPayload, type Resource } from "./admin-validation";

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
const tableMap: Record<Resource, string> = {
  news: "news",
  teachers: "teachers",
  years: "achievement_years",
  achievements: "achievements",
  courseItems: "course_items",
  applications: "application_results",
  settings: "school_settings",
} as const;

type SessionPayload = { iat: number; exp: number; nonce: string; version: string };

const noIndexHeaders = { "X-Robots-Tag": "noindex, nofollow" };
const loginRateLimits = new Map<string, RateLimitBucket>();

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

function getAdminSessionVersion() {
  return normalizePassword(process.env.ADMIN_SESSION_VERSION) || "1";
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

export async function createSessionCookieValue() {
  const now = Math.floor(Date.now() / 1000);
  const session: SessionPayload = {
    iat: now,
    exp: now + SESSION_MAX_AGE_SECONDS,
    nonce: crypto.randomUUID(),
    version: getAdminSessionVersion(),
  };
  const payload = base64UrlEncode(JSON.stringify(session));
  return `${payload}.${await signPayload(payload)}`;
}

export async function verifySessionCookie(value: string | undefined) {
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
  return Number.isFinite(session.exp) && session.exp > now && session.version === getAdminSessionVersion();
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

export function sameOrigin(req: Request) {
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

async function hashIp(req: Request) {
  const ip = getClientIp(req);
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(`school11-audit:${ip}`)));
  return Array.from(digest).map(byte => byte.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

async function writeAuditLog(req: Request, action: string, resource: string, resourceId?: string | null, metadata?: Record<string, unknown>) {
  try {
    const adminClient = await getAdminClient();
    const userAgent = req.headers.get("user-agent");
    const { error } = await adminClient.from("admin_audit_logs").insert({
      action,
      resource,
      resource_id: resourceId || null,
      request_ip_hash: await hashIp(req),
      user_agent: userAgent ? userAgent.slice(0, 300) : null,
      metadata: metadata || null,
    });
    if (error) throw error;
  } catch (error) {
    console.error("Admin audit log write failed:", error);
  }
}

export async function adminLogin(req: Request) {
  if (!sameOrigin(req)) return forbidden();

  const rateLimitKey = await makeRateLimitKey("admin_login", getClientIp(req));
  if (await consumeSharedRateLimit(loginRateLimits, rateLimitKey, loginRateLimit)) {
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
    await writeAuditLog(req, "auth_failed", "admin_login", null, { reason: "bad_password" });
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  await clearSharedRateLimit(loginRateLimits, rateLimitKey);
  await writeAuditLog(req, "auth_success", "admin_login");

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

  let payload: Record<string, unknown>;
  try {
    payload = await req.json() as Record<string, unknown>;
  } catch {
    return json({ error: "Invalid JSON" }, { status: 400 });
  }
  const table = tableMap[resource as Resource];
  const id = payload.id;
  let record: Record<string, unknown>;
  try {
    record = sanitizeAdminRecord(resource as Resource, payload);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Invalid payload" }, { status: 400 });
  }

  const query = id
    ? adminClient.from(table).update(record).eq("id", id).select("*").single()
    : adminClient.from(table).insert(record).select("*").single();
  const { data, error } = await query;
  if (error) return json({ error: error.message }, { status: 400 });
  await writeAuditLog(req, id ? "save:update" : "save:create", resource, String((data as { id?: unknown } | null)?.id || id || ""), { fields: Object.keys(record) });
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
  await writeAuditLog(req, "delete", resource, id);
  return json({ ok: true });
}

export async function toggleNews(req: Request, id: string) {
  if (!sameOrigin(req)) return forbidden();
  if (!(await isAdminRequest(req))) return unauthorized();
  const adminClient = await getAdminClient();
  let body: { is_published: boolean };
  try {
    body = validateToggleNewsPayload(await req.json());
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Invalid payload" }, { status: 400 });
  }
  const { is_published } = body;
  const { data, error } = await adminClient.from("news").update({ is_published }).eq("id", id).select("*").single();
  if (error) return json({ error: error.message }, { status: 400 });
  await writeAuditLog(req, "toggle_news", "news", id, { is_published });
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
  await writeAuditLog(req, "upload", "storage", data.path, { bucket, content_type: uploadFile.type, size: uploadFile.size });
  return json({ path: data.path, publicUrl: publicData.publicUrl });
}

export async function bulkApplications(req: Request) {
  if (!sameOrigin(req)) return forbidden();
  if (!(await isAdminRequest(req))) return unauthorized();
  const adminClient = await getAdminClient();
  let cleaned: Record<string, unknown>[];
  try {
    const { rows } = await req.json() as { rows?: unknown };
    cleaned = sanitizeBulkApplicationRows(rows);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Invalid payload" }, { status: 400 });
  }

  const { data, error } = await adminClient
    .from("application_results")
    .upsert(cleaned, { onConflict: "code" })
    .select("*");
  if (error) return json({ error: error.message }, { status: 400 });
  await writeAuditLog(req, "bulk_import", "applications", null, { count: cleaned.length });
  return json({ data });
}
