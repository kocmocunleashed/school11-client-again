import { describe, expect, test } from "bun:test";
import { normalizeApplicationCode, sanitizeAdminRecord, sanitizeHttpsUrl, validateToggleNewsPayload } from "@/lib/admin-validation";

describe("admin validation", () => {
  test("normalizes application codes", () => expect(normalizeApplicationCode(" sch11001 ")).toBe("SCH11001"));

  test("rejects unknown fields", () => {
    expect(() => sanitizeAdminRecord("applications", { code: "SCH11001", status: "pending", academic_year: "2026-2027", injected: true })).toThrow("Unknown field");
  });

  test("accepts valid application payload", () => {
    expect(sanitizeAdminRecord("applications", { code: "sch11001", status: "accepted", academic_year: "2026-2027" })).toEqual({ code: "SCH11001", academic_year: "2026-2027", status: "accepted" });
  });

  test("allows only HTTPS URLs", () => {
    expect(sanitizeHttpsUrl("https://example.com/image.webp", "image")).toBe("https://example.com/image.webp");
    expect(() => sanitizeHttpsUrl("http://example.com/image.webp", "image")).toThrow("HTTPS URL");
  });

  test("accepts only exact news toggle payload", () => {
    expect(validateToggleNewsPayload({ is_published: true })).toEqual({ is_published: true });
    expect(() => validateToggleNewsPayload({ is_published: true, id: "x" })).toThrow("Unknown field");
  });
});
