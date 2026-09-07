import { defaultSiteCopy } from "./site-copy";
export const applicationStatuses = ["accepted", "pending", "waitlisted", "rejected", "incomplete"] as const;
export type ApplicationStatus = typeof applicationStatuses[number];

export const writableFieldNames = {
  hallOfFame: ["name", "scope", "photo", "medals", "is_published", "is_featured", "display_order", "source_url"],
  sections: ["slug", "title_mn", "title_en", "description_mn", "description_en", "icon", "display_order", "is_active"],
  news: ["title_mn", "title_en", "excerpt_mn", "excerpt_en", "body_mn", "body_en", "cover_image_url", "category_id", "author_name", "author_role", "author_photo", "read_time_min", "is_published", "is_featured", "tags", "published_at"],
  teachers: ["name_mn", "name_en", "subject_mn", "subject_en", "years_exp", "bio_mn", "bio_en", "photo_url", "is_featured", "display_order", "is_active"],
  years: ["year", "highlight_mn", "highlight_en", "description_mn", "description_en", "image_url", "is_milestone"],
  achievements: ["year_id", "category_id", "title_mn", "title_en", "description_mn", "description_en", "image_url", "is_published", "display_order"],
  courseItems: ["section_id", "title_mn", "title_en", "short_desc_mn", "short_desc_en", "full_desc_mn", "full_desc_en", "teacher_name", "schedule_mn", "location_mn", "max_students", "current_students", "tags", "is_active", "display_order"],
  applications: ["code", "student_name", "status", "message_mn", "academic_year", "grade_applying", "notes"],
  settings: ["site_copy", "logo_url", "school_name_mn", "school_name_en", "established", "student_count", "teacher_count", "club_count", "address_mn", "city", "phone", "email", "facebook_url", "instagram_url", "youtube_url", "twitter_url", "hero_image_url", "application_guide_url"],
} as const;

export type Resource = keyof typeof writableFieldNames;

const writableFields = Object.fromEntries(
  Object.entries(writableFieldNames).map(([resource, fields]) => [resource, new Set(fields)]),
) as Record<Resource, Set<string>>;

const applicationStatusSet = new Set<string>(applicationStatuses);
const imageFields: Partial<Record<Resource, string[]>> = {
  news: ["cover_image_url", "author_photo"],
  teachers: ["photo_url"],
  years: ["image_url"],
  achievements: ["image_url"],
  settings: ["hero_image_url", "logo_url"],
  hallOfFame: ["photo", "source_url"],
};
const socialUrlFields = new Set(["facebook_url", "instagram_url", "youtube_url", "twitter_url"]);
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const applicationCodePattern = /^[A-Z0-9]{8}$/;

export function normalizeApplicationCode(value: unknown) {
  return String(value ?? "").trim().toUpperCase();
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function rejectUnknownFields(resource: Resource, payload: Record<string, unknown>) {
  const allowed = writableFields[resource];
  for (const key of Object.keys(payload)) {
    if (key !== "id" && !allowed.has(key)) {
      throw new Error(`Unknown field: ${key}`);
    }
  }
}

function requiredString(value: unknown, field: string, maxLength: number) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${field} is required`);
  if (value.length > maxLength) throw new Error(`${field} is too long`);
  return value.trim();
}

function optionalString(value: unknown, field: string, maxLength: number) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") throw new Error(`${field} must be a string`);
  if (value.length > maxLength) throw new Error(`${field} is too long`);
  return value.trim();
}

function optionalUuid(value: unknown, field: string, required = false) {
  if (value === undefined || value === null || value === "") {
    if (required) throw new Error(`${field} is required`);
    return value === undefined ? undefined : null;
  }
  if (typeof value !== "string" || !uuidPattern.test(value)) throw new Error(`${field} must be a valid id`);
  return value;
}

function integerInRange(value: unknown, field: string, min: number, max: number, required = false) {
  if (value === undefined || value === null || value === "") {
    if (required) throw new Error(`${field} is required`);
    return value === undefined ? undefined : null;
  }
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${field} must be an integer between ${min} and ${max}`);
  }
  return value;
}

function booleanValue(value: unknown, field: string) {
  if (value === undefined) return undefined;
  if (typeof value !== "boolean") throw new Error(`${field} must be a boolean`);
  return value;
}

