import type { HallRecord } from "@/types/database";

type QueryError = { code?: string; message: string };

/** An unapplied additive migration must not take the existing school site offline. */
export function hallDataResult(result: { data: HallRecord[] | null; error: QueryError | null }): HallRecord[] {
  if (!result.error) return result.data || [];
  const { code, message } = result.error;
  if ((code === "PGRST205" || code === "42P01") && message.includes("hall_of_fame")) {
    console.warn("Hall of Fame migration is pending; apply 20260907000000_redesign_cms.sql and its seed migration.");
    return [];
  }
  throw result.error;
}
