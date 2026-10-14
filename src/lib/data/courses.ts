import { createClient } from "../supabase/server";
import type { CourseSection } from "../../types/database";
import { coursesPublicSelect } from "./public-selects";

export async function getCourseSections(): Promise<CourseSection[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("course_sections")
      .select(coursesPublicSelect)
      .eq("items.is_active", true)
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("display_order", { referencedTable: "items", ascending: true });

    if (error) throw error;
    return (data || []) as CourseSection[];
  } catch (error) {
    console.error("Error fetching course sections:", error);
    throw error;
  }
}
