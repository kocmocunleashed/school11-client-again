import { hallSeed } from "../hall-seed";
import { fallbackAchievements, fallbackCourses, fallbackNews, fallbackSettings, fallbackTeachers } from "../content";
import type { AdminData, AdminRequest } from "./contracts";

export const MOCK_ADMIN_STORAGE_KEY = "school11-redesign:mock-admin:v1";
export const MOCK_ADMIN_CHANGE_EVENT = "school11-redesign:mock-admin-change";
const COLLECTIONS = {
  hallOfFame: "hallOfFame",
  sections: "sections",
  news: "news",
  teachers: "teachers",
  years: "years",
  achievements: "achievements",
  courseItems: "courseItems",
  applications: "applications",
} as const;

type CollectionResource = keyof typeof COLLECTIONS;

export type MockStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export type MockAdminRequest = AdminRequest & { reset: () => Promise<void> };

const achievementCategories = [
  { id: "mock-achievement-category-academic", name_mn: "Сурлагын амжилт", name_en: "Academic", icon: "award", description_mn: "Олимпиад, уралдаан, судалгааны амжилт" },
  { id: "mock-achievement-category-sport", name_mn: "Спорт", name_en: "Sport", icon: "medal", description_mn: "Биеийн тамир, багийн тэмцээний амжилт" },
  { id: "mock-achievement-category-art", name_mn: "Урлаг", name_en: "Arts", icon: "music", description_mn: "Урлаг, уран бүтээлийн амжилт" },
];

const applications = [
  { id: "mock-application-1", code: "SCH11001", student_name: "Б. Анужин", status: "accepted", message_mn: "Баяр хүргэе. Таны бүртгэл баталгаажлаа.", academic_year: "2026-2027", grade_applying: 6 },
  { id: "mock-application-2", code: "SCH11002", student_name: "Г. Тэмүүлэн", status: "pending", message_mn: "Материал шалгах шатанд байна.", academic_year: "2026-2027", grade_applying: 6 },
  { id: "mock-application-3", code: "SCH11003", student_name: "Н. Мишээл", status: "waitlisted", message_mn: "Нэмэлт сонгон шалгаруулалтын мэдээлэл хүлээнэ үү.", academic_year: "2026-2027", grade_applying: 10 },
  { id: "mock-application-4", code: "SCH11004", student_name: "Ц. Билгүүн", status: "rejected", message_mn: "Энэ удаагийн элсэлт баталгаажсангүй.", academic_year: "2025-2026", grade_applying: 6 },
] as AdminData["applications"];

function clone<T>(value: T): T {
  return structuredClone(value);
}

export function createMockAdminDatabase(): AdminData {
  const categories = Array.from(
    new Map(fallbackNews.flatMap(item => item.category ? [[item.category.id, item.category] as const] : [])).values(),
  );
  const years = fallbackAchievements.map(year => ({ ...year, achievements: undefined }));
  const achievements = [
    { id: "mock-achievement-1", year_id: "fallback-year-2026", category_id: "mock-achievement-category-academic", category: achievementCategories[0], title_mn: "Улсын математикийн олимпиадын I байр", description_mn: "Ахлах ангийн баг улсын олимпиадаас алтан медаль хүртэв.", image_url: null, is_published: true, display_order: 1 },
    { id: "mock-achievement-2", year_id: "fallback-year-2026", category_id: "mock-achievement-category-sport", category: achievementCategories[1], title_mn: "Нийслэлийн сагсан бөмбөгийн мөнгөн медаль", description_mn: "Сургуулийн шигшээ баг дүүрэг, нийслэлийн шатанд амжилттай оролцов.", image_url: null, is_published: true, display_order: 2 },
    { id: "mock-achievement-3", year_id: "fallback-year-2016", category_id: "mock-achievement-category-art", category: achievementCategories[2], title_mn: "Сурагчдын найрал дууны тэргүүн байр", description_mn: "Хотын хүүхдийн урлагийн наадамд тэргүүлэв.", image_url: null, is_published: true, display_order: 1 },
  ];
  const sections = fallbackCourses.map(section => ({ ...section, items: undefined }));
  const courseItems = fallbackCourses.flatMap(section => section.items || []);

  return clone({
    news: fallbackNews.map((item, index) => ({ ...item, id: `mock-news-${index + 1}` })),
    hallOfFame: hallSeed,
    categories,
    teachers: fallbackTeachers.map((item, index) => ({ ...item, id: `mock-teacher-${index + 1}` })),
    years,
    achievementCategories,
    achievements,
    sections,
    courseItems,
    applications,
    settings: { ...fallbackSettings, id: "mock-settings" },
  });
}

function storageFor(explicit?: MockStorage): MockStorage {
  if (explicit) return explicit;
  if (typeof window === "undefined") throw new Error("Mock admin storage is available only in the browser");
  return window.localStorage;
}

function readDatabase(storage: MockStorage): AdminData {
  const stored = storage.getItem(MOCK_ADMIN_STORAGE_KEY);
  if (!stored) {
    const seeded = createMockAdminDatabase();
    writeDatabase(storage, seeded);
    return seeded;
  }

  try {
    return { ...createMockAdminDatabase(), ...JSON.parse(stored) } as AdminData;
  } catch {
    const seeded = createMockAdminDatabase();
    writeDatabase(storage, seeded);
    return seeded;
  }
}

function announceDatabaseChange(storage: MockStorage) {
  if (typeof window !== "undefined" && storage === window.localStorage) {
    window.dispatchEvent(new Event(MOCK_ADMIN_CHANGE_EVENT));
  }
}

