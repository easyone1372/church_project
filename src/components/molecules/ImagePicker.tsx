"use client";

import { useRef } from "react";
import { EMOJIS } from "@/data/postOptions";

interface ImagePickerProps {
  mode: "emoji" | "image";
  emoji: string;
  imageUrl: string | null;
  onModeChange: (mode: "emoji" | "image") => void;
  onEmojiChange: (emoji: string) => void;
  onImageChange: (url: string) => void;
  onImageClear: () => void;
}

export default function ImagePicker({
  mode,
  emoji,
  imageUrl,
  onModeChange,
  onEmojiChange,
  onImageChange,
  onImageClear,
}: ImagePickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onImageChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* 탭 */}
      <div className="flex gap-1 p-1 bg-surface-card rounded-lg w-fit">
        {(["emoji", "image"] as const).map((m) => (
          <button
            key={m}
            onClick={() => onModeChange(m)}
            className={`px-3 py-1 rounded-md text-2xs font-semibold border-none cursor-pointer transition-colors ${
              mode === m
                ? "bg-white text-text-primary shadow-sm"
                : "bg-transparent text-text-muted hover:text-text-body"
            }`}
          >
            {m === "emoji" ? "이모지" : "이미지 업로드"}
          </button>
        ))}
      </div>

      {/* 이모지 선택 */}
      {mode === "emoji" && (
        <div className="flex flex-wrap gap-2">
          {EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => onEmojiChange(e)}
              className={`w-9 h-9 rounded-lg text-base border cursor-pointer transition-colors ${
                emoji === e
                  ? "border-brand bg-brand-bg"
                  : "border-border-base bg-white hover:bg-surface-card"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      )}

      {/* 이미지 업로드 */}
      {mode === "image" && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {imageUrl ? (
            <div className="relative w-full h-36 rounded-xl overflow-hidden border border-border-base">
              <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
              <button
                onClick={() => {
                  onImageClear();
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white text-2xs border-none cursor-pointer flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-24 rounded-xl border-2 border-dashed border-border-base bg-surface-card text-text-muted text-xs cursor-pointer hover:border-brand hover:text-brand transition-colors flex flex-col items-center justify-center gap-1"
            >
              <span className="text-xl">+</span>
              <span>클릭하여 이미지 선택</span>
            </button>
          )}
        </>
      )}
    </div>
  );
}
