"use client";

import { CheckCircle2, CircleAlert, Clock3, Search, XCircle } from "lucide-react";
import { useSiteData } from "./site-data-provider";
import { readStoredMockAdminDatabase } from "@/lib/admin/mock-database";
import { useState, type FormEvent } from "react";

type State = "idle" | "loading" | "accepted" | "pending" | "waitlisted" | "incomplete" | "rejected" | "not-found" | "invalid" | "limited" | "error";

const messages: Record<Exclude<State, "idle" | "loading">, [typeof CheckCircle2, string, string]> = {
  accepted: [CheckCircle2, "Тэнцсэн", "Таны бүртгэл баталгаажсан байна."],
  pending: [Clock3, "Хүлээгдэж байна", "Материал шалгах шатанд байна."],
  waitlisted: [Clock3, "Нөөц жагсаалтад", "Нэмэлт сонгон шалгаруулалтын мэдээллийг хүлээнэ үү."],
  incomplete: [CircleAlert, "Материал дутуу", "Бүртгэлийн материалаа гүйцээж сургалтын албатай холбогдоно уу."],
  rejected: [XCircle, "Тэнцээгүй", "Энэ удаагийн элсэлт баталгаажсангүй."],
  "not-found": [CircleAlert, "Олдсонгүй", "Кодоо шалгаад дахин оролдоно уу."],
  invalid: [CircleAlert, "Код буруу", "Код яг 8 үсэг эсвэл тооноос бүрдэнэ."],
  limited: [Clock3, "Түр хүлээнэ үү", "Олон удаа шалгасан байна. Хэсэг хугацааны дараа оролдоно уу."],
  error: [CircleAlert, "Холболт тасарлаа", "Сүлжээгээ шалгаад дахин оролдоно уу."],
};

export function ApplicationChecker() {
  const { preview } = useSiteData();
  const [code, setCode] = useState("");
  const [state, setState] = useState<State>("idle");
  const [serverMessage, setServerMessage] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const normalized = code.trim().toUpperCase();
    setServerMessage("");
    if (!/^[A-Z0-9]{8}$/.test(normalized)) { setState("invalid"); return; }
    setState("loading");
    setServerMessage("");
    try {
      const demo = preview ? readStoredMockAdminDatabase() : null;
      if (demo) {
        const result = demo.applications.find(item => item.code === normalized);
        setServerMessage(result?.message_mn || "");
        setState(result ? result.status : "not-found");
        return;
      }
      const response = await fetch("/api/check-application", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: normalized }) });
      const payload = await response.json() as { status?: string; message_mn?: string; error?: string };
      if (response.status === 429) { setState("limited"); return; }
      if (response.status === 404) { setState("not-found"); return; }
      if (!response.ok) { setState("error"); return; }
      setServerMessage(payload.message_mn || "");
      setState(["accepted", "rejected", "pending", "waitlisted", "incomplete"].includes(payload.status || "") ? payload.status as State : "error");
    } catch { setState("error"); }
  };

  const result = state !== "idle" && state !== "loading" ? messages[state] : null;
  const Icon = result?.[0];

  return <form className="application-checker" onSubmit={submit}>
    <div><p>Өргөдлийн төлөв</p><h2>Элсэлтийн үр дүн шалгах</h2><span>Бүртгүүлэх үед авсан 8 тэмдэгттэй кодоо оруулна уу.</span></div>
    <label htmlFor="application-code">Элсэлтийн код</label>
    <div className="application-input"><Search aria-hidden="true" /><input id="application-code" value={code} onChange={event => setCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))} placeholder="SCH11001" maxLength={8} autoComplete="off" aria-invalid={state === "invalid"} /></div>
    <button className="primary-button" type="submit" disabled={state === "loading"} aria-busy={state === "loading"}>{state === "loading" ? "Шалгаж байна…" : "Үр дүн шалгах"}</button>
    <div className="checker-status" aria-live="polite">{result && Icon ? <div className={`result-card is-${state}`}><Icon aria-hidden="true" /><span><strong>{result[1]}</strong><small>{serverMessage || result[2]}</small></span></div> : null}</div>
  </form>;
}
