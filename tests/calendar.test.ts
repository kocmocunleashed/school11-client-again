import { expect, test } from "bun:test";
import { eventsOnDate, monthDays } from "../src/lib/calendar";
import { sanitizeAdminRecord } from "../src/lib/admin-validation";
import { createMockAdminRequest } from "../src/lib/admin/mock-database";
import { mockPublicData } from "../src/lib/public-data";
import type { AdminData } from "../src/lib/admin/contracts";
import type { CalendarEvent } from "../src/types/database";

const event = { title_mn: "Сорил", event_type: "exam", start_date: "2026-09-30", end_date: "2026-10-02", is_all_day: true, is_public: false, color: "#304ffe" };

test("calendar aligns Monday first and includes leap day", () => {
  const days = monthDays(2024, 1);
  expect(days.slice(0, 4)).toEqual([null, null, null, "2024-02-01"]);
  expect(days.filter(Boolean)).toHaveLength(29);
  expect(monthDays(2026, 11).filter(Boolean).at(-1)).toBe("2026-12-31");
});

test("multi-day events span month boundaries inclusively", () => {
  const events = [{ ...event, id: "test" }] as CalendarEvent[];
  expect(eventsOnDate(events, "2026-09-29")).toHaveLength(0);
  expect(eventsOnDate(events, "2026-09-30")).toHaveLength(1);
  expect(eventsOnDate(events, "2026-10-02")).toHaveLength(1);
  expect(eventsOnDate(events, "2026-10-03")).toHaveLength(0);
});

test("event validation rejects impossible dates and reversed dates or times", () => {
  expect(() => sanitizeAdminRecord("events", { ...event, start_date: "2026-02-30" })).toThrow();
  expect(() => sanitizeAdminRecord("events", { ...event, end_date: "2026-09-29" })).toThrow();
  expect(() => sanitizeAdminRecord("events", { ...event, end_date: null, is_all_day: false, start_time: "15:00", end_time: "14:00" })).toThrow();
  expect(() => sanitizeAdminRecord("events", { ...event, color: "url(https://example.com)" })).toThrow();
  expect(sanitizeAdminRecord("events", { ...event, start_time: "15:00" }).start_time).toBeNull();
});

test("CMS event create, publish, edit, delete persists and drafts stay private", async () => {
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) || null, setItem: (key: string, value: string) => { values.set(key, value); }, removeItem: (key: string) => { values.delete(key); } };
  const request = createMockAdminRequest(storage);
  const saved = await request<CalendarEvent>("/api/admin/save/events", { method: "POST", body: JSON.stringify(event) });
  const boot = () => request<AdminData>("/api/admin/bootstrap");
  expect((await boot()).events).toHaveLength(1);
  expect(mockPublicData(await boot()).events).toHaveLength(0);
  await request("/api/admin/save/events", { method: "POST", body: JSON.stringify({ ...saved, title_mn: "Шинэ сорил", is_public: true }) });
  const reloaded = await createMockAdminRequest(storage)<AdminData>("/api/admin/bootstrap");
  expect(mockPublicData(reloaded).events?.[0].title_mn).toBe("Шинэ сорил");
  await request(`/api/admin/delete/events/${saved.id}`, { method: "DELETE" });
  expect(mockPublicData(await boot()).events).toHaveLength(0);
});
