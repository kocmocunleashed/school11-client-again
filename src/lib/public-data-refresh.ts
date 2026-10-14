import type { PublicSiteData } from "./public-data";

/** Share one request across focus/navigation bursts; ignore results after teardown. */
export function createPublicDataRefresh<T = PublicSiteData>(
  apply: (data: T) => void,
  fetcher: (input: string, init: RequestInit) => Promise<Response> = fetch,
  url = "/api/site-data",
) {
  const controller = new AbortController();
  let pending: Promise<void> | undefined;
  const refresh = (): Promise<void> => {
    if (controller.signal.aborted) return Promise.resolve();
    if (pending) return pending;
    pending = Promise.resolve().then(async () => {
      try {
        const response = await fetcher(url, { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("Content refresh failed");
        const data = await response.json() as T;
        if (!controller.signal.aborted) apply(data);
      } catch {
        // Keep the last successful view. A later focus/navigation can retry.
      } finally {
        pending = undefined;
      }
    });
    return pending;
  };
  return { refresh, dispose: () => controller.abort() };
}