function stringArray(value: unknown, field: string) {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.some(item => typeof item !== "string" || item.length > 80)) {
    throw new Error(`${field} must be an array of short strings`);
  }
  if (value.length > 20) throw new Error(`${field} has too many entries`);
  return value.map(item => item.trim()).filter(Boolean);
}

export function sanitizeHttpsUrl(value: unknown, field: string, options: { empty?: "null" | "empty"; mustEndWithPdf?: boolean } = {}) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") throw new Error(`${field} must be a URL string`);
  const text = value.trim();
  if (!text) return options.empty === "null" ? null : "";

  try {
    const url = new URL(text);
    if (url.protocol !== "https:") throw new Error("Invalid protocol");
    if (options.mustEndWithPdf && !url.pathname.toLowerCase().endsWith(".pdf")) {
      throw new Error("PDF required");
    }
    return url.toString();
  } catch {
    throw new Error(options.mustEndWithPdf ? `${field} must be an HTTPS PDF URL` : `${field} must be an HTTPS URL`);
  }
}

function validDateTime(value: unknown, field: string) {
  if (value === undefined || value === null || value === "") return value === undefined ? undefined : null;
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) throw new Error(`${field} must be a valid date`);
  return value;
}

function validEmail(value: unknown, field: string) {
  const text = requiredString(value, field, 254);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) throw new Error(`${field} must be a valid email`);
  return text;
}

function validPhone(value: unknown, field: string) {
  const text = requiredString(value, field, 32);
  if (!/^[+\d()\s-]{6,32}$/.test(text)) throw new Error(`${field} must be a valid phone number`);
  return text;
}

function setIfPresent(record: Record<string, unknown>, field: string, value: unknown) {
  if (value !== undefined) record[field] = value;
}

