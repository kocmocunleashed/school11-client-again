const runtimeEnv = (globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }).process?.env;
const normalizeSupabaseUrl = (url: string | undefined) => (url || "").replace(/\/rest\/v1\/?$/, "");

export const env = {
  supabaseUrl: normalizeSupabaseUrl(runtimeEnv?.NEXT_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: runtimeEnv?.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? runtimeEnv?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
  supabaseServiceRoleKey: runtimeEnv?.SUPABASE_SERVICE_ROLE_KEY ?? "",
};

export function assertSupabasePublicEnv() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
}

export function assertSupabaseAdminEnv() {
  assertSupabasePublicEnv();
  if (!env.supabaseServiceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }
}
