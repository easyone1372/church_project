"use client";

import { useState, useRef, useEffect } from "react";
import { extractKeywords } from "@/lib/mapUtils";

interface MapSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
}

type MicStatus = "idle" | "requesting" | "listening";

export default function MapSearchBar({ value, onChange, onSearch, onClear }: MapSearchBarProps) {
  const [micStatus, setMicStatus] = useState<MicStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const recRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => () => {
    recRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(""), 6000);
  };

  const startListening = async () => {
    if (micStatus !== "idle") return;

    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!SR) {
      showError("이 브라우저는 음성 인식을 지원하지 않아요. Chrome을 사용해 주세요.");
      return;
    }

    setMicStatus("requesting");

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
    } catch (err: any) {
      setMicStatus("idle");
      console.error("[Mic] getUserMedia error:", err?.name, err?.message);
      if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
        showError("마이크 권한이 차단됐어요. 주소창 🔒 → 마이크 → 허용");
      } else if (err?.name === "NotFoundError") {
        showError("마이크를 찾을 수 없어요.");
      } else {
        showError(`마이크 오류: ${err?.name ?? "알 수 없음"}`);
      }
      return;
    }

    const rec = new SR();
    rec.lang = "ko-KR";
    rec.continuous = true;
    rec.interimResults = true;

    let accumulated = "";

    rec.onresult = (e: any) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) accumulated += e.results[i][0].transcript;
      }
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (!e.results[i].isFinal) interim += e.results[i][0].transcript;
      }
      const live = (accumulated + interim).trim();
      if (live) onChangeRef.current(live);
    };

    rec.onerror = (e: any) => {
      console.error("[Mic] SpeechRecognition error:", e.error);
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setMicStatus("idle");
      if (recRef.current === rec) recRef.current = null;
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        showError("마이크 권한이 차단됐어요. 주소창 🔒 → 마이크 → 허용");
      } else if (e.error !== "aborted") {
        showError(`음성 인식 오류: ${e.error}`);
      }
    };

    rec.onend = () => {
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (accumulated.trim()) {
        const keywords = extractKeywords(accumulated.trim().toLowerCase());
        onChangeRef.current(keywords.length > 0 ? keywords.join(" ") : accumulated.trim());
      }
      setMicStatus("idle");
      if (recRef.current === rec) recRef.current = null;
    };

    recRef.current = rec;
    try {
      rec.start();
      setMicStatus("listening");
    } catch (err: any) {
      console.error("[Mic] rec.start() error:", err);
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setMicStatus("idle");
      showError(`음성 인식 시작 실패: ${err?.message ?? err}`);
    }
  };

  const stopListening = () => {
    recRef.current?.stop();
    recRef.current = null;
    setMicStatus("idle");
  };

  return (
    <div
      className="absolute z-10 top-4 left-4 right-4 md:right-auto flex flex-col gap-1.5"
      style={{ maxWidth: "420px" }}
    >
      <div className="flex items-center gap-2 bg-white rounded-full shadow-search px-4 border border-border-base" style={{ height: "48px" }}>
        <span className="text-sm font-bold text-brand shrink-0">✦</span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          placeholder={
            micStatus === "requesting" ? "마이크 권한 요청 중…" :
            micStatus === "listening"  ? "🎤 말씀해 주세요…" :
            "지역, 악기, 서비스로 검색"
          }
          className="flex-1 border-none outline-none text-xs text-text-body bg-transparent placeholder:text-text-placeholder"
        />
        {value && micStatus === "idle" && (
          <button onClick={onClear} className="text-text-muted hover:text-text-body text-2xs border-none bg-transparent cursor-pointer shrink-0">
            ✕
          </button>
        )}

        <button
          onClick={micStatus === "listening" ? stopListening : startListening}
          disabled={micStatus === "requesting"}
          title={micStatus === "listening" ? "음성 입력 중지" : "음성으로 검색"}
          className={`border-none cursor-pointer transition-all flex items-center justify-center rounded-full w-7 h-7 shrink-0 ${
            micStatus === "listening"  ? "bg-red-500 animate-pulse" :
            micStatus === "requesting" ? "bg-yellow-400 animate-pulse cursor-wait" :
            "bg-transparent text-text-muted hover:text-brand"
          }`}
        >
          {micStatus === "listening" ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
              <rect x="4" y="4" width="16" height="16" rx="2" />
            </svg>
          ) : micStatus === "requesting" ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="animate-spin">
              <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="3" strokeDasharray="28 56" />
            </svg>
          ) : (
            <span className="text-sm">🎤</span>
          )}
        </button>

        <button
          onClick={onSearch}
          className="w-8 h-8 rounded-full bg-brand text-white text-xs flex items-center justify-center border-none cursor-pointer hover:opacity-80 transition-opacity shrink-0"
        >
          →
        </button>
      </div>

      {/* 오류 메시지 */}
      {errorMsg && (
        <div className="px-4 py-2.5 bg-red-50 border border-red-200 rounded-2xl text-[11px] text-red-700 leading-relaxed shadow-sm">
          ⚠️ {errorMsg}
        </div>
      )}
    </div>
  );
}
