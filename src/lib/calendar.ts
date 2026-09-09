import type { CalendarEvent } from "@/types/database";

export const eventTypes = { exam: "Шалгалт", olympiad: "Олимпиад", holiday: "Амралт", ceremony: "Ёслол", sport: "Спорт", cultural: "Урлаг", other: "Бусад" };

export function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function schoolToday() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ulaanbaatar", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export function eventsOnDate(events: CalendarEvent[], day: string) {
  return events.filter(event => event.start_date <= day && (event.end_date || event.start_date) >= day)
    .toSorted((a, b) => Number(b.is_all_day) - Number(a.is_all_day) || (a.start_time || "").localeCompare(b.start_time || ""));
}

export function monthDays(year: number, month: number) {
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const count = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: Math.ceil((offset + count) / 7) * 7 }, (_, index) => {
    const day = index - offset + 1;
    return day > 0 && day <= count ? dateKey(year, month, day) : null;
  });
}
