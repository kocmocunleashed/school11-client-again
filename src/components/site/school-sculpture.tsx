"use client";

import { useEffect, useRef } from "react";
import { Golos_Text } from "next/font/google";

const sculptureFont = Golos_Text({ subsets: ["latin"], display: "swap" });

/** A light, pointer-responsive typographic sculpture; no WebGL bundle. */
export function SchoolSculpture() {
  const sculpture = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = sculpture.current;
    if (!element) return;
    const area = element.closest<HTMLElement>(".arrival") || element;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    function reset() {
      element!.style.setProperty("--turn-x", "0deg");
      element!.style.setProperty("--turn-y", "0deg");
      element!.style.setProperty("--shift-x", "0px");
      element!.style.setProperty("--shift-y", "0px");
    }
    function move(event: PointerEvent) {
      if (event.pointerType !== "mouse" || reducedMotion.matches) return;
      const bounds = area.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
      const y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
      element!.style.setProperty("--turn-x", `${x * 8}deg`);
      element!.style.setProperty("--turn-y", `${-y * 6}deg`);
      element!.style.setProperty("--shift-x", `${x * 8}px`);
      element!.style.setProperty("--shift-y", `${y * 6}px`);
    }
    area.addEventListener("pointermove", move, { passive: true });
    area.addEventListener("pointerleave", reset);
    reducedMotion.addEventListener("change", reset);
    return () => {
      area.removeEventListener("pointermove", move);
      area.removeEventListener("pointerleave", reset);
      reducedMotion.removeEventListener("change", reset);
    };
  }, []);
  return <div className="school-sculpture" ref={sculpture} aria-hidden="true">
    <div className="sculpture-orbit orbit-one" /><div className="sculpture-orbit orbit-two" />
    <div className={`sculpture-number ${sculptureFont.className}`}>11</div>
    <div className="curiosity-stamp">СОНИУЧ<br />БАЙ.<svg viewBox="0 0 40 40"><path d="M7 20h26M20 7v26M11 11l18 18M11 29l18-18" /></svg></div>
    <span className="sculpture-formula">∞ боломж</span>
  </div>;
}