export function sanitizeAdminRecord(resource: Resource, payload: unknown) {
  if (!isObjectRecord(payload)) throw new Error("Payload must be an object");
  rejectUnknownFields(resource, payload);
  if ("id" in payload) optionalUuid(payload.id, "id", true);

  const record: Record<string, unknown> = {};
  const text = (field: string, max = 500) => setIfPresent(record, field, optionalString(payload[field], field, max));
  const reqText = (field: string, max = 500) => setIfPresent(record, field, requiredString(payload[field], field, max));
  const num = (field: string, min: number, max: number, required = false) => setIfPresent(record, field, integerInRange(payload[field], field, min, max, required));
  const bool = (field: string) => setIfPresent(record, field, booleanValue(payload[field], field));
  const uuid = (field: string, required = false) => setIfPresent(record, field, optionalUuid(payload[field], field, required));

  switch (resource) {
    case "hallOfFame":
      reqText("name", 160);
      if (payload.scope !== "international" && payload.scope !== "national") throw new Error("Invalid medalist scope");
      record.scope = payload.scope;
      if (!Array.isArray(payload.medals) || !payload.medals.length || payload.medals.length > 100) throw new Error("Provide between 1 and 100 medals");
      record.medals = payload.medals.map((medal: unknown) => {
        if (!isObjectRecord(medal) || Object.keys(medal).some(key => !["competition", "medal", "year"].includes(key))) throw new Error("Invalid medal fields");
        return { competition: requiredString(medal.competition, "competition", 200), medal: requiredString(medal.medal, "medal", 120), year: optionalString(medal.year, "year", 80) || "" };
      });
      bool("is_published"); bool("is_featured"); num("display_order", 0, 10000);
      break;
    case "sections":
      reqText("slug", 80); if (!/^[a-z0-9-]+$/.test(String(record.slug))) throw new Error("Invalid section slug");
      reqText("title_mn", 180); text("title_en", 180); text("description_mn", 1000); text("description_en", 1000); text("icon", 40); bool("is_active"); num("display_order", 0, 10000);
      break;
    case "news":
      reqText("title_mn", 180); text("title_en", 180); text("excerpt_mn", 500); text("excerpt_en", 500); text("body_mn", 12000); text("body_en", 12000);
      uuid("category_id", true); reqText("author_name", 120); text("author_role", 120); num("read_time_min", 1, 120); bool("is_published"); bool("is_featured");
      setIfPresent(record, "tags", stringArray(payload.tags, "tags")); setIfPresent(record, "published_at", validDateTime(payload.published_at, "published_at"));
      break;
    case "teachers":
      reqText("name_mn", 160); text("name_en", 160); reqText("subject_mn", 160); text("subject_en", 160); num("years_exp", 0, 80); text("bio_mn", 3000); text("bio_en", 3000);
      bool("is_featured"); bool("is_active"); num("display_order", 0, 10000);
      break;
    case "years":
      num("year", 1900, 2100, true); text("highlight_mn", 200); text("highlight_en", 200); text("description_mn", 3000); text("description_en", 3000); bool("is_milestone");
      break;
    case "achievements":
      uuid("year_id", true); uuid("category_id", true); reqText("title_mn", 220); text("title_en", 220); text("description_mn", 3000); text("description_en", 3000);
      bool("is_published"); num("display_order", 0, 10000);
      break;
    case "courseItems":
      uuid("section_id", true); reqText("title_mn", 180); text("title_en", 180); text("short_desc_mn", 500); text("short_desc_en", 500); text("full_desc_mn", 3000); text("full_desc_en", 3000);
      text("teacher_name", 160); text("schedule_mn", 200); text("location_mn", 200); num("max_students", 0, 10000); num("current_students", 0, 10000);
      setIfPresent(record, "tags", stringArray(payload.tags, "tags")); bool("is_active"); num("display_order", 0, 10000);
      break;
    case "applications": {
      const code = normalizeApplicationCode(payload.code);
      if (!applicationCodePattern.test(code)) throw new Error("Application code must be 8 uppercase alphanumeric characters");
      record.code = code;
      text("student_name", 200); text("message_mn", 1000); reqText("academic_year", 32); text("notes", 2000); num("grade_applying", 1, 12);
      const status = payload.status;
      if (typeof status !== "string" || !applicationStatusSet.has(status)) throw new Error("Invalid application status");
      record.status = status;
      break;
    }
    case "settings":
      reqText("school_name_mn", 180); reqText("school_name_en", 180); num("established", 1900, 2100, true); num("student_count", 0, 100000, true);
      num("teacher_count", 0, 10000, true); num("club_count", 0, 10000, true); reqText("address_mn", 300); reqText("city", 120);
      record.phone = validPhone(payload.phone, "phone"); record.email = validEmail(payload.email, "email");
      break;
  }

  for (const field of imageFields[resource] || []) {
    if (field in payload) record[field] = sanitizeHttpsUrl(payload[field], field);
  }

  if (resource === "settings") {
    if ("site_copy" in payload) {
      if (!isObjectRecord(payload.site_copy)) throw new Error("site_copy must be an object");
      const copy: Record<string, string> = {};
      for (const [key, value] of Object.entries(payload.site_copy)) {
        if (!Object.hasOwn(defaultSiteCopy, key)) throw new Error(`Unknown site copy field: ${key}`);
        copy[key] = key === "principal_name" || key === "principal_message"
          ? optionalString(value, key, key === "principal_name" ? 160 : 3000) || ""
          : requiredString(value, key, key.startsWith("hero_line") ? 80 : 3000);
      }
      record.site_copy = copy;
    }
    for (const field of socialUrlFields) {
      if (field in payload) record[field] = sanitizeHttpsUrl(payload[field], field, { empty: "null" });
    }
    if ("application_guide_url" in payload) {
      record.application_guide_url = sanitizeHttpsUrl(payload.application_guide_url, "application_guide_url", { empty: "null", mustEndWithPdf: true });
    }
  }

  return record;
}

export function sanitizeBulkApplicationRows(rows: unknown) {
  if (!Array.isArray(rows) || rows.length === 0) throw new Error("No rows");
  if (rows.length > 1000) throw new Error("Too many rows");
  return rows.map(row => {
    if (!isObjectRecord(row)) throw new Error("Each row must be an object");
    const normalized = {
      ...row,
      code: normalizeApplicationCode(row.code),
      status: row.status ? String(row.status).trim() : "pending",
      student_name: row.student_name ? String(row.student_name).trim() : null,
      message_mn: row.message_mn ? String(row.message_mn).trim() : null,
      academic_year: row.academic_year ? String(row.academic_year).trim() : "2024-2025",
      grade_applying: row.grade_applying ? Number(row.grade_applying) : null,
    };
    return sanitizeAdminRecord("applications", normalized);
  });
}

export function validateToggleNewsPayload(payload: unknown) {
  if (!isObjectRecord(payload)) throw new Error("Payload must be an object");
  const keys = Object.keys(payload);
  if (keys.length !== 1 || keys[0] !== "is_published") throw new Error("Unknown field");
  if (typeof payload.is_published !== "boolean") throw new Error("is_published must be a boolean");
  return { is_published: payload.is_published };
}
