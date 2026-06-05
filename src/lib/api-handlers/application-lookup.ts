import { noStoreJson } from "./http";
import { applicationLookupRateLimit, consumeSharedRateLimit, getClientIp, makeRateLimitKey } from "./rate-limit";
import { checkApplicationCode } from "../data/applications";
import { applicationCodePattern, normalizeApplicationCode } from "../admin-validation";

const lookupRateLimits = new Map<string, { count: number; resetAt: number }>();

export async function checkApplicationLookupLimit(req: Request) {
  const key = await makeRateLimitKey("application_lookup", getClientIp(req));
  return consumeSharedRateLimit(
    lookupRateLimits,
    key,
    applicationLookupRateLimit,
  );
}

export async function applicationLookupHandler(request: Request) {
  if (await checkApplicationLookupLimit(request)) {
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
