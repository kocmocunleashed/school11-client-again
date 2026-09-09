// Production-mode integration test. All database/auth/storage traffic goes to
// this process's loopback fixture; no deployment or real Supabase writes occur.
import assert from "node:assert/strict";
import { createHmac, randomUUID } from "node:crypto";
import { createMockAdminDatabase } from "../src/lib/admin/mock-database";

const seed = createMockAdminDatabase();
type Row = Record<string, unknown>;
const tables: Record<string, Row[]> = {
  news: seed.news as unknown as Row[], teachers: seed.teachers as unknown as Row[],
  school_settings: [seed.settings as unknown as Row], achievement_years: seed.years as unknown as Row[],
  achievements: seed.achievements, course_sections: seed.sections as unknown as Row[],
  course_items: seed.courseItems as unknown as Row[], hall_of_fame: seed.hallOfFame as unknown as Row[],
  news_categories: seed.categories as unknown as Row[], achievement_categories: seed.achievementCategories as unknown as Row[],
  application_results: [], rate_limits: [], admin_audit_logs: [],
};
for (const row of tables.school_settings) row.id = randomUUID();
let publicReads = 0;
let failingTable = "";
let hallMissing = false;
let rejectWrites = false;
const uploads: Array<{ path: string; cacheControl: string | null }> = [];
const fixture = Bun.serve({ hostname: "127.0.0.1", port: 0, async fetch(request) {
  const url = new URL(request.url);
  if (url.pathname.startsWith("/storage/v1/object/")) {
    const form = await request.formData();
    uploads.push({ path: url.pathname, cacheControl: String(form.get("cacheControl")) });
    return Response.json({ Key: url.pathname.replace("/storage/v1/object/", ""), Id: randomUUID() });
  }
  if (url.pathname.includes("/rpc/check_rate_limit")) return Response.json({ limited: false });
  const table = url.pathname.split("/").at(-1)!;
  const rows = tables[table];
  if (!rows) return Response.json({ message: `Unknown test table ${table}` }, { status: 404 });
  const publicRequest = request.headers.get("apikey") === "test-public-key";
  if (request.method === "GET" && publicRequest) {
    publicReads++;
    if (table === failingTable) return Response.json({ code: "XX000", message: "Simulated database outage" }, { status: 500 });
    if (table === "hall_of_fame" && hallMissing) return Response.json({ code: "PGRST205", message: "hall_of_fame missing" }, { status: 404 });
  }
  const matches = (row: Row) => [...url.searchParams].every(([key, value]) => !value.startsWith("eq.") || key.includes(".") || String(row[key]) === value.slice(3));
  let result: Row[];
  if (request.method === "GET") {
    result = rows.filter(matches).map(row => ({ ...row }));
    if (table === "achievement_years") result = result.map(row => ({ ...row, achievements: tables.achievements.filter(item => item.year_id === row.id && (!publicRequest || item.is_published !== false)) }));
    if (table === "course_sections") result = result.map(row => ({ ...row, items: tables.course_items.filter(item => item.section_id === row.id && (!publicRequest || item.is_active !== false)) }));
  } else {
    if (rejectWrites && table === "news") return Response.json({ message: "Simulated write rejection" }, { status: 400 });
    if (request.method === "DELETE") {
      result = rows.filter(matches);
      tables[table] = rows.filter(row => !matches(row));
    } else {
      const body = await request.json() as Row;
      if (request.method === "PATCH") {
        result = rows.filter(matches);
        result.forEach(row => Object.assign(row, body));
      } else {
        result = [{ id: randomUUID(), ...body }];
        rows.push(...result);
      }
    }
  }
  if (url.searchParams.has("limit")) result = result.slice(0, Number(url.searchParams.get("limit")));
  if (request.headers.get("accept")?.includes("vnd.pgrst.object")) {
    if (!result[0]) return Response.json({ code: "PGRST116", message: "No row" }, { status: 406 });
    return Response.json(result[0]);
  }
  return Response.json(result);
} });

