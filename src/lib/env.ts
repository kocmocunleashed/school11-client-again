const runtimeEnv = (globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }).process?.env;
const normalizeSupabaseUrl = (url: string | undefined) => (url || "").trim().replace(/\/rest\/v1\/?$/, "");

export const env = {
  supabaseUrl: normalizeSupabaseUrl(runtimeEnv?.NEXT_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: runtimeEnv?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() || runtimeEnv?.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "",
  supabaseServiceRoleKey: runtimeEnv?.SUPABASE_SECRET_KEY?.trim() || runtimeEnv?.SUPABASE_SERVICE_ROLE_KEY?.trim() || "",
};

export function assertSupabasePublicEnv() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error("Missing Supabase public URL or publishable/anon key");
  }
}

export function assertSupabaseAdminEnv() {
  assertSupabasePublicEnv();
  if (!env.supabaseServiceRoleKey) {
    throw new Error("Missing Supabase secret/service-role key");
  }
}

export function hasSupabasePublicEnv() {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}
