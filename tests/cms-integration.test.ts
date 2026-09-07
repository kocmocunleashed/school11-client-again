import { describe, expect, test } from "bun:test";
import { createMockAdminDatabase, createMockAdminRequest } from "../src/lib/admin/mock-database";
import type { AdminData } from "../src/lib/admin/contracts";
import { mockPublicData, publishableData } from "../src/lib/public-data";
import { sanitizeAdminRecord } from "../src/lib/admin-validation";
import { adminSave, adminDelete } from "../src/lib/admin-server";

const medalist = { name: "Туршилтын сурагч", scope: "international", photo: "https://school.example/photo.jpg", medals: [{ competition: "IMO", medal: "Алт", year: "2024 он" }], is_published: false, is_featured: true, display_order: 0 };
function localCms() {
  const values = new Map<string, string>();
  return createMockAdminRequest({ getItem: key => values.get(key) || null, setItem: (key,value) => { values.set(key,value); }, removeItem: key => { values.delete(key); } });
}

describe("CMS to public content contract", () => {
  test("drafts and inactive nested content never reach public collections", () => {
    const data = createMockAdminDatabase();
    data.news.forEach(item => { item.is_published = false; });
    data.teachers.forEach(item => { item.is_active = false; });
    data.courseItems.forEach(item => { item.is_active = false; });
    data.achievements.forEach(item => { item.is_published = false; });
    data.hallOfFame.forEach(item => { item.is_published = false; });
    const publicData = mockPublicData(data);
    expect(publicData.news).toEqual([]); expect(publicData.teachers).toEqual([]); expect(publicData.hallOfFame).toEqual([]);
    expect(publicData.courses.every(section => !section.items?.length)).toBe(true);
    expect(publicData.achievements.every(year => !year.achievements?.length)).toBe(true);
  });
  test("inactive course sections disappear with their children", () => {
    const data = createMockAdminDatabase(); data.sections.forEach(section => { section.is_active = false; });
    expect(mockPublicData(data).courses).toEqual([]);
  });
  test("empty collections do not resurrect fallback samples", () => {
    const data = mockPublicData(createMockAdminDatabase());
    expect(publishableData({ ...data, preview: false, news: [], teachers: [], courses: [], achievements: [], hallOfFame: [] })).toMatchObject({ news: [], teachers: [], courses: [], achievements: [], hallOfFame: [], preview: false });
  });
  test("public payload excludes application codes, names, and private notes", () => {
    const data = createMockAdminDatabase(); data.applications[0].notes = "PRIVATE-NOTE";
    const publicData = JSON.stringify(mockPublicData(data));
    expect(publicData).not.toContain("SCH11001"); expect(publicData).not.toContain("PRIVATE-NOTE"); expect(publicData).not.toContain('"applications"');
  });
  test("hall create, publish, update and delete propagate through CMS projection", async () => {
    const cms = localCms();
    const saved = await cms<{ id: string }>("/api/admin/save/hallOfFame", { method: "POST", body: JSON.stringify(medalist) });
    const publicSnapshot = async () => mockPublicData(await cms<AdminData>("/api/admin/bootstrap"));
    expect((await publicSnapshot()).hallOfFame.some(item => item.id === saved.id)).toBe(false);
    await cms("/api/admin/save/hallOfFame", { method: "POST", body: JSON.stringify({ ...medalist, id: saved.id, is_published: true, name: "Шинэ нэр" }) });
    expect((await publicSnapshot()).hallOfFame.find(item => item.id === saved.id)?.name).toBe("Шинэ нэр");
    await cms(`/api/admin/delete/hallOfFame/${saved.id}`, { method: "DELETE" });
    expect((await publicSnapshot()).hallOfFame.some(item => item.id === saved.id)).toBe(false);
  });
  test("settings, homepage copy, hero and logo changes reach public projection", async () => {
    const cms = localCms();
    await cms("/api/admin/save/settings", { method: "POST", body: JSON.stringify({ school_name_mn: "Шинэ нэр", logo_url: "https://school.example/logo.png", hero_image_url: "https://school.example/hero.jpg", site_copy: { hero_line_1: "Шинэ эхлэл" } }) });
    const data = mockPublicData(await cms<AdminData>("/api/admin/bootstrap"));
    expect(data.settings.site_copy?.hero_line_1).toBe("Шинэ эхлэл"); expect(data.settings.logo_url).toEndWith("logo.png"); expect(data.settings.school_name_mn).toBe("Шинэ нэр");
    expect(data.settings.site_copy?.mission).toBeTruthy();
  });
  test("all five application statuses remain accepted by the server", () => {
    for (const status of ["accepted", "pending", "waitlisted", "rejected", "incomplete"]) expect(sanitizeAdminRecord("applications", { code: "CMS11001", status, academic_year: "2026-2027" }).status).toBe(status);
  });
});

