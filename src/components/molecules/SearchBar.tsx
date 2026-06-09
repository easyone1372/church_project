import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import RpButton from "@/components/atom/RpButton";
import micIcon from "@/styles/mic_icon.png";

interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: ISpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface ISpeechRecognitionEvent {
  results: { 0: { transcript: string } }[];
}

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
}

export default function SearchBar({ value, onChange, onSearch }: SearchBarProps) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  useEffect(() => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.lang = "ko-KR";
    rec.continuous = false;
    rec.interimResults = false;

    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      onChange(transcript);
      setIsListening(false);
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);

    recognitionRef.current = rec;

    return () => {
      rec.abort();
    };
  }, [onChange]);

  const handleMicClick = () => {
    const rec = recognitionRef.current;
    if (!rec) {
      alert("이 브라우저는 음성 입력을 지원하지 않아요.");
      return;
    }
    if (isListening) {
      rec.stop();
      setIsListening(false);
    } else {
      rec.start();
      setIsListening(true);
    }
  };

  return (
    <div
      className="w-full mx-auto h-14 sm:h-16 px-4 sm:px-5 bg-white border border-border-base rounded-full shadow-search flex items-center gap-2 sm:gap-3"
      style={{ maxWidth: "var(--max-w-search)" }}
    >
      <div className="hidden sm:flex shrink-0 pr-4 border-r border-border-divider text-base font-bold text-brand">
        ✦ AI 검색
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSearch();
        }}
        placeholder={isListening ? "듣는 중..." : "레슨, 악기, 선생님, 모임 검색…"}
        className="flex-1 min-w-0 border-none outline-none text-[15px] sm:text-base text-text-body bg-transparent placeholder-text-placeholder"
      />
      <button
        onClick={handleMicClick}
        title={isListening ? "음성 입력 중지" : "음성으로 검색"}
        className={`shrink-0 border-none bg-transparent cursor-pointer transition-all flex items-center justify-center ${
          isListening ? "animate-pulse scale-110 opacity-50" : "opacity-30 hover:opacity-70"
        }`}
      >
        <Image src={micIcon} alt="음성 검색" width={18} height={18} />
      </button>
      <RpButton variant="round" onClick={onSearch} className="shrink-0">
        →
      </RpButton>
    </div>
  );
}
