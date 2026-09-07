import records from "@/lib/data/hall-of-fame.json";
import type { HallRecord } from "@/types/database";
export const hallSeed: HallRecord[] = records.map((record, index) => ({ ...record, name: record.name || "Нэр тодруулаагүй", scope: record.scope as HallRecord["scope"], is_published: Boolean(record.name.trim()), is_featured: Boolean(record.name.trim()), display_order: index, source_url: "https://www.famhall.school11.edu.mn/", source_record_id: record.id }));
