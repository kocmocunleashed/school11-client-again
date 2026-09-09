import { expect, test } from "bun:test";
import { youtubeVideoUrl, podcastResult } from "../src/lib/podcast-data";
import { sanitizeAdminRecord } from "../src/lib/admin-validation";
import { createMockAdminRequest } from "../src/lib/admin/mock-database";
import { mockPublicData } from "../src/lib/public-data";
import { adminSave, adminDelete } from "../src/lib/admin-server";
import { isPublicContentResource } from "../src/lib/public-cache";
import type { AdminData } from "../src/lib/admin/contracts";
import type { Podcast } from "../src/types/database";

const episode = { title_mn: "Сурагчдын ярилцлага", channel_name: "11-р сургууль", youtube_url: "https://www.youtube.com/watch?v=abcdefghijk", thumbnail_url: "https://example.com/cover.webp", channel_logo_url: null, is_published: false, display_order: 1 };

test("only YouTube video links are accepted and canonicalized", () => {
  for (const url of ["https://youtu.be/abcdefghijk?si=tracking", "https://m.youtube.com/watch?v=abcdefghijk&t=20", "https://youtube.com/shorts/abcdefghijk", "https://www.youtube.com/live/abcdefghijk"]) expect(youtubeVideoUrl(url)).toBe(episode.youtube_url);
  for (const url of ["javascript:alert(1)", "http://youtu.be/abcdefghijk", "https://youtube.com.evil.com/watch?v=abcdefghijk", "https://youtube.com/redirect?q=evil", "https://youtube.com/@channel", "https://evil@youtube.com/watch?v=abcdefghijk", "https://youtu.be/short"]) expect(youtubeVideoUrl(url)).toBeNull();
});

test("podcast CMS validates required fields, links, images, ordering and flags", () => {
  expect(sanitizeAdminRecord("podcasts", episode)).toEqual(episode);
  for (const patch of [{ title_mn: " " }, { channel_name: "" }, { youtube_url: "https://example.com" }, { thumbnail_url: "javascript:alert(1)" }, { channel_logo_url: "http://example.com/logo" }, { display_order: -1 }, { is_published: "true" }, { year: 2026 }]) expect(() => sanitizeAdminRecord("podcasts", { ...episode, ...patch })).toThrow();
});

test("podcast create, publish, edit, reorder, unpublish and delete are independent", async () => {
  const values = new Map<string, string>();
  const request = createMockAdminRequest({ getItem: key => values.get(key) || null, setItem: (key, value) => { values.set(key, value); }, removeItem: key => { values.delete(key); } });
  const boot = () => request<AdminData>("/api/admin/bootstrap");
  const save = (record: object) => request<Podcast>("/api/admin/save/podcasts", { method: "POST", body: JSON.stringify(record) });
  const before = await boot();
  const first = await save(episode);
  expect(mockPublicData(await boot()).podcasts).toEqual([]);
  await save({ ...first, is_published: true, title_mn: "Зассан гарчиг" });
  const second = await save({ ...episode, is_published: true, display_order: 0 });
  expect(mockPublicData(await boot()).podcasts?.map(item => item.id)).toEqual([second.id, first.id]);
  expect(mockPublicData(await boot()).podcasts?.[1].title_mn).toBe("Зассан гарчиг");
  await save({ ...second, is_published: false });
  expect(mockPublicData(await boot()).podcasts).toHaveLength(1);
  for (const item of (await boot()).podcasts) await request(`/api/admin/delete/podcasts/${item.id}`, { method: "DELETE" });
  const after = await boot();
  expect(mockPublicData(after).podcasts).toEqual([]);
  expect(after.landingTimeline).toEqual(before.landingTimeline);
  expect(after.achievements).toEqual(before.achievements);
  expect(after.news).toEqual(before.news);
});

test("missing migration is handled without masking other failures", () => {
  expect(podcastResult({ data: null, error: { code: "PGRST205", message: "Missing public.podcasts" } })).toEqual({ entries: [], ready: false });
  expect(podcastResult({ data: [], error: null })).toEqual({ entries: [], ready: true });
  expect(() => podcastResult({ data: null, error: { code: "42501", message: "Permission denied" } })).toThrow();
});

test("podcast writes require authentication, same origin and invalidate public cache", async () => {
  const base = "https://school.example";
  expect((await adminSave(new Request(`${base}/api/admin/save/podcasts`, { method: "POST", headers: { origin: base }, body: "{}" }), "podcasts")).status).toBe(401);
  expect((await adminSave(new Request(`${base}/api/admin/save/podcasts`, { method: "POST", headers: { origin: "https://other.example" }, body: "{}" }), "podcasts")).status).toBe(403);
  expect((await adminDelete(new Request(`${base}/api/admin/delete/podcasts/test`, { method: "DELETE", headers: { origin: base } }), "podcasts", "test")).status).toBe(401);
  expect(isPublicContentResource("podcasts")).toBe(true);
});
