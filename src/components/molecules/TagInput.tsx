"use client";

import { useState, useRef, useEffect } from "react";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions: string[];
}

export default function TagInput({ tags, onChange, suggestions }: TagInputProps) {
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = input.trim()
    ? suggestions.filter(
        (s) =>
          s.toLowerCase().includes(input.trim().toLowerCase()) &&
          !tags.includes(s),
      )
    : [];

  const addTag = (tag: string) => {
    const trimmed = tag.trim().replace(/^#/, "");
    if (!trimmed || tags.includes(trimmed)) return;
    onChange([...tags, trimmed]);
    setInput("");
    setOpen(false);
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative flex flex-col gap-2">
      {/* 추가된 태그 */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-bg border border-brand text-[11px] font-semibold text-brand"
            >
              #{tag}
              <button
                onClick={() => removeTag(tag)}
                className="border-none bg-transparent cursor-pointer text-brand leading-none p-0 hover:opacity-60"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      {/* 입력창 */}
      <input
        type="text"
        value={input}
        onChange={(e) => { setInput(e.target.value); setOpen(true); }}
        onKeyDown={handleKeyDown}
        onFocus={() => input && setOpen(true)}
        placeholder="태그 입력 후 Enter (예: 기타, 레슨)"
        className="border border-border-base rounded-lg px-3 py-2 text-xs text-text-body outline-none placeholder:text-text-placeholder focus:border-brand transition-colors"
      />

      {/* 자동완성 드롭다운 */}
      {open && filtered.length > 0 && (
        <ul className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-border-base rounded-lg shadow-search overflow-hidden">
          {filtered.slice(0, 8).map((s) => (
            <li key={s}>
              <button
                onMouseDown={(e) => { e.preventDefault(); addTag(s); }}
                className="w-full text-left px-3 py-2 text-xs text-text-body hover:bg-surface-card cursor-pointer border-none bg-transparent"
              >
                <span className="text-brand font-semibold">#{s}</span>
                <span className="ml-2 text-text-placeholder text-[10px]">기존 태그</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
