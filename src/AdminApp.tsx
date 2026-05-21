import {
  Award,
  BookOpen,
  FileText,
  GraduationCap,
  Home,
  LogOut,
  Newspaper,
  Save,
  Settings,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import type { AchievementCategory, AchievementYear, ApplicationResult, CourseItem, CourseSection, NewsArticle, NewsCategory, SchoolSettings, Teacher } from "@/types/database";
import schoolLogo from "../logo of the school.png";

type AdminPage = "dashboard" | "news" | "teachers" | "achievements" | "courses" | "applications" | "settings";
type Toast = { kind: "success" | "error"; text: string } | null;

type AdminData = {
  news: NewsArticle[];
  categories: NewsCategory[];
  teachers: Teacher[];
  years: AchievementYear[];
  achievementCategories: AchievementCategory[];
  achievements: Array<Record<string, unknown>>;
  sections: CourseSection[];
  courseItems: CourseItem[];
  applications: ApplicationResult[];
  settings: SchoolSettings | null;
};

const emptyData: AdminData = {
  news: [],
  categories: [],
  teachers: [],
  years: [],
  achievementCategories: [],
  achievements: [],
  sections: [],
  courseItems: [],
  applications: [],
  settings: null,
};

const nav = [
  ["dashboard", Home, "Dashboard"],
  ["news", Newspaper, "News Manager"],
  ["teachers", Users, "Teachers Manager"],
  ["achievements", Award, "Achievements"],
  ["courses", BookOpen, "Courses"],
  ["applications", FileText, "Application Codes"],
  ["settings", Settings, "School Settings"],
] as const;

function adminPageFromPath(): AdminPage {
  const slug = window.location.pathname.split("/")[2] as AdminPage | undefined;
  return nav.some(([id]) => id === slug) ? slug! : "dashboard";
}

async function api(path: string, init?: RequestInit) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 20_000);

  try {
    const res = await fetch(path, {
      ...init,
      credentials: "same-origin",
      signal: init?.signal || controller.signal,
      headers: init?.body instanceof FormData ? init.headers : { "Content-Type": "application/json", ...(init?.headers || {}) },
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      throw new Error(payload.error || `Request failed: ${res.status}`);
    }
    return res.json();
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Request timed out");
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

function parseCsv(text: string) {
  const [head = "", ...lines] = text.trim().split(/\r?\n/);
  const headers = head.split(",").map(h => h.trim());
  return lines.filter(Boolean).map(line => {
    const cols = line.split(",").map(v => v.trim());
    return Object.fromEntries(headers.map((header, index) => [header, cols[index] || ""]));
  });
}

function toCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0] || {});
  return [headers.join(","), ...rows.map(row => headers.map(header => JSON.stringify(row[header] ?? "")).join(","))].join("\n");
}

