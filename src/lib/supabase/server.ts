import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { assertSupabasePublicEnv, env } from "../env";

export function createClient() {
  assertSupabasePublicEnv();
  return createSupabaseClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
