import { expect, test } from "bun:test";
import { createPublicDataRefresh } from "../src/lib/public-data-refresh";
import type { PublicSiteData } from "../src/lib/public-data";

const data = { preview: false, news: [] } as unknown as PublicSiteData;

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => { resolve = done; });
  return { promise, resolve };
}

test("does not fetch until requested and coalesces concurrent refreshes", async () => {
  const response = deferred<Response>();
  let calls = 0;
  let received: PublicSiteData | undefined;
  const refresh = createPublicDataRefresh(next => { received = next; }, (async (_url, init) => {
    calls++;
    expect(init?.cache).toBe("no-store");
    expect(init?.signal).toBeInstanceOf(AbortSignal);
    return response.promise;
  }));
  expect(calls).toBe(0);
  const first = refresh.refresh();
  expect(refresh.refresh()).toBe(first);
  await Promise.resolve();
  expect(calls).toBe(1);
  response.resolve(Response.json(data));
  await first;
  expect(received).toEqual(data);
  refresh.dispose();
});

test("failed requests preserve data and allow a later retry", async () => {
  let calls = 0;
  const received: PublicSiteData[] = [];
  const refresh = createPublicDataRefresh(next => received.push(next), (async () => {
    calls++;
    if (calls === 1) return new Response(null, { status: 503 });
    if (calls === 2) throw new Error("Network unavailable");
    return Response.json(data);
  }));
  await refresh.refresh();
  await refresh.refresh();
  expect(received).toEqual([]);
  await refresh.refresh();
  expect(calls).toBe(3);
  expect(received).toEqual([data]);
  refresh.dispose();
});

test("cleanup aborts the fetch and ignores late results", async () => {
  const response = deferred<Response>();
  let signal: AbortSignal | null | undefined;
  let calls = 0;
  const received: PublicSiteData[] = [];
  const refresh = createPublicDataRefresh(next => received.push(next), (async (_url, init) => {
    calls++;
    signal = init?.signal;
    return response.promise;
  }));
  const pending = refresh.refresh();
  await Promise.resolve();
  refresh.dispose();
  expect(signal?.aborted).toBe(true);
  response.resolve(Response.json(data));
  await pending;
  await refresh.refresh();
  expect(calls).toBe(1);
  expect(received).toEqual([]);
});


test("a synchronous fetch failure also allows a later retry", async () => {
  let calls = 0;
  let received: PublicSiteData | undefined;
  const refresh = createPublicDataRefresh(next => { received = next; }, () => {
    if (++calls === 1) throw new Error("Fetch unavailable");
    return Promise.resolve(Response.json(data));
  });
  await refresh.refresh();
  await refresh.refresh();
  expect(calls).toBe(2);
  expect(received).toEqual(data);
  refresh.dispose();
});

test("page refresh uses its scoped URL without changing cancellation or deduplication", async () => {
  let requested = "";
  const refresh = createPublicDataRefresh(() => {}, (url) => {
    requested = url;
    return Promise.resolve(Response.json({ page: "apply" }));
  }, "/api/site-data?page=apply");
  await refresh.refresh();
  expect(requested).toBe("/api/site-data?page=apply");
  refresh.dispose();
});
