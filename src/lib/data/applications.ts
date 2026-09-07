import type { ApplicationResult } from "../../types/database";

const applicationCodePattern = /^[A-Z0-9]{8}$/;

export async function checkApplicationCode(rawCode: string): Promise<ApplicationResult | null> {
  const code = rawCode.trim().toUpperCase();
  if (!applicationCodePattern.test(code)) return null;

  const { adminClient } = await import("../supabase/admin");

  const { data, error } = await adminClient
    .from("application_results")
    .select("code,status,message_mn,academic_year")
    .eq("code", code)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data as ApplicationResult;
}
