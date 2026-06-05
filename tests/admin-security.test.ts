import { describe, expect, test } from "bun:test";
import { createSessionCookieValue, sameOrigin, verifySessionCookie } from "../src/lib/admin-server";
import { applicationCodePattern, normalizeApplicationCode, sanitizeAdminRecord } from "../src/lib/admin-validation";
import { parseCsv } from "../src/lib/admin/csv";
import { consumeRateLimit, makeRateLimitKey, peekMemoryRateLimit, type RateLimitBucket } from "../src/lib/api-handlers/rate-limit";

const uuid = "123e4567-e89b-12d3-a456-426614174000";

function setSessionEnv(version = "1") {
  process.env.ADMIN_SESSION_SECRET = "0123456789abcdef0123456789abcdef";
  process.env.ADMIN_SESSION_VERSION = version;
}

function settingsPayload(overrides: Record<string, unknown> = {}) {
  return {
    school_name_mn: "Нийслэлийн 11-р сургууль",
    school_name_en: "11th School",
    established: 1940,
    student_count: 2000,
    teacher_count: 80,
    club_count: 40,
    address_mn: "Партизаны гудамж",
    city: "Улаанбаатар",
    phone: "+976 11 327226",
    email: "School_11@edub.edu.mn",
    ...overrides,
  };
}

describe("application code validation", () => {
  test("normalizes and validates uppercase alphanumeric codes", () => {
    expect(normalizeApplicationCode(" ab12cd34 ")).toBe("AB12CD34");
    expect(applicationCodePattern.test("AB12CD34")).toBe(true);
    expect(applicationCodePattern.test("AB12-CD3")).toBe(false);
  });
});

describe("admin same-origin checks", () => {
  test("accepts matching origin and rejects cross origin", () => {
    expect(sameOrigin(new Request("https://school.test/api/admin/login", { method: "POST", headers: { origin: "https://school.test" } }))).toBe(true);
    expect(sameOrigin(new Request("https://school.test/api/admin/login", { method: "POST", headers: { origin: "https://evil.test" } }))).toBe(false);
  });

  test("uses referer when origin is absent", () => {
    expect(sameOrigin(new Request("https://school.test/api/admin/logout", { method: "POST", headers: { referer: "https://school.test/admin" } }))).toBe(true);
    expect(sameOrigin(new Request("https://school.test/api/admin/logout", { method: "POST" }))).toBe(false);
  });
});

describe("signed admin sessions", () => {
  test("creates, verifies, rejects tampering, and honors session version", async () => {
    setSessionEnv("1");
    const cookie = await createSessionCookieValue();
    expect(await verifySessionCookie(cookie)).toBe(true);
    expect(await verifySessionCookie(`${cookie.slice(0, -1)}x`)).toBe(false);

    process.env.ADMIN_SESSION_VERSION = "2";
    expect(await verifySessionCookie(cookie)).toBe(false);
  });
});

describe("admin validation", () => {
  test("rejects non-HTTPS image URLs", () => {
    expect(() => sanitizeAdminRecord("news", {
      title_mn: "Title",
      category_id: uuid,
      author_name: "Admin",
      read_time_min: 3,
      is_published: true,
      is_featured: false,
      cover_image_url: "http://example.com/image.jpg",
    })).toThrow("cover_image_url must be an HTTPS URL");
  });

  test("rejects unsafe social and guide URLs", () => {
    expect(() => sanitizeAdminRecord("settings", settingsPayload({ facebook_url: "http://facebook.com/school" }))).toThrow("facebook_url must be an HTTPS URL");
    expect(() => sanitizeAdminRecord("settings", settingsPayload({ application_guide_url: "https://example.com/guide.docx" }))).toThrow("application_guide_url must be an HTTPS PDF URL");
  });

  test("accepts valid HTTPS PDF guide and rejects unknown fields", () => {
    const record = sanitizeAdminRecord("settings", settingsPayload({ application_guide_url: "https://example.com/guide.pdf" }));
    expect(record.application_guide_url).toBe("https://example.com/guide.pdf");
    expect(() => sanitizeAdminRecord("settings", settingsPayload({ leaked: "value" }))).toThrow("Unknown field");
  });
});

describe("CSV parsing", () => {
  test("handles quoted commas", () => {
    expect(parseCsv('code,student_name,message_mn\nABCD1234,"Doe, Jane","Accepted, bring documents"')).toEqual([
      { code: "ABCD1234", student_name: "Doe, Jane", message_mn: "Accepted, bring documents" },
    ]);
  });
});

describe("rate-limit helpers", () => {
  test("tracks count within a window and resets after expiry", () => {
    const store = new Map<string, RateLimitBucket>();
    expect(consumeRateLimit(store, "key", 2, 1000)).toBe(false);
    expect(consumeRateLimit(store, "key", 2, 1000)).toBe(false);
    expect(consumeRateLimit(store, "key", 2, 1000)).toBe(true);
    expect(peekMemoryRateLimit(store, "key").count).toBe(3);

    store.set("key", { count: 10, resetAt: Date.now() - 1 });
    expect(consumeRateLimit(store, "key", 2, 1000)).toBe(false);
    expect(peekMemoryRateLimit(store, "key").count).toBe(1);
  });

  test("hashes shared keys without exposing the raw identifier", async () => {
    const key = await makeRateLimitKey("admin_login", "203.0.113.10");
    expect(key.startsWith("admin_login:")).toBe(true);
    expect(key.includes("203.0.113.10")).toBe(false);
  });
});
