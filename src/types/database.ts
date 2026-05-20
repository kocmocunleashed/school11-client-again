export interface Teacher {
  id: string;
  name_mn: string;
  name_en: string | null;
  subject_mn: string;
  subject_en: string | null;
  years_exp: number;
  bio_mn: string | null;
  bio_en?: string | null;
  photo_url: string | null;
  is_featured: boolean;
  display_order: number;
}

export interface NewsCategory {
  id: string;
  name_mn: string;
  name_en: string | null;
  color: string;
  slug: string;
}

export interface NewsArticle {
  id: string;
  title_mn: string;
  title_en: string | null;
  excerpt_mn: string | null;
  excerpt_en?: string | null;
  body_mn: string | null;
  body_en?: string | null;
  cover_image_url: string | null;
  category_id: string;
  category?: NewsCategory | null;
  author_name: string;
  author_role: string | null;
  author_photo: string | null;
  read_time_min: number;
  is_published: boolean;
  is_featured: boolean;
  tags: string[];
  published_at: string;
  view_count: number;
}

export interface AchievementYear {
  id: string;
  year: number;
  highlight_mn: string | null;
  highlight_en?: string | null;
  description_mn: string | null;
  description_en?: string | null;
  image_url: string | null;
  is_milestone: boolean;
  achievements?: Achievement[];
}

export interface Achievement {
  id: string;
  year_id: string;
  category_id: string;
  category?: AchievementCategory | null;
  title_mn: string;
  title_en?: string | null;
  description_mn: string | null;
  description_en?: string | null;
  image_url: string | null;
}

export interface AchievementCategory {
  id: string;
  name_mn: string;
  name_en?: string | null;
  icon: string | null;
  description_mn: string | null;
}

export interface CourseSection {
  id: string;
  slug: string;
  title_mn: string;
  title_en?: string | null;
  description_mn: string | null;
  description_en?: string | null;
  icon: string | null;
  display_order: number;
  items?: CourseItem[];
}

export interface CourseItem {
  id: string;
  section_id: string;
  title_mn: string;
  title_en?: string | null;
  short_desc_mn: string | null;
  short_desc_en?: string | null;
  full_desc_mn: string | null;
  full_desc_en?: string | null;
  teacher_name: string | null;
  schedule_mn: string | null;
  location_mn: string | null;
  max_students: number | null;
  current_students?: number | null;
  tags: string[];
}

export interface CalendarEvent {
  id: string;
  title_mn: string;
  title_en?: string | null;
  description_mn: string | null;
  event_type: string;
  start_date: string;
  end_date: string | null;
  start_time: string | null;
  end_time?: string | null;
  location_mn: string | null;
  color: string;
  is_all_day: boolean;
}

export interface ApplicationResult {
  id: string;
  code: string;
  student_name: string | null;
  status: "accepted" | "pending" | "waitlisted" | "rejected" | "incomplete";
  message_mn: string | null;
  academic_year: string;
}

export interface SchoolSettings {
  id?: string;
  school_name_mn: string;
  school_name_en: string;
  established: number;
  student_count: number;
  teacher_count: number;
  club_count: number;
  address_mn: string;
  city: string;
  phone: string;
  email: string;
  facebook_url: string | null;
  instagram_url: string | null;
  youtube_url?: string | null;
  twitter_url?: string | null;
}
