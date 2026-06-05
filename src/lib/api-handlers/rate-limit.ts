export type RateLimitBucket = { count: number; resetAt: number };

export const loginRateLimit = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000,
} as const;

export const applicationLookupRateLimit = {
  maxAttempts: 30,
  windowMs: 10 * 60 * 1000,
} as const;

export function getClientIp(req: Request) {
  return (req.headers.get("x-forwarded-for") || "").split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "local";
}

export function consumeRateLimit(store: Map<string, RateLimitBucket>, key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const current = store.get(key);
  if (!current || current.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  current.count += 1;
  return current.count > limit;
}

export function clearRateLimit(store: Map<string, RateLimitBucket>, key: string) {
  store.delete(key);
}