describe("new CMS validation and auth", () => {
  test("accepts structured medal lists and validates photo URLs", () => {
    expect(sanitizeAdminRecord("hallOfFame", medalist).name).toBe(medalist.name);
    expect(() => sanitizeAdminRecord("hallOfFame", { ...medalist, photo: "javascript:alert(1)" })).toThrow();
    expect(() => sanitizeAdminRecord("hallOfFame", { ...medalist, medals: [] })).toThrow();
    expect(() => sanitizeAdminRecord("hallOfFame", { ...medalist, medals: [{ ...medalist.medals[0], private_notes: "no" }] })).toThrow();
    expect(() => sanitizeAdminRecord("hallOfFame", { ...medalist, scope: "invalid" })).toThrow();
  });
  test("page-copy fields cannot inject unknown settings", () => {
    const settings = createMockAdminDatabase().settings!;
    const { id, ...payload } = settings; void id;
    expect(sanitizeAdminRecord("settings", { ...payload, site_copy: { hero_line_1: "Шинэ эхлэл" } }).site_copy).toEqual({ hero_line_1: "Шинэ эхлэл" });
    expect(() => sanitizeAdminRecord("settings", { ...payload, site_copy: { secret: "bad" } })).toThrow();
  });
  test("course section slugs cannot escape the route fragment", () => {
    expect(() => sanitizeAdminRecord("sections", { title_mn: "Хөтөлбөр", slug: "javascript:bad" })).toThrow();
    expect(sanitizeAdminRecord("sections", { title_mn: "Хөтөлбөр", slug: "robotics", is_active: true }).slug).toBe("robotics");
  });
  test("new resources retain the original authentication boundary", async () => {
    const request = new Request("https://school.example/api/admin/save/hallOfFame", { method: "POST", headers: { origin: "https://school.example" }, body: JSON.stringify(medalist) });
    expect((await adminSave(request, "hallOfFame")).status).toBe(401);
    expect((await adminDelete(new Request("https://school.example/api/admin/delete/hallOfFame/x", { method: "DELETE", headers: { origin: "https://school.example" } }), "hallOfFame", "x")).status).toBe(401);
  });
});

test("principal message stays editable, optional, and reaches the public About content", () => {
  const data = createMockAdminDatabase();
  const site_copy = { principal_name: "Туршилтын нэр", principal_message: "Эхний мөр\nДараагийн мөр" };
  const record = sanitizeAdminRecord("settings", { ...data.settings, id: "123e4567-e89b-12d3-a456-426614174000", site_copy });
  expect(record.site_copy).toEqual(site_copy);
  data.settings = { ...data.settings!, site_copy };
  expect(mockPublicData(data).settings.site_copy?.principal_message).toBe(site_copy.principal_message);
  expect(sanitizeAdminRecord("settings", { ...data.settings, id: "123e4567-e89b-12d3-a456-426614174000", site_copy: { principal_name: "", principal_message: "" } }).site_copy).toEqual({ principal_name: "", principal_message: "" });
});
