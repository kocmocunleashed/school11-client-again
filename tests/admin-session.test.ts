import { afterEach, describe, expect, test } from "bun:test";
import { createSessionCookieValue, sameOrigin, verifySessionCookie } from "@/lib/admin-server";

const originalSecret = process.env.ADMIN_SESSION_SECRET;
const originalVersion = process.env.ADMIN_SESSION_VERSION;

afterEach(() => {
  process.env.ADMIN_SESSION_SECRET = originalSecret;
  process.env.ADMIN_SESSION_VERSION = originalVersion;
});

describe("admin session", () => {
  test("creates and verifies a signed session", async () => {
    process.env.ADMIN_SESSION_SECRET = "test-secret-that-is-longer-than-thirty-two-characters";
    process.env.ADMIN_SESSION_VERSION = "1";
    const value = await createSessionCookieValue();
    expect(await verifySessionCookie(value)).toBe(true);
    expect(await verifySessionCookie(`${value}tampered`)).toBe(false);
  });

  test("session version revokes older sessions", async () => {
    process.env.ADMIN_SESSION_SECRET = "test-secret-that-is-longer-than-thirty-two-characters";
    process.env.ADMIN_SESSION_VERSION = "1";
    const value = await createSessionCookieValue();
    process.env.ADMIN_SESSION_VERSION = "2";
    expect(await verifySessionCookie(value)).toBe(false);
  });

  test("requires same origin on mutations", () => {
    expect(sameOrigin(new Request("https://school.example/api/admin/login", { headers: { origin: "https://school.example" } }))).toBe(true);
    expect(sameOrigin(new Request("https://school.example/api/admin/login", { headers: { origin: "https://evil.example" } }))).toBe(false);
  });
});
