import { createClient } from "../supabase/server";
import type { NewsArticle } from "../../types/database";

const newsSelect = "*, category:news_categories(*)";
const newsByCategorySelect = "*, category:news_categories!inner(*)";

export async function getPublishedNews(limit = 6): Promise<NewsArticle[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("news")
      .select(newsSelect)
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as NewsArticle[];
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
}

export async function getFeaturedNews(): Promise<NewsArticle[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("news")
      .select(newsSelect)
      .eq("is_published", true)
      .eq("is_featured", true)
      .order("published_at", { ascending: false });

    if (error) throw error;
    return (data || []) as NewsArticle[];
  } catch (error) {
    console.error("Error fetching featured news:", error);
    return [];
  }
}

export async function getNewsById(id: string): Promise<NewsArticle | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("news").select(newsSelect).eq("id", id).single();

    if (error) throw error;

    try {
      await supabase.rpc("increment_news_view_count", { news_id: id });
    } catch (err) {
      console.error("View count error:", err);
    }

    return data as NewsArticle;
  } catch (error) {
    console.error("Error fetching news article:", error);
    return null;
  }
}

export async function getNewsByCategory(slug: string): Promise<NewsArticle[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("news")
      // Use an inner embedded relation so PostgREST filters by the joined category row.
      .select(newsByCategorySelect)
      .eq("is_published", true)
      .eq("category.slug", slug)
      .order("published_at", { ascending: false });

    if (error) throw error;
    return (data || []) as NewsArticle[];
  } catch (error) {
    console.error("Error fetching category news:", error);
    return [];
  }
}
