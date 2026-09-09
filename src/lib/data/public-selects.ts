// Preserve the complete public content contract (including reader bodies and
// translations), without transferring database timestamps or extra CMS fields.
export const newsPublicSelect = "id,title_mn,title_en,excerpt_mn,excerpt_en,body_mn,body_en,cover_image_url,category_id,author_name,author_role,author_photo,read_time_min,is_published,is_featured,tags,published_at,view_count,category:news_categories(id,name_mn,name_en,color,slug)";
export const teachersPublicSelect = "id,name_mn,name_en,subject_mn,subject_en,years_exp,bio_mn,bio_en,photo_url,is_active,is_featured,display_order";
export const achievementsPublicSelect = "id,year,highlight_mn,highlight_en,description_mn,description_en,image_url,is_milestone,achievements(id,year_id,category_id,title_mn,title_en,description_mn,description_en,image_url,is_published,display_order,category:achievement_categories(id,name_mn,name_en,icon,description_mn))";
export const coursesPublicSelect = "id,slug,title_mn,title_en,description_mn,description_en,icon,display_order,is_active,items:course_items(id,section_id,title_mn,title_en,short_desc_mn,short_desc_en,full_desc_mn,full_desc_en,teacher_name,schedule_mn,location_mn,max_students,current_students,tags,is_active,display_order)";
export const hallPublicSelect = "id,name,scope,photo,medals,is_published,is_featured,display_order,source_url,source_record_id";
