"use client";
import { useState } from "react";
import type { CalendarEvent } from "@/types/database";
import { eventTypes, schoolToday } from "@/lib/calendar";
import { sanitizeAdminRecord, writableFieldNames } from "@/lib/admin-validation";

export function CalendarManager({ events, save, remove }: { events: CalendarEvent[]; save: (resource: string, record: Record<string, unknown>) => Promise<void>; remove: (resource: string, id: string) => Promise<void> }) {
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (key: string, value: unknown) => setEditing(form => ({ ...form, [key]: value }));
  const open = (record: Record<string, unknown>) => { setError(""); setEditing(record); };
  return <section className="calendar-admin"><div className="admin-title"><h1>Календар</h1><button type="button" className="admin-primary" onClick={() => open({ title_mn: "", description_mn: "", event_type: "other", start_date: schoolToday(), end_date: "", start_time: "", end_time: "", location_mn: "", is_all_day: true, is_public: false, color: "#304ffe" })}>Үйл ажиллагаа нэмэх</button></div>
    <p>Огноо, цаг, байршлыг оруулаад «Нийтлэх»-ийг сонгосноор сургуулийн календар дээр харагдана. Цагийг Улаанбаатарын цагаар оруулна.</p>
    <div className="admin-list">{events.toSorted((a, b) => a.start_date.localeCompare(b.start_date)).map(event => <button key={event.id} type="button" onClick={() => open({ ...event })}><strong>{event.title_mn}</strong><span>{event.start_date}{event.end_date ? ` — ${event.end_date}` : ""} · {event.is_public ? "Нийтлэгдсэн" : "Ноорог"}</span></button>)}</div>
    {!events.length && <p>Үйл ажиллагаа бүртгэгдээгүй байна.</p>}
    {editing && <form className="admin-panel admin-form" onSubmit={async event => {
      event.preventDefault(); setBusy(true); setError("");
      try {
        const allowed = Object.fromEntries(Object.entries(editing).filter(([key]) => (writableFieldNames.events as readonly string[]).includes(key)));
        const clean = sanitizeAdminRecord("events", allowed);
        await save("events", { ...clean, ...(editing.id ? { id: editing.id } : {}) }); setEditing(null);
      } catch (cause) { setError(cause instanceof Error ? cause.message : "Хадгалж чадсангүй. Дахин оролдоно уу."); }
      finally { setBusy(false); }
    }}>
      <label>Үйл ажиллагааны нэр<input required maxLength={180} value={String(editing.title_mn || "")} onChange={event => set("title_mn", event.target.value)} /></label>
      <label>Төрөл<select value={String(editing.event_type)} onChange={event => set("event_type", event.target.value)}>{Object.entries(eventTypes).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
      <label>Эхлэх огноо<input required type="date" value={String(editing.start_date || "")} onChange={event => set("start_date", event.target.value)} /></label>
      <label>Дуусах огноо<input type="date" min={String(editing.start_date || "")} value={String(editing.end_date || "")} onChange={event => set("end_date", event.target.value)} /></label>
      <label><input type="checkbox" checked={Boolean(editing.is_all_day)} onChange={event => set("is_all_day", event.target.checked)} /> Бүтэн өдөр</label>
      {!editing.is_all_day && <><label>Эхлэх цаг<input type="time" value={String(editing.start_time || "").slice(0, 5)} onChange={event => set("start_time", event.target.value)} /></label><label>Дуусах цаг<input type="time" value={String(editing.end_time || "").slice(0, 5)} onChange={event => set("end_time", event.target.value)} /></label></>}
      <label>Байршил<input maxLength={200} value={String(editing.location_mn || "")} onChange={event => set("location_mn", event.target.value)} /></label>
      <label>Тайлбар<textarea maxLength={3000} value={String(editing.description_mn || "")} onChange={event => set("description_mn", event.target.value)} /></label>
      <label>Өнгө<input type="color" value={String(editing.color || "#304ffe")} onChange={event => set("color", event.target.value)} /></label>
      <label><input type="checkbox" checked={Boolean(editing.is_public)} onChange={event => set("is_public", event.target.checked)} /> Нийтлэх</label>
      {error && <p role="alert">{error}</p>}
      <div className="admin-actions"><button type="button" disabled={busy} onClick={() => setEditing(null)}>Болих</button>{Boolean(editing.id) && <button type="button" disabled={busy} onClick={async () => { setBusy(true); try { await remove("events", String(editing.id)); } catch { setError("Устгаж чадсангүй. Дахин оролдоно уу."); } finally { setBusy(false); } }}>Устгах</button>}<button className="admin-primary" disabled={busy}>{busy ? "Хадгалж байна…" : "Хадгалах"}</button></div>
    </form>}
  </section>;
}
