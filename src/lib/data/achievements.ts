import { createClient } from "../supabase/server";
import type { AchievementYear } from "../../types/database";
import { achievementsPublicSelect } from "./public-selects";

export async function getAchievementYears(): Promise<AchievementYear[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("achievement_years")
      .select(achievementsPublicSelect)
      .eq("achievements.is_published", true)
      .order("year", { ascending: false })
      .overrideTypes<AchievementYear[], { merge: false }>();

    if (error) throw error;
    return (data || []) as AchievementYear[];
  } catch (error) {
    console.error("Error fetching achievement years:", error);
    throw error;
  }
}
