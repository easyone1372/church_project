"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import RpButton from "@/components/atom/RpButton";
import micIcon from "@/styles/mic_icon.png";
import { extractKeywords } from "@/lib/mapUtils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (voiceQuery?: string) => void;
}

type MicStatus = "idle" | "requesting" | "listening";

export default function SearchBar({ value, onChange, onSearch }: SearchBarProps) {
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

    // 즉시 requesting 상태로 변경 → 버튼 시각 피드백
    setMicStatus("requesting");

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
    } catch (err: any) {
      setMicStatus("idle");
      console.error("[Mic] getUserMedia error:", err?.name, err?.message);
      if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
        showError("마이크 권한이 차단되어 있어요. 주소창 왼쪽 🔒 → 마이크 → 허용");
      } else if (err?.name === "NotFoundError") {
        showError("마이크를 찾을 수 없어요. 마이크가 연결되어 있는지 확인해 주세요.");
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
        showError("마이크 권한이 차단되어 있어요. 주소창 왼쪽 🔒 → 마이크 → 허용");
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
    <div className="flex flex-col gap-1.5" style={{ maxWidth: "var(--max-w-search)", width: "100%" }}>
      <div
        className="w-full mx-auto h-14 sm:h-16 px-4 sm:px-5 bg-white border border-border-base rounded-full shadow-search flex items-center gap-2 sm:gap-3"
      >
        <div className="hidden sm:flex shrink-0 pr-4 border-r border-border-divider text-base font-bold text-brand">
          ✦ AI 검색
        </div>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") onSearch(); }}
          placeholder={
            micStatus === "requesting" ? "마이크 권한 요청 중…" :
            micStatus === "listening"  ? "🎤 말씀해 주세요…" :
            "레슨, 악기, 선생님, 모임 검색…"
          }
          className="flex-1 min-w-0 border-none outline-none text-[15px] sm:text-base text-text-body bg-transparent placeholder-text-placeholder"
        />

        <button
          onClick={micStatus === "listening" ? stopListening : startListening}
          disabled={micStatus === "requesting"}
          title={micStatus === "listening" ? "음성 입력 중지" : "음성으로 검색"}
          className={`border-none cursor-pointer transition-all flex items-center justify-center rounded-full w-8 h-8 shrink-0 ${
            micStatus === "listening"  ? "bg-red-500 animate-pulse" :
            micStatus === "requesting" ? "bg-yellow-400 animate-pulse cursor-wait" :
            "bg-transparent opacity-40 hover:opacity-80"
          }`}
        >
          {micStatus === "listening" ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <rect x="4" y="4" width="16" height="16" rx="2" />
            </svg>
          ) : micStatus === "requesting" ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white" className="animate-spin">
              <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="3" fill="none" strokeDasharray="28 56" />
            </svg>
          ) : (
            <Image src={micIcon} alt="음성 검색" width={18} height={18} />
          )}
        </button>

        <RpButton variant="round" onClick={() => onSearch()} className="shrink-0">
          →
        </RpButton>
      </div>

      {/* 오류 메시지 — 검색창 아래 */}
      {errorMsg && (
        <div className="mx-4 px-4 py-2.5 bg-red-50 border border-red-200 rounded-2xl text-[12px] text-red-700 leading-relaxed">
          ⚠️ {errorMsg}
        </div>
      )}
    </div>
  );
}
