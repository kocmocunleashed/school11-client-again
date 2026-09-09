import { expect, test } from "bun:test";
import { createMockAdminDatabase, createMockAdminRequest } from "../src/lib/admin/mock-database";
import { mockPublicData } from "../src/lib/public-data";
import { sanitizeAdminRecord } from "../src/lib/admin-validation";
import { landingTimelineResult } from "../src/lib/landing-timeline-data";
import type { AdminData } from "../src/lib/admin/contracts";
import { adminSave, adminDelete } from "../src/lib/admin-server";

test("landing edits and deletion never change achievements, and vice versa", async () => {
  const values = new Map<string, string>();
  const request = createMockAdminRequest({ getItem: key => values.get(key) || null, setItem: (key, value) => { values.set(key, value); }, removeItem: key => { values.delete(key); } });
  const boot = () => request<AdminData>("/api/admin/bootstrap");
  const before = await boot();
  const first = before.landingTimeline[0];
  await request("/api/admin/save/landingTimeline", { method: "POST", body: JSON.stringify({ ...first, highlight_mn: "Нүүр хуудасны өөрчлөлт" }) });
  let data = await boot();
  expect(data.years).toEqual(before.years);
  expect(data.achievements).toEqual(before.achievements);
  expect(mockPublicData(data).landingTimeline?.[0].highlight_mn).toBe("Нүүр хуудасны өөрчлөлт");
  await request("/api/admin/save/years", { method: "POST", body: JSON.stringify({ ...before.years[0], highlight_mn: "Амжилтын өөрчлөлт" }) });
  data = await boot();
  expect(data.landingTimeline[0].highlight_mn).toBe("Нүүр хуудасны өөрчлөлт");
  await request(`/api/admin/delete/landingTimeline/${first.id}`, { method: "DELETE" });
  expect((await boot()).years).toEqual(data.years);
  for (const item of (await boot()).landingTimeline) await request(`/api/admin/delete/landingTimeline/${item.id}`, { method: "DELETE" });
  expect(mockPublicData(await boot()).landingTimeline).toEqual([]);
  expect(mockPublicData(await boot()).achievements.length).toBeGreaterThan(0);
});

test("draft homepage entries stay private and cannot use achievements fields", () => {
  const data = createMockAdminDatabase();
  data.landingTimeline.forEach(item => { item.is_published = false; });
  expect(mockPublicData(data).landingTimeline).toEqual([]);
  expect(mockPublicData(data).achievements.length).toBeGreaterThan(0);
  expect(() => sanitizeAdminRecord("landingTimeline", { year: 2026, highlight_mn: "Түүх", year_id: "injected" })).toThrow("Unknown field");
  expect(() => sanitizeAdminRecord("landingTimeline", { year: 3000, highlight_mn: "Түүх" })).toThrow();
  expect(() => sanitizeAdminRecord("landingTimeline", { year: 2026, highlight_mn: "Түүх", image_url: "javascript:alert(1)" })).toThrow();
});

test("missing migration is explicit, but database failures are not hidden", () => {
  expect(landingTimelineResult({ data: null, error: { code: "PGRST205", message: "Missing public.landing_timeline_entries" } }).ready).toBe(false);
  expect(landingTimelineResult({ data: [], error: null })).toEqual({ entries: [], ready: true });
  expect(() => landingTimelineResult({ data: null, error: { code: "42501", message: "Permission denied" } })).toThrow();
});

test("homepage history requires authentication and same-origin writes", async () => {
  const base = "https://school.example";
  expect((await adminSave(new Request(`${base}/api/admin/save/landingTimeline`, { method: "POST", headers: { origin: base }, body: "{}" }), "landingTimeline")).status).toBe(401);
  expect((await adminSave(new Request(`${base}/api/admin/save/landingTimeline`, { method: "POST", headers: { origin: "https://other.example" }, body: "{}" }), "landingTimeline")).status).toBe(403);
  expect((await adminDelete(new Request(`${base}/api/admin/delete/landingTimeline/test`, { method: "DELETE", headers: { origin: base } }), "landingTimeline", "test")).status).toBe(401);
});

test("publication, image fields, and same-year ordering are validated independently", () => {
  const data = createMockAdminDatabase();
  const valid = { year: 2026, highlight_mn: "Шинэ түүх", description_mn: "Тайлбар", image_url: "https://example.com/photo.webp", is_published: true, is_milestone: false, display_order: 2 };
  expect(sanitizeAdminRecord("landingTimeline", valid)).toEqual(valid);
  expect(() => sanitizeAdminRecord("landingTimeline", { ...valid, highlight_mn: " " })).toThrow();
  expect(() => sanitizeAdminRecord("landingTimeline", { ...valid, is_published: "true" })).toThrow();
  expect(() => sanitizeAdminRecord("landingTimeline", { ...valid, display_order: -1 })).toThrow();
  data.landingTimeline = [{ ...valid, id: "second" }, { ...valid, id: "first", display_order: 1 }, { ...valid, id: "draft", display_order: 0, is_published: false }];
  expect(mockPublicData(data).landingTimeline?.map(item => item.id)).toEqual(["first", "second"]);
});
