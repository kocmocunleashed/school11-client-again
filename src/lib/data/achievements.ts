import { createClient } from "../supabase/server";
import type { Achievement, AchievementCategory, AchievementYear } from "../../types/database";

export async function getAchievementYears(): Promise<AchievementYear[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("achievement_years")
      .select("*, achievements(*, category:achievement_categories(*))")
      .eq("achievements.is_published", true)
      .order("year", { ascending: false });

    if (error) throw error;
    return (data || []) as AchievementYear[];
  } catch (error) {
    console.error("Error fetching achievement years:", error);
    throw error;
  }
}

export async function getAchievementsByYear(yearId: string): Promise<Achievement[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("achievements")
      .select("*, category:achievement_categories(*)")
      .eq("year_id", yearId)
      .eq("is_published", true)
      .order("display_order", { ascending: true });

    if (error) throw error;
    return (data || []) as Achievement[];
  } catch (error) {
    console.error("Error fetching achievements by year:", error);
    throw error;
  }
}

export async function getAchievementCategories(): Promise<AchievementCategory[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("achievement_categories")
      .select("*, achievements(*)")
      .order("display_order", { ascending: true });

    if (error) throw error;
    return (data || []) as AchievementCategory[];
  } catch (error) {
    console.error("Error fetching achievement categories:", error);
    throw error;
  }
}
