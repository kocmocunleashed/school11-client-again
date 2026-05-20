import { withWebResponse } from "../_utils";

export default withWebResponse(function handler() {
  return new Response(JSON.stringify({
    adminPasswordSet: Boolean(process.env.ADMIN_PASSWORD),
    adminPasswordLength: (process.env.ADMIN_PASSWORD ?? "").length,
    nodeEnv: process.env.NODE_ENV,
    supabaseUrlSet: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
  }), {
    headers: { "Content-Type": "application/json" },
  });
});
