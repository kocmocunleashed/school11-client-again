"use client";

import { useRef, type PointerEvent } from "react";

/** A light, pointer-responsive typographic sculpture; no WebGL bundle. */
export function SchoolSculpture() {
  const sculpture = useRef<HTMLDivElement>(null);
  function move(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    sculpture.current?.style.setProperty("--turn-x", `${(event.clientX - bounds.left - bounds.width / 2) / bounds.width * 14}deg`);
    sculpture.current?.style.setProperty("--turn-y", `${-(event.clientY - bounds.top - bounds.height / 2) / bounds.height * 10}deg`);
  }
  function reset() {
    sculpture.current?.style.setProperty("--turn-x", "0deg");
    sculpture.current?.style.setProperty("--turn-y", "0deg");
  }
  return <div className="school-sculpture" ref={sculpture} onPointerMove={move} onPointerLeave={reset} aria-hidden="true">
    <div className="sculpture-orbit orbit-one" /><div className="sculpture-orbit orbit-two" />
    <div className="sculpture-number">11</div>
    <div className="curiosity-stamp">СОНИУЧ<br />БАЙ.<svg viewBox="0 0 40 40"><path d="M7 20h26M20 7v26M11 11l18 18M11 29l18-18" /></svg></div>
    <span className="sculpture-formula">∞ боломж</span>
  </div>;
}
