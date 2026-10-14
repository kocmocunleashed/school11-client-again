import { createClient } from "../supabase/server";
import type { NewsArticle } from "../../types/database";
import { newsPublicSelect } from "./public-selects";

export async function getPublishedNews(limit = 6): Promise<NewsArticle[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("news")
      .select(newsPublicSelect)
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(limit)
      .overrideTypes<NewsArticle[], { merge: false }>();

    if (error) throw error;
    return (data || []) as NewsArticle[];
  } catch (error) {
    console.error("Error fetching news:", error);
    throw error;
  }
}
