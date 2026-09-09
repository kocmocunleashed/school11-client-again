"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock3, MapPin } from "lucide-react";
import { dateKey, eventsOnDate, eventTypes, monthDays, schoolToday } from "@/lib/calendar";
import { useSiteData } from "./site-data-provider";

export function SchoolCalendar() {
  const { events = [] } = useSiteData();
  const [today] = useState(schoolToday);
  const [selected, setSelected] = useState(today);
  const [month, setMonth] = useState(() => today.slice(0, 7));
  const [year, monthNumber] = month.split("-").map(Number);
  const days = monthDays(year, monthNumber - 1);
  const selectedEvents = eventsOnDate(events, selected);
  const moveMonth = (offset: number) => {
    const next = new Date(year, monthNumber - 1 + offset, 1);
    const key = dateKey(next.getFullYear(), next.getMonth(), 1);
    setMonth(key.slice(0, 7)); setSelected(key);
  };

  return <div className="school-calendar">
    <div className="calendar-toolbar">
      <h3 aria-live="polite">{year} оны {monthNumber}-р сар</h3>
      <div><button type="button" onClick={() => { setMonth(today.slice(0, 7)); setSelected(today); }}>Өнөөдөр</button><button type="button" aria-label="Өмнөх сар" onClick={() => moveMonth(-1)}><ChevronLeft size={20} /></button><button type="button" aria-label="Дараах сар" onClick={() => moveMonth(1)}><ChevronRight size={20} /></button></div>
    </div>
    <div className="calendar-layout">
      <div><div className="calendar-week" aria-hidden="true">{["Да", "Мя", "Лх", "Пү", "Ба", "Бя", "Ня"].map(day => <span key={day}>{day}</span>)}</div>
        <div className="calendar-grid" role="group" aria-label={`${year} оны ${monthNumber}-р сарын өдрүүд`}>
          {days.map((day, index) => {
            if (!day) return <div className="calendar-blank" key={`blank-${index}`} />;
            const entries = eventsOnDate(events, day);
            return <button type="button" className="calendar-day" key={day} aria-pressed={selected === day} aria-current={today === day ? "date" : undefined} aria-label={`${day}, ${entries.length} үйл ажиллагаа`} onClick={() => setSelected(day)}>
              <span className="calendar-date">{Number(day.slice(-2))}</span>
              <span className="calendar-day-events">{entries.slice(0, 2).map(event => <span className="calendar-event-label" key={event.id}><i style={{ backgroundColor: /^#[0-9a-f]{6}$/i.test(event.color) ? event.color : "#304ffe" }} />{event.title_mn}</span>)}{entries.length > 2 && <small>+{entries.length - 2}</small>}</span>
              {entries.length > 0 && <span className="calendar-mobile-count">{entries.length} үйл явдал</span>}
            </button>;
          })}
        </div>
      </div>
      <aside className="calendar-agenda" aria-live="polite"><p className="calendar-eyebrow">Өдрийн хуваарь</p><h3>{Number(selected.slice(5, 7))}-р сарын {Number(selected.slice(-2))}</h3>
        {selectedEvents.length ? selectedEvents.map(event => <article key={event.id}><span className="calendar-event-type">{eventTypes[event.event_type as keyof typeof eventTypes] || "Бусад"}</span><h4>{event.title_mn}</h4><p><Clock3 size={16} />{event.is_all_day ? "Бүтэн өдөр" : event.start_time?.slice(0, 5) || "Цаг товлоогүй"}{!event.is_all_day && event.end_time ? `–${event.end_time.slice(0, 5)}` : ""}</p>{event.end_date && event.end_date !== event.start_date && <p>{event.start_date} — {event.end_date}</p>}{event.location_mn && <p><MapPin size={16} />{event.location_mn}</p>}{event.description_mn && <div>{event.description_mn}</div>}</article>) : <p className="calendar-empty">Энэ өдөр товлосон үйл ажиллагаа байхгүй.</p>}
        {!events.some(event => event.start_date <= dateKey(year, monthNumber - 1, new Date(year, monthNumber, 0).getDate()) && (event.end_date || event.start_date) >= `${month}-01`) && <p className="calendar-empty">Энэ сарын хуваарь хараахан нийтлэгдээгүй байна.</p>}
      </aside>
    </div>
  </div>;
}
