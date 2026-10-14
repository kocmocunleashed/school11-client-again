"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { PublicPageData } from "@/lib/public-page-data";
import { MOCK_ADMIN_CHANGE_EVENT, MOCK_ADMIN_STORAGE_KEY } from "@/lib/admin/mock-events";
import { createPublicDataRefresh } from "@/lib/public-data-refresh";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

const Context = createContext<PublicPageData | null>(null);
export function useSiteData() {
  const value = useContext(Context);
  if (!value) throw new Error("Site data provider is missing");
  return value;
}
export function SiteDataProvider({ initial, children }: { initial: PublicPageData; children: ReactNode }) {
  const [snapshot, setSnapshot] = useState({ source: initial, value: initial });
  // Adopt a new server payload immediately, while retaining client refreshes
  // for the current payload. No duplicate fetch is needed after router refresh.
  const data = snapshot.source === initial ? snapshot.value : initial;
  useEffect(() => {
    let active = true;
    const apply = (value: PublicPageData) => setSnapshot({ source: initial, value });
    const live = createPublicDataRefresh(apply, fetch, `/api/site-data?page=${initial.page}`);
    const sync = () => {
      if (initial.preview) {
        void import("@/lib/admin/mock-public-data").then(({ readMockPublicData }) => {
          if (active) apply(readMockPublicData(initial.page) || initial);
        }).catch(() => { /* Storage may be unavailable; keep the server preview. */ });
      } else {
        void live.refresh();
      }
    };
    // Live content already arrived with SSR. Only browser-local preview needs
    // a mount read; navigation brings a new server payload and focus refreshes live content.
    const frame = initial.preview ? requestAnimationFrame(sync) : null;
    const onStorage = (event: StorageEvent) => {
      if (event.key === MOCK_ADMIN_STORAGE_KEY || event.key === null) sync();
    };
    window.addEventListener("focus", sync);
    if (initial.preview) {
      window.addEventListener(MOCK_ADMIN_CHANGE_EVENT, sync);
      window.addEventListener("storage", onStorage);
    }
    return () => {
      active = false;
      live.dispose();
      if (frame !== null) cancelAnimationFrame(frame);
      window.removeEventListener("focus", sync);
      window.removeEventListener(MOCK_ADMIN_CHANGE_EVENT, sync);
      window.removeEventListener("storage", onStorage);
    };
  }, [initial]);
  return <Context.Provider value={data}><div className="public-site"><a className="skip-link" href="#main-content">Үндсэн агуулга руу очих</a><SiteHeader schoolName={data.settings.school_name_mn} logo={data.settings.logo_url} />{data.preview && <p className="preview-notice">Танилцуулгын хувилбар · Жишээ мэдээлэл. Удирдлагын туршилтын өөрчлөлт энэ хөтөчид харагдана.</p>}{children}<SiteFooter settings={data.settings} /></div></Context.Provider>;
}
