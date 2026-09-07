"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { mockPublicData, type PublicSiteData } from "@/lib/public-data";
import { MOCK_ADMIN_CHANGE_EVENT, MOCK_ADMIN_STORAGE_KEY, readStoredMockAdminDatabase } from "@/lib/admin/mock-database";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

const Context = createContext<PublicSiteData | null>(null);
export function useSiteData() {
  const value = useContext(Context);
  if (!value) throw new Error("Site data provider is missing");
  return value;
}
export function SiteDataProvider({ initial, children }: { initial: PublicSiteData; children: ReactNode }) {
  const [data, setData] = useState(initial);
  const pathname = usePathname();
  useEffect(() => {
    let active = true;
    const sync = () => {
      if (initial.preview) {
        const stored = readStoredMockAdminDatabase();
        setData(stored ? mockPublicData(stored) : initial);
      } else {
        void fetch("/api/site-data", { cache: "no-store" }).then(response => { if (!response.ok) throw new Error("Content refresh failed"); return response.json(); }).then(next => { if (active) setData(next); }).catch(() => { /* Keep the last successful view during a transient refresh failure. */ });
      }
    };
    const frame = requestAnimationFrame(sync);
    const onStorage = (event: StorageEvent) => { if (event.key === MOCK_ADMIN_STORAGE_KEY) sync(); };
    window.addEventListener("focus", sync);
    if (initial.preview) { window.addEventListener(MOCK_ADMIN_CHANGE_EVENT, sync); window.addEventListener("storage", onStorage); }
    return () => { active = false; cancelAnimationFrame(frame); window.removeEventListener("focus", sync); window.removeEventListener(MOCK_ADMIN_CHANGE_EVENT, sync); window.removeEventListener("storage", onStorage); };
  }, [initial, pathname]);
  return <Context.Provider value={data}><div className="public-site"><a className="skip-link" href="#main-content">Үндсэн агуулга руу очих</a><SiteHeader schoolName={data.settings.school_name_mn} logo={data.settings.logo_url} city={data.settings.city} />{data.preview && <p className="preview-notice">Танилцуулгын хувилбар · Жишээ мэдээлэл. Удирдлагын туршилтын өөрчлөлт энэ хөтөчид харагдана.</p>}{children}<SiteFooter settings={data.settings} /></div></Context.Provider>;
}
