"use client";

import { useState, useRef } from "react";
import { SLIDER_MAX } from "@/data/postOptions";

const STEP = 10_000;

function fmt(n: number): string {
  if (n <= 0) return "0원";
  if (n >= SLIDER_MAX) return "200만원 이상";
  return `${n / 10_000}만원`;
}

interface EditableValueProps {
  value: number;
  onCommit: (num: number) => void;
  align?: "left" | "right";
}

function EditableValue({ value, onCommit, align = "left" }: EditableValueProps) {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState("");

  const commit = () => {
    const num = parseInt(inputVal.replace(/[^0-9]/g, ""), 10);
    if (!isNaN(num)) onCommit(num);
    setEditing(false);
    setInputVal("");
  };

  if (editing) {
    return (
      <input
        type="text"
        autoFocus
        value={inputVal}
        maxLength={16}
        onChange={(e) => setInputVal(e.target.value.replace(/[^0-9]/g, ""))}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
        placeholder="직접 입력"
        className={`w-24 text-[12px] font-semibold text-brand border-b border-brand outline-none bg-transparent placeholder:text-text-placeholder ${align === "right" ? "text-right" : "text-left"}`}
      />
    );
  }

  return (
    <button
      onClick={() => { setEditing(true); setInputVal(value <= 0 || value >= SLIDER_MAX ? "" : String(value)); }}
      className="text-[12px] font-semibold text-brand border-none bg-transparent cursor-pointer hover:underline"
    >
      {fmt(value)} ✎
    </button>
  );
}

interface PriceRangeSliderProps {
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export default function PriceRangeSlider({ value, onChange }: PriceRangeSliderProps) {
  const [lo, hi] = value;
  const trackRef = useRef<HTMLDivElement>(null);
  const loRef = useRef(lo);
  const hiRef = useRef(hi);
  loRef.current = lo;
  hiRef.current = hi;

  const getVal = (clientX: number): number => {
    const rect = trackRef.current!.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round((pct * SLIDER_MAX) / STEP) * STEP;
  };

  const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clickVal = getVal(clientX);
    const target =
      Math.abs(clickVal - loRef.current) <= Math.abs(clickVal - hiRef.current)
        ? "lo"
        : "hi";

    const onMove = (me: MouseEvent | TouchEvent) => {
      const cx = "touches" in me ? (me as TouchEvent).touches[0].clientX : (me as MouseEvent).clientX;
      const v = getVal(cx);
      if (target === "lo") {
        onChange([Math.min(v, hiRef.current - STEP), hiRef.current]);
      } else {
        onChange([loRef.current, Math.max(v, loRef.current + STEP)]);
      }
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
  };

  const loPct = (lo / SLIDER_MAX) * 100;
  const hiPct = (hi / SLIDER_MAX) * 100;

  return (
    <div className="px-1">
      <div className="flex items-center justify-between mb-3">
        <EditableValue
          value={lo}
          onCommit={(n) => onChange([Math.min(n, hi - STEP), hi])}
          align="left"
        />
        <span className="text-[11px] text-text-muted mx-1">~</span>
        <EditableValue
          value={hi}
          onCommit={(n) => onChange([lo, Math.max(Math.min(n, SLIDER_MAX), lo + STEP)])}
          align="right"
        />
      </div>

      <div
        ref={trackRef}
        className="relative h-5 flex items-center cursor-pointer select-none"
        onMouseDown={startDrag}
        onTouchStart={startDrag}
      >
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-border-base" />
        <div
          className="absolute h-1.5 rounded-full bg-brand"
          style={{ left: `${loPct}%`, right: `${100 - hiPct}%` }}
        />
        <div
          className="absolute w-4 h-4 rounded-full bg-brand border-2 border-white shadow-md"
          style={{ left: `calc(${loPct}% - 8px)` }}
        />
        <div
          className="absolute w-4 h-4 rounded-full bg-brand border-2 border-white shadow-md"
          style={{ left: `calc(${hiPct}% - 8px)` }}
        />
      </div>
    </div>
  );
}
