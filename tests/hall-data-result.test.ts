import { describe, expect, test } from "bun:test";
import { hallDataResult } from "@/lib/hall-data-result";

describe("Hall of Fame deployment compatibility", () => {
  test("keeps the existing site available when the new table has not been migrated", () => {
    expect(hallDataResult({ data: null, error: { code: "PGRST205", message: "Could not find the table 'public.hall_of_fame' in the schema cache" } })).toEqual([]);
    expect(hallDataResult({ data: null, error: { code: "42P01", message: 'relation "public.hall_of_fame" does not exist' } })).toEqual([]);
  });
  test("preserves intentional empty results without importing sample content", () => {
    expect(hallDataResult({ data: [], error: null })).toEqual([]);
  });
  test("does not hide credential errors, outages, or unrelated missing tables", () => {
    for (const error of [
      { code: "42501", message: "permission denied for hall_of_fame" },
      { code: "PGRST205", message: "Could not find table public.news" },
      { message: "fetch failed" },
    ]) expect(() => hallDataResult({ data: null, error })).toThrow();
  });
});