export function AdminApp() {
  const [page, setPage] = useState<AdminPage>(adminPageFromPath());
  const [data, setData] = useState<AdminData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [toast, setToast] = useState<Toast>(null);

  const notify = (next: Toast) => {
    setToast(next);
    window.setTimeout(() => setToast(null), 2600);
  };

  useEffect(() => {
    document.querySelector("meta[name='robots']")?.remove();
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex,nofollow";
    document.head.appendChild(meta);
  }, []);

  const load = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const session = await api("/api/admin/me");
      if (!session.authenticated) {
        location.href = "/admin/login";
        return;
      }
    } catch (error) {
      location.href = "/admin/login";
      return;
    }

    try {
      setData(await api("/api/admin/bootstrap"));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Admin data failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const onPop = () => setPage(adminPageFromPath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const go = (next: AdminPage) => {
    window.history.pushState(null, "", next === "dashboard" ? "/admin" : `/admin/${next}`);
    setPage(next);
  };

  const save = async (resource: string, record: Record<string, unknown>) => {
    await api(`/api/admin/save/${resource}`, { method: "POST", body: JSON.stringify(record) });
    notify({ kind: "success", text: "Saved" });
    await load();
  };

  const remove = async (resource: string, id: string) => {
    if (!confirm("Delete this item?")) return;
    await api(`/api/admin/delete/${resource}/${id}`, { method: "DELETE" });
    notify({ kind: "success", text: "Deleted" });
    await load();
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand"><img src={schoolLogo} alt="" /><span>11-р сургууль<br /><small>Admin CMS</small></span></div>
        <nav>
          {nav.map(([id, Icon, label]) => (
            <button key={id} className={page === id ? "active" : ""} onClick={() => go(id)}>
              <Icon size={18} /> {label}
            </button>
          ))}
        </nav>
        <button className="admin-logout" onClick={async () => { await api("/api/admin/logout", { method: "POST" }); location.href = "/admin/login"; }}><LogOut size={18} /> Logout</button>
      </aside>
      <main className="admin-main">
        {toast && <div className={`admin-toast ${toast.kind}`}>{toast.text}</div>}
        {loading && <div className="admin-loading">Loading...</div>}
        {!loading && loadError && <div className="admin-loading">{loadError}</div>}
        {!loading && !loadError && page === "dashboard" && <Dashboard go={go} />}
        {!loading && !loadError && page === "news" && <NewsManager data={data} save={save} remove={remove} reload={load} notify={notify} />}
        {!loading && !loadError && page === "teachers" && <TeachersManager data={data} save={save} remove={remove} notify={notify} />}
        {!loading && !loadError && page === "achievements" && <AchievementsManager data={data} save={save} remove={remove} notify={notify} />}
        {!loading && !loadError && page === "courses" && <CoursesManager data={data} save={save} remove={remove} />}
        {!loading && !loadError && page === "applications" && <ApplicationsManager data={data} save={save} remove={remove} reload={load} notify={notify} />}
        {!loading && !loadError && page === "settings" && <SettingsManager data={data} save={save} notify={notify} />}
      </main>
    </div>
  );
}

export function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    document.querySelector("meta[name='robots']")?.remove();
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex,nofollow";
    document.head.appendChild(meta);
  }, []);

  const handleLogin = async (password: string) => {
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.trim() }),
      });

      const data = await res.json();
      console.log("[login form] status:", res.status);
      console.log("[login form] response:", data);

      if (res.ok) {
        window.location.href = "/admin";
      } else {
        setError(data.error ?? "Wrong password");
      }
    } catch (err) {
      console.error("[login form] fetch failed:", err);
      setError("Connection error - check console");
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await handleLogin(password);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="admin-login">
      <form className={`login-card ${error ? "shake" : ""}`} onSubmit={submit}>
        <img className="login-logo" src={schoolLogo} alt="" />
        <h1>11-р сургууль Admin</h1>
        <input type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Password" autoFocus />
        {error && <p>{error === "Unauthorized" ? "Wrong password" : error}</p>}
        <button disabled={saving}>{saving ? "Checking..." : "Login"}</button>
      </form>
    </main>
  );
}

