import { createClient } from "@/lib/supabase/server";
import type { CourseSection } from "@/types/database";

export async function getCourseSections(): Promise<CourseSection[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("course_sections")
      .select("*, items:course_items(*)")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("display_order", { referencedTable: "course_items", ascending: true });

    if (error) throw error;
    return (data || []) as CourseSection[];
  } catch (error) {
    console.error("Error fetching course sections:", error);
    return [];
  }
}

export async function getSectionBySlug(slug: string): Promise<CourseSection | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("course_sections")
      .select("*, items:course_items(*)")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error) throw error;
    return data as CourseSection;
  } catch (error) {
    console.error("Error fetching course section:", error);
    return null;
  }
}
