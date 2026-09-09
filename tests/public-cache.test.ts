import { afterAll, afterEach, describe, expect, spyOn, test } from "bun:test";
import * as nextCache from "next/cache";
import { refreshPublicContent } from "../src/lib/revalidate-public-content";
import { PUBLIC_CONTENT_CACHE_SECONDS, PUBLIC_CONTENT_CACHE_TAG } from "../src/lib/public-cache";

const expire = spyOn(nextCache, "revalidateTag").mockImplementation(() => {});
afterEach(() => expire.mockClear());
afterAll(() => expire.mockRestore());

describe("public cache invalidation", () => {
  test("all public CMS resources immediately expire the shared data cache", () => {
    for (const resource of ["news", "teachers", "years", "achievements", "sections", "courseItems", "settings", "hallOfFame"]) {
      const response = Response.json({ ok: true });
      expect(refreshPublicContent(response, resource)).toBe(response);
      expect(expire).toHaveBeenLastCalledWith(PUBLIC_CONTENT_CACHE_TAG, { expire: 0 });
    }
    expect(expire).toHaveBeenCalledTimes(8);
    expect(PUBLIC_CONTENT_CACHE_SECONDS).toBe(300);
  });
  test("failed, unauthorized and private mutations never expire public content", () => {
    for (const status of [400, 401, 403, 404, 500]) refreshPublicContent(new Response(null, { status }), "news");
    for (const resource of ["applications", "storage", "unknown", "__proto__"]) refreshPublicContent(Response.json({ ok: true }), resource);
    expect(expire).not.toHaveBeenCalled();
  });
  test("a cache outage does not misreport an already committed save as failed", () => {
    const log = spyOn(console, "error").mockImplementation(() => {});
    expire.mockImplementationOnce(() => { throw new Error("Unavailable"); });
    const response = Response.json({ data: { id: "saved-record" } });
    try {
      expect(refreshPublicContent(response, "news")).toBe(response);
      expect(log).toHaveBeenCalled();
    } finally { log.mockRestore(); }
  });
});
