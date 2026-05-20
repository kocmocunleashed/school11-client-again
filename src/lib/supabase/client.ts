import { createBrowserClient } from "@supabase/ssr";
import { assertSupabasePublicEnv, env } from "@/lib/env";

export const createClient = () => {
  assertSupabasePublicEnv();
  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
};
