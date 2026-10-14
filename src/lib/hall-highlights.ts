import type { HallRecord } from "@/types/database";

export const latestHallYear = (person: HallRecord) => Math.max(0, ...person.medals.flatMap(medal => (medal.year.match(/\d{4}/g) || []).map(Number)));
export const compareHallRecords = (a: HallRecord, b: HallRecord) => a.display_order - b.display_order || latestHallYear(b) - latestHallYear(a) || a.name.localeCompare(b.name, "mn-MN");

export function homeHallHighlights(records: HallRecord[]) {
  const names = new Set<string>();
  return records.toSorted(compareHallRecords).filter(person => {
    if (!person.is_featured || names.has(person.name)) return false;
    names.add(person.name);
    return true;
  }).slice(0, 12);
}
