import { createClient } from "../supabase/server";
import type { SchoolSettings } from "../../types/database";

import { fallbackSettings } from "../content";

export const defaultSchoolSettings = fallbackSettings;

export async function getSchoolSettings(): Promise<SchoolSettings> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("school_settings").select("*").limit(1).single();

    if (error) throw error;
    return (data || defaultSchoolSettings) as SchoolSettings;
  } catch (error) {
    console.error("Error fetching school settings:", error);
    throw error;
  }
}
