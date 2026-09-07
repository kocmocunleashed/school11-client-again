import { createClient } from "../supabase/server";
import type { SchoolSettings } from "../../types/database";

export const defaultSchoolSettings: SchoolSettings = {
  school_name_mn: "Нийслэлийн 11-р сургууль",
  school_name_en: "11th School",
  established: 1940,
  student_count: 2000,
  teacher_count: 80,
  club_count: 40,
  address_mn: "Партизаны гудамж, Сүхбаатар дүүрэг",
  city: "Улаанбаатар",
  phone: "+976 11 327226",
  email: "School_11@edub.edu.mn",
  facebook_url: null,
  instagram_url: null,
  youtube_url: null,
  twitter_url: null,
  hero_image_url: null,
  application_guide_url: null,
};

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