const reservation = Bun.serve({ hostname: "127.0.0.1", port: 0, fetch: () => new Response() });
const port = reservation.port!;
reservation.stop(true);
// Next normalizes local Route Handler URLs to localhost for origin checks.
const origin = `http://localhost:${port}`;
const secret = "local-cache-test-session-secret-00000000";
const payload = Buffer.from(JSON.stringify({ iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600, nonce: randomUUID(), version: "cache-test" })).toString("base64url");
const cookie = `school11_admin=${payload}.${createHmac("sha256", secret).update(payload).digest("base64url")}`;
const app = Bun.spawn(["node", "node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], {
  env: { ...process.env, NODE_ENV: "production", NEXT_PUBLIC_SUPABASE_URL: String(fixture.url).replace(/\/$/, ""),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "test-public-key", NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-public-key",
    SUPABASE_SECRET_KEY: "test-service-key", SUPABASE_SERVICE_ROLE_KEY: "test-service-key",
    ADMIN_SESSION_SECRET: secret, ADMIN_SESSION_VERSION: "cache-test", ADMIN_PASSWORD: "test-password", SITE_URL: origin },
  stdout: "pipe", stderr: "pipe",
});
const stdout = new Response(app.stdout).text();
const stderr = new Response(app.stderr).text();
let checks = 0;
async function request(path: string, init?: RequestInit) {
  return fetch(`${origin}${path}`, { ...init, headers: { origin, cookie, "Content-Type": "application/json", ...init?.headers } });
}
async function snapshot() {
  const response = await request("/api/site-data");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("cache-control") || "", /no-store/);
  return response.json();
}
async function save(resource: string, body: Row) {
  const response = await request(`/api/admin/save/${resource}`, { method: "POST", body: JSON.stringify(body) });
  const result = await response.json();
  assert.equal(response.status, 200, JSON.stringify(result));
  return result.data as Row;
}
function pass(message: string) { checks++; console.log(`PASS ${message}`); }

