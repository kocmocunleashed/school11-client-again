import { beforeEach, describe, expect, test } from "bun:test";
import {
  createMockAdminDatabase,
  createMockAdminRequest,
  getPublishedMockNews,
  readStoredMockAdminDatabase,
  type MockStorage,
} from "../src/lib/admin/mock-database";
import type { AdminData } from "../src/lib/admin/contracts";

function memoryStorage(): MockStorage {
  const values = new Map<string, string>();
  return {
    getItem: key => values.get(key) ?? null,
    removeItem: key => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  };
}

describe("mock admin database", () => {
  let request: ReturnType<typeof createMockAdminRequest>;

  beforeEach(() => {
    request = createMockAdminRequest(memoryStorage());
  });

  test("starts with realistic seeded content", async () => {
    const data = await request<AdminData>("/api/admin/bootstrap");

    expect(data.news.length).toBeGreaterThan(1);
    expect(data.teachers.length).toBeGreaterThan(1);
    expect(data.applications.length).toBeGreaterThan(1);
  });

  test("saves, updates, and deletes records locally", async () => {
    const created = await request<{ id: string; status: string }>("/api/admin/save/applications", {
      method: "POST",
      body: JSON.stringify({ code: "DEMO1100", student_name: "Demo Student", status: "pending", academic_year: "2026-2027" }),
    });
    expect(created.id).toStartWith("mock-applications-");

    await request("/api/admin/save/applications", {
      method: "POST",
      body: JSON.stringify({ ...created, status: "accepted" }),
    });
    let data = await request<AdminData>("/api/admin/bootstrap");
    expect(data.applications.find((item: { id: string }) => item.id === created.id)?.status).toBe("accepted");

    await request(`/api/admin/delete/applications/${created.id}`, { method: "DELETE" });
    data = await request<AdminData>("/api/admin/bootstrap");
    expect(data.applications.some((item: { id: string }) => item.id === created.id)).toBe(false);
  });

  test("can reset local changes to the seed database", async () => {
    await request("/api/admin/delete/news/mock-news-1", { method: "DELETE" });
    await request.reset();

    const data = await request<AdminData>("/api/admin/bootstrap");
    expect(data.news.some((item: { id: string }) => item.id === "mock-news-1")).toBe(true);
  });

  test("database factory returns a fresh copy", () => {
    const first = createMockAdminDatabase();
    const second = createMockAdminDatabase();
    first.news.pop();

    expect(second.news.length).toBeGreaterThan(first.news.length);
  });

  test("exposes published mock news for the alternative frontend", async () => {
    const storage = memoryStorage();
    const localRequest = createMockAdminRequest(storage);
    const draft = await localRequest<{ id: string }>("/api/admin/save/news", {
      method: "POST",
      body: JSON.stringify({
        title_mn: "Frontend preview article",
        category_id: "fallback-category-event",
        author_name: "Demo editor",
        is_published: false,
        is_featured: false,
        tags: [],
        published_at: "2026-09-02T08:00:00.000Z",
      }),
    });

    let stored = readStoredMockAdminDatabase(storage);
    expect(stored).not.toBeNull();
    expect(getPublishedMockNews(stored!).some(item => item.id === draft.id)).toBe(false);

    await localRequest(`/api/admin/toggle-news/${draft.id}`, {
      method: "POST",
      body: JSON.stringify({ is_published: true }),
    });
    stored = readStoredMockAdminDatabase(storage);

    expect(getPublishedMockNews(stored!)[0]?.title_mn).toBe("Frontend preview article");
  });
});
