import { createClient } from "@supabase/supabase-js";
import { assertSupabaseAdminEnv, env } from "../env";

assertSupabaseAdminEnv();

export const adminClient = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
