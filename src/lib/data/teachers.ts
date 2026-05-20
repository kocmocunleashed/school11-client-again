import { createClient } from "../supabase/server";
import type { Teacher } from "../../types/database";

export async function getAllTeachers(): Promise<Teacher[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("teachers")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) throw error;
    return (data || []) as Teacher[];
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return [];
  }
}

export async function getFeaturedTeachers(): Promise<Teacher[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("teachers")
      .select("*")
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("display_order", { ascending: true });

    if (error) throw error;
    return (data || []) as Teacher[];
  } catch (error) {
    console.error("Error fetching featured teachers:", error);
    return [];
  }
}
