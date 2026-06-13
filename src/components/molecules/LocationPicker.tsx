"use client";

import { useState, useRef, useEffect } from "react";
import { KOREA_LOCATIONS } from "@/data/koreaLocations";

interface Props {
  label: string;
  onSelect: (filterVal: string, label: string) => void;
  onClear: () => void;
}

type Step = "si" | "gu" | "dong";

export default function LocationPicker({ label, onSelect, onClear }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedSi, setSelectedSi] = useState("");
  const [selectedGu, setSelectedGu] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isActive = label !== "전국";
  const siData = KOREA_LOCATIONS.find((s) => s.si === selectedSi);
  const guData = siData?.gus.find((g) => g.gu === selectedGu);
  const step: Step = !selectedSi ? "si" : !selectedGu ? "gu" : "dong";

  const handleOpen = () => {
    if (!open) { setSelectedSi(""); setSelectedGu(""); }
    setOpen((v) => !v);
  };

  const handleGu = (gu: string) => {
    const gd = siData?.gus.find((g) => g.gu === gu);
    if (!gd?.dongs || gd.dongs.length === 0) {
      onSelect(gu, `${selectedSi} ${gu}`);
      setOpen(false);
    } else {
      setSelectedGu(gu);
    }
  };

  const goBack = () => {
    if (step === "dong") setSelectedGu("");
    else setSelectedSi("");
  };

  const headerLabel =
    step === "si" ? "시/도 선택"
    : step === "gu" ? selectedSi
    : `${selectedSi} · ${selectedGu}`;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className={`flex items-center gap-1.5 h-9 px-3.5 rounded-full border text-[14px] font-semibold cursor-pointer transition-colors whitespace-nowrap ${
          isActive
            ? "bg-brand text-white border-brand"
            : "bg-white text-text-body border-border-base hover:border-brand"
        }`}
      >
        <span>📍</span>
        <span>{label}</span>
        {isActive && (
          <span
            role="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
              setSelectedSi("");
              setSelectedGu("");
              setOpen(false);
            }}
            className="opacity-70 hover:opacity-100 cursor-pointer"
          >
            ✕
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1 z-50 bg-white rounded-2xl shadow-lg border border-border-base overflow-hidden"
          style={{ width: "260px" }}
        >
          {/* 헤더 */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border-header bg-surface-card shrink-0">
            {step !== "si" && (
              <button
                onClick={goBack}
                className="text-brand text-[13px] cursor-pointer border-none bg-transparent hover:underline shrink-0 font-semibold"
              >
                ←
              </button>
            )}
            <span className="text-[13px] font-semibold text-text-body flex-1 truncate">
              {headerLabel}
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-text-muted border-none bg-transparent cursor-pointer hover:text-text-body text-[13px] shrink-0"
            >
              ✕
            </button>
          </div>

          {/* 목록 */}
          <ul className="list-none m-0 p-0 overflow-y-auto" style={{ maxHeight: "280px", scrollbarWidth: "none" }}>
            {step === "si" && (
              <>
                <li>
                  <button
                    onClick={() => { onSelect("", "전국"); setOpen(false); }}
                    className="w-full text-left px-4 py-3 text-[14px] text-text-muted hover:bg-surface-card border-none bg-transparent cursor-pointer border-b border-border-header"
                  >
                    🌏 전국
                  </button>
                </li>
                {KOREA_LOCATIONS.map((loc) => (
                  <li key={loc.si}>
                    <button
                      onClick={() => setSelectedSi(loc.si)}
                      className="w-full text-left px-4 py-3 text-[14px] font-medium text-text-body hover:bg-surface-card border-none bg-transparent cursor-pointer border-b border-border-header last:border-0 flex items-center justify-between"
                    >
                      <span>{loc.si}</span>
                      <span className="text-text-placeholder text-[12px]">›</span>
                    </button>
                  </li>
                ))}
              </>
            )}

            {step === "gu" && siData && (
              <>
                <li>
                  <button
                    onClick={() => { onSelect(selectedSi, selectedSi); setOpen(false); }}
                    className="w-full text-left px-4 py-3 text-[14px] text-text-muted hover:bg-surface-card border-none bg-transparent cursor-pointer border-b border-border-header"
                  >
                    {selectedSi} 전체
                  </button>
                </li>
                {siData.gus.map((g) => (
                  <li key={g.gu}>
                    <button
                      onClick={() => handleGu(g.gu)}
                      className="w-full text-left px-4 py-3 text-[14px] font-medium text-text-body hover:bg-surface-card border-none bg-transparent cursor-pointer border-b border-border-header last:border-0 flex items-center justify-between"
                    >
                      <span>{g.gu}</span>
                      {g.dongs && g.dongs.length > 0 && (
                        <span className="text-text-placeholder text-[12px]">›</span>
                      )}
                    </button>
                  </li>
                ))}
              </>
            )}

            {step === "dong" && guData && (
              <>
                <li>
                  <button
                    onClick={() => { onSelect(selectedGu, `${selectedSi} ${selectedGu}`); setOpen(false); }}
                    className="w-full text-left px-4 py-3 text-[14px] text-text-muted hover:bg-surface-card border-none bg-transparent cursor-pointer border-b border-border-header"
                  >
                    {selectedGu} 전체
                  </button>
                </li>
                {guData.dongs?.map((dong) => (
                  <li key={dong}>
                    <button
                      onClick={() => { onSelect(dong, `${selectedSi} ${selectedGu} ${dong}`); setOpen(false); }}
                      className="w-full text-left px-4 py-3 text-[14px] font-medium text-text-body hover:bg-surface-card border-none bg-transparent cursor-pointer border-b border-border-header last:border-0"
                    >
                      {dong}
                    </button>
                  </li>
                ))}
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