try {
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    try { if ((await request("/api/admin/me")).ok) { ready = true; break; } } catch { /* Starting. */ }
    await Bun.sleep(200);
  }
  assert.ok(ready, "Production server did not start; run bun run build first");
  await snapshot();
  assert.equal(publicReads, 6);
  for (let i = 0; i < 10; i++) await snapshot();
  assert.equal(publicReads, 6, "Repeated public refreshes should reuse the shared cache");
  // Next may compile the loader separately for RSC and Route Handlers. Each
  // bundle gets a stable entry; both must reuse it and share invalidation.
  const page = await request("/"); assert.equal(page.status, 200); await page.text();
  const warmedReads: number = publicReads;
  assert.ok(warmedReads <= 12, "At most one load per compiled server bundle");
  for (const path of ["/", "/about", "/news", "/courses", "/achievements", "/apply"]) {
    const response = await request(path); assert.equal(response.status, 200, path); await response.text();
  }
  assert.equal(publicReads, warmedReads, "All server-rendered pages should reuse cached public data");
  pass(`10 API refreshes and all six SSR pages reuse cached data (${warmedReads} total database queries)`);

  const categoryId = randomUUID();
  const news = { title_mn: "Cache test story", category_id: categoryId, author_name: "Test editor", is_published: true, is_featured: true, body_mn: "Complete article body", published_at: new Date().toISOString(), tags: [] };
  const created = await save("news", news);
  let current = await snapshot();
  assert.ok(current.news.some((row: Row) => row.id === created.id && row.body_mn === news.body_mn));
  await save("news", { ...news, id: created.id, title_mn: "Edited title" });
  assert.ok((await snapshot()).news.some((row: Row) => row.id === created.id && row.title_mn === "Edited title"));
  assert.ok((await (await request("/news")).text()).includes("Edited title"), "SSR must also show the edit immediately");
  assert.equal((await request(`/api/admin/toggle-news/${created.id}`, { method: "POST", body: JSON.stringify({ is_published: false }) })).status, 200);
  assert.ok(!(await snapshot()).news.some((row: Row) => row.id === created.id));
  assert.equal((await request(`/api/admin/toggle-news/${created.id}`, { method: "POST", body: JSON.stringify({ is_published: true }) })).status, 200);
  assert.ok((await snapshot()).news.some((row: Row) => row.id === created.id));
  assert.equal((await request(`/api/admin/delete/news/${created.id}`, { method: "DELETE" })).status, 200);
  assert.ok(!(await snapshot()).news.some((row: Row) => row.id === created.id));
  pass("news create/edit/unpublish/republish/delete are visible on the very next public request");

  const resources: Array<[string, Row]> = [
    ["teachers", { name_mn: "Cache teacher", subject_mn: "Math", is_active: true }],
    ["years", { year: 2026 }],
    ["achievements", { year_id: randomUUID(), category_id: categoryId, title_mn: "Cache achievement", is_published: true }],
    ["sections", { slug: "cache-section", title_mn: "Cache section", is_active: true }],
    ["courseItems", { section_id: randomUUID(), title_mn: "Cache course", is_active: true }],
    ["hallOfFame", { name: "Cache medalist", scope: "national", medals: [{ competition: "Math", medal: "Gold", year: "2026" }], is_published: true }],
    ["settings", { ...tables.school_settings[0], school_name_mn: "Cache test school" }],
  ];
  for (const [resource, body] of resources) {
    const before: number = publicReads;
    const row = await save(resource, body);
    current = await snapshot();
    assert.equal(publicReads, before + 6, `${resource} save must expire public data`);
    if (resource === "settings") assert.equal(current.settings.school_name_mn, "Cache test school");
    else {
      assert.equal((await request(`/api/admin/delete/${resource}/${row.id}`, { method: "DELETE" })).status, 200);
      await snapshot();
      assert.equal(publicReads, before + 12, `${resource} delete must expire public data`);
    }
  }
  pass("every public CMS resource invalidates on save/delete, including nested content and settings");

  let readsBefore = publicReads;
  const unauthorized = await fetch(`${origin}/api/admin/save/news`, { method: "POST", headers: { origin, "Content-Type": "application/json" }, body: JSON.stringify(news) });
  assert.equal(unauthorized.status, 401);
  rejectWrites = true;
  assert.equal((await request("/api/admin/save/news", { method: "POST", body: JSON.stringify(news) })).status, 400);
  rejectWrites = false;
  await snapshot(); assert.equal(publicReads, readsBefore);
  const application = await save("applications", { code: "CACHE001", status: "pending", academic_year: "2026-2027", notes: "private-test-note", student_name: "private-test-name" });
  const lookup = () => request("/api/check-application", { method: "POST", body: JSON.stringify({ code: "CACHE001" }) });
  let result = await lookup(); assert.match(result.headers.get("cache-control") || "", /no-store/);
  assert.equal((await result.json()).status, "pending");
  await save("applications", { ...application, status: "accepted" });
  result = await lookup(); assert.equal((await result.json()).status, "accepted");
  const json = JSON.stringify(await snapshot());
  assert.ok(!json.includes("CACHE001") && !json.includes("private-test-note") && !json.includes("private-test-name"));
  assert.equal(publicReads, readsBefore);
  pass("private results stay fresh and excluded; failed/private writes do not expire public data");

  // Clear the cache through a real authorized mutation, then simulate failure.
  const expire = () => save("news", { ...news, is_published: false });
  for (const table of ["news", "teachers", "school_settings", "achievement_years", "course_sections", "hall_of_fame"]) {
    await expire(); failingTable = table;
    const failure = await request("/api/site-data");
    assert.equal(failure.status, 503, table);
    assert.match(failure.headers.get("cache-control") || "", /no-store/);
    failingTable = "";
    await snapshot(); readsBefore = publicReads; await snapshot(); assert.equal(publicReads, readsBefore);
  }
  pass("failures in each of the six queries return uncached 503 and recover immediately");

  await expire(); hallMissing = true;
  assert.deepEqual((await snapshot()).hallOfFame, []);
  readsBefore = publicReads; hallMissing = false;
  assert.ok((await snapshot()).hallOfFame.length > 0);
  assert.equal(publicReads, readsBefore + 6);
  pass("missing optional migration remains available without caching its empty fallback");

  await expire(); tables.news = [];
  assert.deepEqual((await snapshot()).news, []);
  pass("intentional empty collections stay empty");

  for (const [bucket, file, prefix] of [
    ["news-images", new File(["image-fixture"], "photo.webp", { type: "image/webp" }), "news"],
    ["documents", new File(["%PDF-1.7\nfixture"], "guide.pdf", { type: "application/pdf" }), "documents"],
  ] as const) {
    for (let i = 0; i < 2; i++) {
      const form = new FormData(); form.set("file", file); form.set("prefix", prefix);
      const response = await fetch(`${origin}/api/admin/upload/${bucket}`, { method: "POST", headers: { origin, cookie }, body: form });
      assert.equal(response.status, 200, await response.text());
    }
  }
  assert.equal(uploads[0].cacheControl, "31536000"); assert.equal(uploads[2].cacheControl, "3600");
  assert.notEqual(uploads[0].path, uploads[1].path); assert.notEqual(uploads[2].path, uploads[3].path);
  pass("image/PDF uploads retain valid responses, distinct replacement URLs and correct cache TTLs");
  console.log(`\n${checks} production integration checks passed. No live services were changed.`);
} catch (error) {
  app.kill();
  console.error(await stderr);
  console.error(await stdout);
  throw error;
} finally {
  app.kill(); await app.exited; fixture.stop(true);
}
