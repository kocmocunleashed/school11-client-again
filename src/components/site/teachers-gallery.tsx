"use client";
import Image from "next/image";
import { useRef, useState, type PointerEvent } from "react";
import { ArrowLeft, ArrowRight, GripHorizontal } from "lucide-react";
import { useSiteData } from "./site-data-provider";
export function TeachersGallery({ featured = false }: { featured?: boolean }) {
  const { teachers } = useSiteData();
  const management = teachers.filter(item => /захирал|менежер|нийгмийн ажилтан|эрхлэгч/i.test(item.subject_mn));
  const visible = featured ? management.filter(item => item.is_featured).slice(0, 8) : management;
  const [order, setOrder] = useState<string[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [target, setTarget] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const board = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: string; pointer: number; x: number; y: number; note: HTMLElement; target: string | null } | null>(null);
  const arranged = [...visible].sort((a, b) => {
    const rank = (id: string) => order.includes(id) ? order.indexOf(id) : order.length + visible.findIndex(item => item.id === id);
    return rank(a.id) - rank(b.id);
  });
  const move = (id: string, destination: string) => {
    const ids = arranged.map(person => person.id);
    const from = ids.indexOf(id), to = ids.indexOf(destination);
    if (from < 0 || to < 0 || from === to) return;
    ids.splice(from, 1); ids.splice(to, 0, id); setOrder(ids);
    setAnnouncement(`${visible.find(person => person.id === id)?.name_mn}: ${to + 1}-р байрлалд шилжлээ.`);
  };
  const finishDrag = (event: PointerEvent<HTMLButtonElement>, cancel = false) => {
    const current = drag.current;
    if (!current || current.pointer !== event.pointerId) return;
    current.note.style.transform = "";
    if (!cancel && current.target) move(current.id, current.target);
    drag.current = null; setDragging(null); setTarget(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  return <section className="cms-teachers section" aria-label="Удирдлагын баг"><div className={featured ? "shell mx-auto w-[var(--shell)]" : undefined}>
    <div className="section-heading"><h2>Удирдлагын баг</h2></div>
    <div className="management-intro"><h3>Сургуулийн хөгжлийг чиглүүлэгчид</h3><p>Сургалтын чанар, сурагчдын хөгжил, сургуулийн өдөр тутмын үйл ажиллагааг хариуцан ажилладаг манай удирдлагын багтай танилцаарай.</p></div>
    {visible.length > 1 && <p className="management-note-hint">Дээд бариулаас чирж байрлалыг өөрчлөөрэй.</p>}
    <div className="cms-teacher-grid management-note-board" ref={board}>{arranged.map((person, index) => <div className="management-note-slot" data-note-id={person.id} data-drop-target={target === person.id && dragging !== person.id} key={person.id}>
      <article className="management-note" data-dragging={dragging === person.id}>
        <button type="button" className="management-note-grip" aria-label={`${person.name_mn}: чирж зөөх, эсвэл сумтай товч ашиглах`} onKeyDown={event => {
          if (event.key === "Escape" && drag.current) { drag.current.note.style.transform = ""; drag.current = null; setDragging(null); setTarget(null); }
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); const next = arranged[index + (event.key === "ArrowLeft" ? -1 : 1)]; if (next) move(person.id, next.id); }
        }} onPointerDown={event => {
          if (event.button !== 0 || drag.current || !event.isPrimary) return;
          const note = event.currentTarget.closest("article")!;
          drag.current = { id: person.id, pointer: event.pointerId, x: event.clientX, y: event.clientY, note, target: null };
          event.currentTarget.setPointerCapture(event.pointerId); setDragging(person.id);
        }} onPointerMove={event => {
          const current = drag.current;
          if (!current || current.pointer !== event.pointerId) return;
          current.note.style.transform = `translate(${event.clientX - current.x}px, ${event.clientY - current.y}px) rotate(-2deg) scale(1.025)`;
          const slot = Array.from(board.current?.querySelectorAll<HTMLElement>(".management-note-slot") || []).find(element => { const rect = element.getBoundingClientRect(); return event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom; });
          current.target = slot?.dataset.noteId || null; setTarget(current.target);
        }} onPointerUp={event => finishDrag(event)} onPointerCancel={event => finishDrag(event, true)} onLostPointerCapture={event => finishDrag(event, true)}><GripHorizontal size={22} aria-hidden="true" /></button>
        <div className="cms-teacher-photo">{person.photo_url ? <Image src={person.photo_url} alt={person.name_mn} fill sizes="(max-width: 700px) 50vw, 25vw" style={{ objectFit: "cover", objectPosition: "center 25%" }} draggable={false} unoptimized /> : <span>{person.subject_mn}</span>}</div>
        <div className="management-note-copy"><h3>{person.name_mn}</h3><p className="management-note-role">{person.subject_mn}</p>{person.bio_mn && <p>{person.bio_mn}</p>}</div>
        <div className="management-note-actions"><span>{String(index + 1).padStart(2, "0")}</span><button type="button" disabled={index === 0} aria-label={`${person.name_mn}: өмнөх байрлалд`} onClick={() => move(person.id, arranged[index - 1].id)}><ArrowLeft size={16} /></button><button type="button" disabled={index === arranged.length - 1} aria-label={`${person.name_mn}: дараах байрлалд`} onClick={() => move(person.id, arranged[index + 1].id)}><ArrowRight size={16} /></button></div>
      </article>
    </div>)}</div>
    <span className="sr-only" role="status">{announcement}</span>
    {!visible.length && <p>Удирдлагын багийн танилцуулга удахгүй нэмэгдэнэ.</p>}
  </div></section>;
}
