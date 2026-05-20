import { createClient } from "../supabase/server";
import type { CalendarEvent } from "../../types/database";

export async function getUpcomingEvents(limit = 6): Promise<CalendarEvent[]> {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("is_public", true)
      .gte("start_date", today)
      .order("start_date", { ascending: true })
      .limit(limit);

    if (error) throw error;
    return (data || []) as CalendarEvent[];
  } catch (error) {
    console.error("Error fetching upcoming events:", error);
    return [];
  }
}

export async function getEventsByMonth(year: number, month: number): Promise<CalendarEvent[]> {
  try {
    const start = `${year}-${String(month).padStart(2, "0")}-01`;
    const end = new Date(year, month, 0).toISOString().slice(0, 10);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("is_public", true)
      .gte("start_date", start)
      .lte("start_date", end)
      .order("start_date", { ascending: true });

    if (error) throw error;
    return (data || []) as CalendarEvent[];
  } catch (error) {
    console.error("Error fetching monthly events:", error);
    return [];
  }
}

export async function getEventsByType(type: string): Promise<CalendarEvent[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("is_public", true)
      .eq("event_type", type)
      .order("start_date", { ascending: true });

    if (error) throw error;
    return (data || []) as CalendarEvent[];
  } catch (error) {
    console.error("Error fetching events by type:", error);
    return [];
  }
}
