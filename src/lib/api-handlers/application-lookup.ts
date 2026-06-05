import { noStoreJson } from "./http";
import { applicationLookupRateLimit, consumeRateLimit, getClientIp } from "./rate-limit";
import { checkApplicationCode } from "../data/applications";

const lookupRateLimits = new Map<string, { count: number; resetAt: number }>();

export const applicationCodePattern = /^[A-Z0-9]{8}$/;

export function normalizeApplicationCode(value: unknown) {
  return String(value ?? "").trim().toUpperCase();
}

export function checkApplicationLookupLimit(req: Request) {
  return consumeRateLimit(
    lookupRateLimits,
    getClientIp(req),
    applicationLookupRateLimit.maxAttempts,
    applicationLookupRateLimit.windowMs,
  );
}

export async function applicationLookupHandler(request: Request) {
  if (checkApplicationLookupLimit(request)) {
    return noStoreJson({ error: "Too many attempts" }, { status: 429 });
  }

  let body: { code?: unknown };
  try {
    body = await request.json() as { code?: unknown };
  } catch {
    return noStoreJson({ found: false, error: "Invalid application code" }, { status: 400 });
  }

  const code = normalizeApplicationCode(body.code);
  if (!applicationCodePattern.test(code)) {
    return noStoreJson({ found: false, error: "Invalid application code" }, { status: 400 });
  }

  try {
    const result = await checkApplicationCode(code);

    if (!result) {
      return noStoreJson({ found: false }, { status: 404 });
    }

    return noStoreJson({
      found: true,
      status: result.status,
      message_mn: result.message_mn,
      academic_year: result.academic_year,
    });
  } catch (error) {
    console.error("Application check failed:", error);
    return noStoreJson({ found: false }, { status: 500 });
  }
}
