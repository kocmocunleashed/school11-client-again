import { env } from "../env";

export type RateLimitBucket = { count: number; resetAt: number };
export type RateLimitConfig = { maxAttempts: number; windowMs: number };

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

function persistentRateLimitAvailable() {
  return Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);
}

export async function makeRateLimitKey(scope: string, identifier: string) {
  const normalized = `${scope}:${identifier || "unknown"}`;
  const bytes = new TextEncoder().encode(normalized);
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  return `${scope}:${Array.from(digest).map(byte => byte.toString(16).padStart(2, "0")).join("")}`;
}

export function peekMemoryRateLimit(store: Map<string, RateLimitBucket>, key: string) {
  const current = store.get(key);
  if (!current || current.resetAt <= Date.now()) return { count: 0, resetAt: 0 };
  return { ...current };
}

export async function consumeSharedRateLimit(store: Map<string, RateLimitBucket>, key: string, config: RateLimitConfig) {
  if (!persistentRateLimitAvailable()) {
    return consumeRateLimit(store, key, config.maxAttempts, config.windowMs);
  }

  try {
    const { adminClient } = await import("../supabase/admin");
    const { data, error } = await adminClient.rpc("check_rate_limit", {
      p_key: key,
      p_limit: config.maxAttempts,
      p_window_seconds: Math.ceil(config.windowMs / 1000),
    }).single();
    if (error) throw error;
    return Boolean((data as { limited?: boolean } | null)?.limited);
  } catch (error) {
    console.error("Persistent rate limit failed; using in-memory fallback:", error);
    return consumeRateLimit(store, key, config.maxAttempts, config.windowMs);
  }
}

export async function clearSharedRateLimit(store: Map<string, RateLimitBucket>, key: string) {
  clearRateLimit(store, key);
  if (!persistentRateLimitAvailable()) return;

  try {
    const { adminClient } = await import("../supabase/admin");
    const { error } = await adminClient.from("rate_limits").delete().eq("key", key);
    if (error) throw error;
  } catch (error) {
    console.error("Persistent rate limit clear failed:", error);
  }
}