function writeDatabase(storage: MockStorage, data: AdminData) {
  storage.setItem(MOCK_ADMIN_STORAGE_KEY, JSON.stringify(data));
  announceDatabaseChange(storage);
}

export function readStoredMockAdminDatabase(explicitStorage?: MockStorage): AdminData | null {
  const storage = storageFor(explicitStorage);
  const stored = storage.getItem(MOCK_ADMIN_STORAGE_KEY);
  if (!stored) return null;

  try {
    return { ...createMockAdminDatabase(), ...JSON.parse(stored) } as AdminData;
  } catch {
    return null;
  }
}

export function getPublishedMockNews(data: AdminData) {
  return data.news
    .filter(item => item.is_published)
    .toSorted((first, second) => Date.parse(second.published_at) - Date.parse(first.published_at));
}

function bodyAsRecord(init?: RequestInit) {
  if (typeof init?.body !== "string") return {} as Record<string, unknown>;
  return JSON.parse(init.body) as Record<string, unknown>;
}

function idFor(resource: string) {
  const suffix = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `mock-${resource}-${suffix}`;
}

function attachRelations(data: AdminData, resource: string, record: Record<string, unknown>) {
  if (resource === "news") {
    record.category = data.categories.find(category => category.id === record.category_id) || null;
  }
  if (resource === "achievements") {
    record.category = data.achievementCategories.find(category => category.id === record.category_id) || null;
  }
  return record;
}

async function fileAsDataUrl(file: File) {
  if (file.size > 1_500_000) throw new Error("Demo uploads are limited to 1.5 MB");
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return `data:${file.type || "application/octet-stream"};base64,${btoa(binary)}`;
}

export function createMockAdminRequest(explicitStorage?: MockStorage): MockAdminRequest {
  const request = (async (path: string, init?: RequestInit) => {
    const storage = storageFor(explicitStorage);
    const pathname = new URL(path, "http://school11.local").pathname;

    if (pathname === "/api/admin/me") return { authenticated: true, mode: "mock" };
    if (pathname === "/api/admin/logout") return { ok: true };
    if (pathname === "/api/admin/bootstrap") return clone(readDatabase(storage));

    const saveMatch = pathname.match(/^\/api\/admin\/save\/([^/]+)$/);
    if (saveMatch) {
      const resource = saveMatch[1]!;
      const data = readDatabase(storage);
      const incoming = bodyAsRecord(init);

      if (resource === "settings") {
        data.settings = { ...(data.settings || createMockAdminDatabase().settings!), ...incoming } as AdminData["settings"];
        writeDatabase(storage, data);
        return clone(data.settings);
      }
      if (!(resource in COLLECTIONS)) throw new Error(`Unsupported demo resource: ${resource}`);

      const key = COLLECTIONS[resource as CollectionResource];
      const collection = data[key] as unknown as Array<Record<string, unknown>>;
      const defaults = resource === "hallOfFame" ? { is_published: false, is_featured: false, display_order: 0, source_url: null, photo: null } : {};
      const record = attachRelations(data, resource, { ...defaults, ...incoming, id: typeof incoming.id === "string" ? incoming.id : idFor(resource) });
      const index = collection.findIndex(item => item.id === record.id);
      if (index >= 0) collection[index] = { ...collection[index], ...record };
      else collection.unshift(record);
      writeDatabase(storage, data);
      return clone(record);
    }

    const deleteMatch = pathname.match(/^\/api\/admin\/delete\/([^/]+)\/([^/]+)$/);
    if (deleteMatch) {
      const [, resource, id] = deleteMatch;
      if (!resource || !(resource in COLLECTIONS)) throw new Error(`Unsupported demo resource: ${resource}`);
      const data = readDatabase(storage);
      const key = COLLECTIONS[resource as CollectionResource];
      const collection = data[key] as unknown as Array<Record<string, unknown>>;
      const index = collection.findIndex(item => item.id === id);
      if (index >= 0) collection.splice(index, 1);
      writeDatabase(storage, data);
      return { ok: true };
    }

    const toggleMatch = pathname.match(/^\/api\/admin\/toggle-news\/([^/]+)$/);
    if (toggleMatch) {
      const data = readDatabase(storage);
      const item = data.news.find(record => record.id === toggleMatch[1]);
      if (!item) throw new Error("Demo news item not found");
      item.is_published = Boolean(bodyAsRecord(init).is_published);
      writeDatabase(storage, data);
      return clone(item);
    }

    if (pathname === "/api/admin/bulk-applications") {
      const data = readDatabase(storage);
      const rows = bodyAsRecord(init).rows;
      if (!Array.isArray(rows)) throw new Error("Demo import requires CSV rows");
      const created = rows.map(row => ({
        ...(row as Record<string, unknown>),
        id: idFor("applications"),
        code: String((row as Record<string, unknown>).code || "").trim().toUpperCase(),
      }));
      data.applications.unshift(...created as AdminData["applications"]);
      writeDatabase(storage, data);
      return { imported: created.length };
    }

    if (/^\/api\/admin\/upload\/[^/]+$/.test(pathname)) {
      if (!(init?.body instanceof FormData)) throw new Error("Demo upload requires a file");
      const file = init.body.get("file");
      if (!(file instanceof File)) throw new Error("Choose a file to preview");
      return { publicUrl: await fileAsDataUrl(file) };
    }

    throw new Error(`Unsupported demo request: ${pathname}`);
  }) as MockAdminRequest;

  request.reset = async () => {
    const storage = storageFor(explicitStorage);
    storage.removeItem(MOCK_ADMIN_STORAGE_KEY);
    readDatabase(storage);
  };

  return request;
}
