import { adminClient } from "../supabase/admin";
import type { ApplicationResult } from "../../types/database";

export async function checkApplicationCode(rawCode: string): Promise<ApplicationResult | null> {
  const code = rawCode.trim().toUpperCase();
  if (code.length !== 8) return null;

  const { data, error } = await adminClient.from("application_results").select("*").eq("code", code).single();

  if (error) {
    if (error.code !== "PGRST116") console.error("Error checking application code:", error);
    return null;
  }

  return data as ApplicationResult;
}