function Dashboard({ go }: { go: (page: AdminPage) => void }) {
  return (
    <section>
      <AdminTitle title="Dashboard" action={null} />
      <div className="admin-card-grid">
        {nav.slice(1).map(([id, Icon, label]) => (
          <button className="admin-card-link" key={id} onClick={() => go(id)}>
            <Icon /> <strong>{label}</strong><span>Manage content</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function AdminTitle({ title, action }: { title: string; action: ReactNode }) {
  return <div className="admin-title"><h1>{title}</h1>{action}</div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="admin-field"><span>{label}</span>{children}</label>;
}

function UploadField({ bucket, prefix, value, circular, onChange, notify }: { bucket: string; prefix: string; value?: string | null; circular?: boolean; onChange: (url: string) => void; notify: (toast: Toast) => void }) {
  const [preview, setPreview] = useState(value || "");
  const [uploading, setUploading] = useState(false);
  return (
    <div className="upload-field">
      {preview && <img className={circular ? "upload-preview circle" : "upload-preview"} src={preview} alt="" />}
      <input type="file" accept="image/*,.pdf" onChange={async event => {
        const file = event.target.files?.[0];
        if (!file) return;
        setPreview(URL.createObjectURL(file));
        setUploading(true);
        const form = new FormData();
        form.append("file", file);
        form.append("prefix", prefix);
        try {
          const result = await api(`/api/admin/upload/${bucket}`, { method: "POST", body: form });
          onChange(result.publicUrl);
          setPreview(result.publicUrl);
          notify({ kind: "success", text: "Uploaded" });
        } catch (error) {
          notify({ kind: "error", text: error instanceof Error ? error.message : "Upload failed" });
        } finally {
          setUploading(false);
        }
      }} />
      {uploading && <small>Uploading...</small>}
    </div>
  );
}

function NewsManager({ data, save, remove, reload, notify }: { data: AdminData; save: (r: string, v: Record<string, unknown>) => Promise<void>; remove: (r: string, id: string) => Promise<void>; reload: () => Promise<void>; notify: (toast: Toast) => void }) {
  const blank = { title_mn: "", category_id: data.categories[0]?.id || "", author_name: "Сургуулийн захиргаа", author_role: "Захиргаа", read_time_min: 3, cover_image_url: "", excerpt_mn: "", body_mn: "", tags: [], is_featured: false, is_published: false, published_at: new Date().toISOString() };
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  return (
    <section>
      <AdminTitle title="News Manager" action={<button className="admin-primary" onClick={() => setEditing(blank)}>Add New Article</button>} />
      <table className="admin-table"><thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Date</th><th /></tr></thead><tbody>
        {data.news.map(item => <tr key={item.id}><td>{item.title_mn}</td><td>{item.category?.name_mn}</td><td><button className="mini" onClick={async () => { await api(`/api/admin/toggle-news/${item.id}`, { method: "POST", body: JSON.stringify({ is_published: !item.is_published }) }); await reload(); }}>{item.is_published ? "Published" : "Draft"}</button></td><td>{item.published_at?.slice(0, 10)}</td><td><button onClick={() => setEditing(item as unknown as Record<string, unknown>)}>Edit</button><button onClick={() => remove("news", item.id)}>Delete</button></td></tr>)}
      </tbody></table>
      {editing && <div className="admin-panel"><NewsForm record={editing} categories={data.categories} onCancel={() => setEditing(null)} onSave={async record => { await save("news", record); setEditing(null); }} notify={notify} /></div>}
    </section>
  );
}

function NewsForm({ record, categories, onSave, onCancel, notify }: { record: Record<string, unknown>; categories: NewsCategory[]; onSave: (record: Record<string, unknown>) => Promise<void>; onCancel: () => void; notify: (toast: Toast) => void }) {
  const [form, setForm] = useState(record);
  const [saving, setSaving] = useState(false);
  const set = (key: string, value: unknown) => setForm(prev => ({ ...prev, [key]: value }));
  return <form className="admin-form" onSubmit={async event => { event.preventDefault(); setSaving(true); await onSave({ ...form, tags: String(form.tags || "").split(",").map(t => t.trim()).filter(Boolean) }); setSaving(false); }}>
    <Field label="Title (Mongolian)"><input value={String(form.title_mn || "")} onChange={e => set("title_mn", e.target.value)} required /></Field>
    <Field label="Category"><select value={String(form.category_id || "")} onChange={e => set("category_id", e.target.value)}>{categories.map(c => <option key={c.id} value={c.id}>{c.name_mn}</option>)}</select></Field>
    <div className="admin-two"><Field label="Author name"><input value={String(form.author_name || "")} onChange={e => set("author_name", e.target.value)} /></Field><Field label="Author role"><input value={String(form.author_role || "")} onChange={e => set("author_role", e.target.value)} /></Field></div>
    <Field label="Read time"><input type="number" value={Number(form.read_time_min || 3)} onChange={e => set("read_time_min", Number(e.target.value))} /></Field>
    <Field label="Cover image"><UploadField bucket="news-images" prefix="news" value={String(form.cover_image_url || "")} onChange={url => set("cover_image_url", url)} notify={notify} /></Field>
    <Field label="Excerpt"><textarea value={String(form.excerpt_mn || "")} onChange={e => set("excerpt_mn", e.target.value)} /></Field>
    <Field label="Body"><textarea className="large" value={String(form.body_mn || "")} onChange={e => set("body_mn", e.target.value)} /></Field>
    <Field label="Tags"><input value={Array.isArray(form.tags) ? form.tags.join(", ") : String(form.tags || "")} onChange={e => set("tags", e.target.value)} /></Field>
    <label><input type="checkbox" checked={Boolean(form.is_featured)} onChange={e => set("is_featured", e.target.checked)} /> Featured</label>
    <label><input type="checkbox" checked={Boolean(form.is_published)} onChange={e => set("is_published", e.target.checked)} /> Published</label>
    <div className="admin-actions"><button type="button" onClick={onCancel}>Cancel</button><button className="admin-primary" disabled={saving}><Save size={16} /> {saving ? "Saving..." : "Save"}</button></div>
  </form>;
}

function TeachersManager({ data, save, remove, notify }: { data: AdminData; save: (r: string, v: Record<string, unknown>) => Promise<void>; remove: (r: string, id: string) => Promise<void>; notify: (toast: Toast) => void }) {
  const blank = { name_mn: "", subject_mn: "", years_exp: 0, bio_mn: "", photo_url: "", is_featured: true, is_active: true, display_order: data.teachers.length + 1 };
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  return <section><AdminTitle title="Teachers Manager" action={<button className="admin-primary" onClick={() => setEditing(blank)}>Add Teacher</button>} />
    <div className="teacher-admin-grid">{data.teachers.map(t => <button key={t.id} className="teacher-admin-card" onClick={() => setEditing(t as unknown as Record<string, unknown>)}><div>{t.photo_url ? <img src={t.photo_url} /> : t.name_mn.slice(0, 2)}</div><strong>{t.name_mn}</strong><span>{t.subject_mn}</span></button>)}</div>
    {editing && <div className="admin-panel"><TeacherForm record={editing} onCancel={() => setEditing(null)} onDelete={() => editing.id && remove("teachers", String(editing.id))} onSave={async record => { await save("teachers", record); setEditing(null); }} notify={notify} /></div>}
  </section>;
}

function TeacherForm({ record, onSave, onCancel, onDelete, notify }: { record: Record<string, unknown>; onSave: (record: Record<string, unknown>) => Promise<void>; onCancel: () => void; onDelete: () => void; notify: (toast: Toast) => void }) {
  const [form, setForm] = useState(record);
  const set = (key: string, value: unknown) => setForm(prev => ({ ...prev, [key]: value }));
  return <form className="admin-form" onSubmit={async e => { e.preventDefault(); await onSave(form); }}>
    <Field label="Full name"><input value={String(form.name_mn || "")} onChange={e => set("name_mn", e.target.value)} required /></Field>
    <Field label="Subject"><input value={String(form.subject_mn || "")} onChange={e => set("subject_mn", e.target.value)} required /></Field>
    <Field label="Years of experience"><input type="number" value={Number(form.years_exp || 0)} onChange={e => set("years_exp", Number(e.target.value))} /></Field>
    <Field label="Bio"><textarea value={String(form.bio_mn || "")} onChange={e => set("bio_mn", e.target.value)} /></Field>
    <Field label="Photo"><UploadField bucket="teacher-photos" prefix="teachers" circular value={String(form.photo_url || "")} onChange={url => set("photo_url", url)} notify={notify} /></Field>
    <label><input type="checkbox" checked={Boolean(form.is_featured)} onChange={e => set("is_featured", e.target.checked)} /> Featured</label>
    <label><input type="checkbox" checked={Boolean(form.is_active)} onChange={e => set("is_active", e.target.checked)} /> Active</label>
    <Field label="Display order"><input type="number" value={Number(form.display_order || 0)} onChange={e => set("display_order", Number(e.target.value))} /></Field>
    <div className="admin-actions"><button type="button" onClick={onCancel}>Cancel</button>{Boolean(form.id) && <button type="button" onClick={onDelete}><Trash2 size={16} /> Delete</button>}<button className="admin-primary">Save</button></div>
  </form>;
}

function AchievementsManager({ data, save, remove, notify }: { data: AdminData; save: (r: string, v: Record<string, unknown>) => Promise<void>; remove: (r: string, id: string) => Promise<void>; notify: (toast: Toast) => void }) {
  const [yearForm, setYearForm] = useState<Record<string, unknown>>({ year: new Date().getFullYear(), highlight_mn: "", description_mn: "", is_milestone: false });
  const [selectedYear, setSelectedYear] = useState(data.years[0]?.id || "");
  const [achievement, setAchievement] = useState<Record<string, unknown>>({ year_id: selectedYear, category_id: data.achievementCategories[0]?.id || "", title_mn: "", description_mn: "" });
  const grouped = useMemo(() => {
    const groups = new Map<string, Record<string, unknown>[]>();
    for (const item of data.achievements.filter(a => a.year_id === selectedYear)) {
      const category = (item.category as { name_mn?: string } | undefined)?.name_mn || "Ангилалгүй";
      groups.set(category, [...(groups.get(category) || []), item]);
    }
    return Array.from(groups.entries());
  }, [data.achievements, selectedYear]);
  const newAchievement = () => setAchievement({ year_id: selectedYear, category_id: data.achievementCategories[0]?.id || "", title_mn: "", description_mn: "", is_published: true });

  return <section><AdminTitle title="Achievements Manager" action={null} />
    <div className="admin-split achievements-admin-split"><div><h2>Timeline Years</h2><button className="admin-primary" onClick={() => setYearForm({ year: new Date().getFullYear(), highlight_mn: "", description_mn: "", is_milestone: false })}>Add Year</button>
      <div className="admin-list">{data.years.map(y => <button className={selectedYear === y.id ? "active" : ""} key={y.id} onClick={() => { setYearForm(y as unknown as Record<string, unknown>); setSelectedYear(y.id); setAchievement(a => ({ ...a, year_id: y.id })); }}>{y.year} · {y.highlight_mn}<span>Edit</span></button>)}</div>
      <form className="admin-form" onSubmit={async e => { e.preventDefault(); await save("years", yearForm); }}>
        <Field label="Year"><input type="number" min={1940} max={2030} value={Number(yearForm.year || "")} onChange={e => setYearForm(f => ({ ...f, year: Number(e.target.value) }))} /></Field>
        <Field label="Highlight text (Mongolian)"><input value={String(yearForm.highlight_mn || "")} onChange={e => setYearForm(f => ({ ...f, highlight_mn: e.target.value }))} /></Field>
        <Field label="Full description (Mongolian)"><textarea value={String(yearForm.description_mn || "")} onChange={e => setYearForm(f => ({ ...f, description_mn: e.target.value }))} /></Field>
        <Field label="Image"><UploadField bucket="achievement-images" prefix="years" value={String(yearForm.image_url || "")} onChange={url => setYearForm(f => ({ ...f, image_url: url }))} notify={notify} /></Field>
        <label><input type="checkbox" checked={Boolean(yearForm.is_milestone)} onChange={e => setYearForm(f => ({ ...f, is_milestone: e.target.checked }))} /> Milestone</label>
        <button className="admin-primary">Save Year</button>
      </form></div>
      <div><h2>Achievements Per Year</h2><Field label="Selected year"><select value={selectedYear} onChange={e => { setSelectedYear(e.target.value); setAchievement(a => ({ ...a, year_id: e.target.value })); }}>{data.years.map(y => <option key={y.id} value={y.id}>{y.year}</option>)}</select></Field>
      <button className="admin-primary" type="button" onClick={newAchievement}>Add Achievement</button>
      <form className="admin-form" onSubmit={async e => { e.preventDefault(); await save("achievements", achievement); }}>
        <Field label="Select category"><select value={String(achievement.category_id || "")} onChange={e => setAchievement(a => ({ ...a, category_id: e.target.value }))}>{data.achievementCategories.map(c => <option key={c.id} value={c.id}>{c.name_mn}</option>)}</select></Field>
        <Field label="Title (Mongolian)"><input value={String(achievement.title_mn || "")} onChange={e => setAchievement(a => ({ ...a, title_mn: e.target.value }))} /></Field>
        <Field label="Description (Mongolian)"><textarea value={String(achievement.description_mn || "")} onChange={e => setAchievement(a => ({ ...a, description_mn: e.target.value }))} /></Field>
        <Field label="Image"><UploadField bucket="achievement-images" prefix="achievements" value={String(achievement.image_url || "")} onChange={url => setAchievement(a => ({ ...a, image_url: url }))} notify={notify} /></Field>
        <button className="admin-primary">Save Achievement</button>
      </form>
      <div className="admin-list grouped-achievement-list">
        {grouped.length ? grouped.map(([category, records]) => (
          <section key={category}>
            <h3>{category}</h3>
            {records.map(a => <button key={String(a.id)} onClick={() => setAchievement(a)}>{String(a.title_mn)} <span onClick={e => { e.stopPropagation(); remove("achievements", String(a.id)); }}>Delete</span></button>)}
          </section>
        )) : <p>No achievements for this year yet.</p>}
      </div></div></div>
  </section>;
}

function CoursesManager({ data, save, remove }: { data: AdminData; save: (r: string, v: Record<string, unknown>) => Promise<void>; remove: (r: string, id: string) => Promise<void> }) {
  const [sectionId, setSectionId] = useState(data.sections[0]?.id || "");
  const [form, setForm] = useState<Record<string, unknown>>({ section_id: sectionId, title_mn: "", short_desc_mn: "", full_desc_mn: "", teacher_name: "", schedule_mn: "", location_mn: "", max_students: null, tags: "" });
  const items = data.courseItems.filter(item => item.section_id === sectionId);
  return <section><AdminTitle title="Courses Manager" action={<button className="admin-primary" onClick={() => setForm({ section_id: sectionId, title_mn: "" })}>Add Item</button>} />
    <div className="admin-tabs">{data.sections.map(s => <button key={s.id} className={sectionId === s.id ? "active" : ""} onClick={() => { setSectionId(s.id); setForm({ section_id: s.id, title_mn: "" }); }}>{s.title_mn}</button>)}</div>
    <div className="admin-split"><div className="admin-list">{items.map(item => <button key={item.id} onClick={() => setForm(item as unknown as Record<string, unknown>)}>{item.title_mn}<span onClick={e => { e.stopPropagation(); remove("courseItems", item.id); }}>Delete</span></button>)}</div>
    <form className="admin-form" onSubmit={async e => { e.preventDefault(); await save("courseItems", { ...form, section_id: sectionId, tags: String(form.tags || "").split(",").map(t => t.trim()).filter(Boolean) }); }}>
      {["title_mn", "short_desc_mn", "full_desc_mn", "teacher_name", "schedule_mn", "location_mn"].map(key => <Field key={key} label={key}><textarea value={String(form[key] || "")} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} /></Field>)}
      <Field label="Max students"><input type="number" value={Number(form.max_students || 0)} onChange={e => setForm(f => ({ ...f, max_students: Number(e.target.value) }))} /></Field>
      <Field label="Tags"><input value={Array.isArray(form.tags) ? form.tags.join(", ") : String(form.tags || "")} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} /></Field>
      <button className="admin-primary">Save</button>
    </form></div>
  </section>;
}

function ApplicationsManager({ data, save, remove, reload, notify }: { data: AdminData; save: (r: string, v: Record<string, unknown>) => Promise<void>; remove: (r: string, id: string) => Promise<void>; reload: () => Promise<void>; notify: (toast: Toast) => void }) {
  const [form, setForm] = useState<Record<string, unknown>>({ code: "", student_name: "", status: "pending", message_mn: "", academic_year: "2024-2025", grade_applying: "" });
  const [year, setYear] = useState("");
  const [status, setStatus] = useState("");
  const [csvRows, setCsvRows] = useState<Record<string, unknown>[]>([]);
  const rows = data.applications.filter(a => (!year || a.academic_year === year) && (!status || a.status === status));
  const years = [...new Set(data.applications.map(a => a.academic_year))];
  const exportRows = () => {
    const blob = new Blob([toCsv(rows as unknown as Record<string, unknown>[])], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "application-codes.csv"; a.click();
  };
  return <section><AdminTitle title="Application Codes" action={<div><button onClick={exportRows}>Export CSV</button><button className="admin-primary" onClick={() => setForm({ code: "", status: "pending", academic_year: "2024-2025" })}>Add Single Code</button></div>} />
    <div className="admin-filters"><select value={year} onChange={e => setYear(e.target.value)}><option value="">All years</option>{years.map(y => <option key={y} value={y}>{y}</option>)}</select><select value={status} onChange={e => setStatus(e.target.value)}><option value="">All statuses</option>{["accepted", "pending", "waitlisted", "rejected", "incomplete"].map(s => <option key={s}>{s}</option>)}</select></div>
    <table className="admin-table"><thead><tr><th>Code</th><th>Student</th><th>Status</th><th>Year</th><th /></tr></thead><tbody>{rows.map(row => <tr key={row.id}><td>{row.code}</td><td>{row.student_name}</td><td>{row.status}</td><td>{row.academic_year}</td><td><button onClick={() => setForm(row as unknown as Record<string, unknown>)}>Edit</button><button onClick={() => remove("applications", row.id)}>Delete</button></td></tr>)}</tbody></table>
    <div className="admin-split"><form className="admin-form" onSubmit={async e => { e.preventDefault(); await save("applications", { ...form, code: String(form.code || "").toUpperCase() }); }}>
      <Field label="Code"><input maxLength={8} value={String(form.code || "")} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} /></Field>
      <Field label="Student name"><input value={String(form.student_name || "")} onChange={e => setForm(f => ({ ...f, student_name: e.target.value }))} /></Field>
      <Field label="Status"><select value={String(form.status || "pending")} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>{["accepted", "pending", "waitlisted", "rejected", "incomplete"].map(s => <option key={s}>{s}</option>)}</select></Field>
      <Field label="Message"><textarea value={String(form.message_mn || "")} onChange={e => setForm(f => ({ ...f, message_mn: e.target.value }))} /></Field>
      <Field label="Academic year"><input value={String(form.academic_year || "")} onChange={e => setForm(f => ({ ...f, academic_year: e.target.value }))} /></Field>
      <Field label="Grade applying"><input type="number" value={Number(form.grade_applying || 0)} onChange={e => setForm(f => ({ ...f, grade_applying: Number(e.target.value) }))} /></Field>
      <button className="admin-primary">Save Code</button>
    </form><div className="admin-form"><h2>Bulk Import</h2><textarea placeholder="code,student_name,status,message_mn,academic_year" onChange={e => setCsvRows(parseCsv(e.target.value))} /><input type="file" accept=".csv" onChange={async e => { const file = e.target.files?.[0]; if (file) setCsvRows(parseCsv(await file.text())); }} /> <small>{csvRows.length} rows ready</small><button className="admin-primary" onClick={async () => { await api("/api/admin/bulk-applications", { method: "POST", body: JSON.stringify({ rows: csvRows }) }); notify({ kind: "success", text: "Imported" }); await reload(); }}>Import</button></div></div>
  </section>;
}

function SettingsManager({ data, save, notify }: { data: AdminData; save: (r: string, v: Record<string, unknown>) => Promise<void>; notify: (toast: Toast) => void }) {
  const [form, setForm] = useState<Record<string, unknown>>(data.settings as unknown as Record<string, unknown> || {});
  const fields = ["school_name_mn", "school_name_en", "student_count", "teacher_count", "club_count", "address_mn", "phone", "email", "facebook_url", "instagram_url", "youtube_url"];
  return <section><AdminTitle title="School Settings" action={null} /><form className="admin-form wide" onSubmit={async e => { e.preventDefault(); await save("settings", form); }}>
    {fields.map(key => <Field key={key} label={key}><input value={String(form[key] || "")} onChange={e => setForm(f => ({ ...f, [key]: ["student_count", "teacher_count", "club_count"].includes(key) ? Number(e.target.value) : e.target.value }))} /></Field>)}
    <Field label="Hero background image"><UploadField bucket="site-assets" prefix="hero" value={String(form.hero_image_url || "")} onChange={url => setForm(f => ({ ...f, hero_image_url: url }))} notify={notify} /></Field>
    <button className="admin-primary">Save Settings</button>
  </form></section>;
}
