import { createServerClient } from "@supabase/ssr";
import { assertSupabasePublicEnv, env } from "@/lib/env";

export const createClient = () => {
  assertSupabasePublicEnv();
  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll: () => [],
      setAll: () => undefined,
    },
  });
};
