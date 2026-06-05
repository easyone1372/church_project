"use client";

import { useState } from "react";
import { SearchResultItem } from "@/data/sampleMockResults";
import { WRITE_CATEGORIES } from "@/data/Categories";
import CategorySelector from "@/components/molecules/CategorySelector";
import ImagePicker from "@/components/molecules/ImagePicker";
import TagInput from "@/components/molecules/TagInput";
import RpInput from "@/components/atom/RpInput";
import LocationSearch from "@/components/molecules/LocationSearch";
import RpTextarea from "@/components/atom/RpTextarea";
import Field from "@/components/atom/Field";
import { ALL_KEYWORDS } from "@/data/sampleMockResults";
import { PRICE_TYPES, generatePriceDisplay } from "@/data/postOptions";

interface WritePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: Omit<SearchResultItem, "id">) => void;
}

export default function WritePostModal({
  isOpen,
  onClose,
  onSubmit,
}: WritePostModalProps) {
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(["lesson"]),
  );
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [priceType, setPriceType] = useState<string>("monthly");
  const [priceAmount, setPriceAmount] = useState("");
  const [iconMode, setIconMode] = useState<"emoji" | "image">("emoji");
  const [emoji, setEmoji] = useState("🎵");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);

  if (!isOpen) return null;

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size === 1) return prev;
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const currentPriceType = PRICE_TYPES.find((t) => t.id === priceType)!;

  const handleSubmit = () => {
    if (!title.trim() || !location.trim()) return;
    if (currentPriceType.hasAmount && !priceAmount.trim()) return;

    const selected = WRITE_CATEGORIES.filter((c) => selectedCategories.has(c.id));
    const tags = [...new Set(selected.flatMap((c) => c.tags))];
    const locationTags = location.trim().split(/[\s,]+/).filter((p) => p.length >= 2);

    onSubmit({
      title: title.trim(),
      category: selected.map((c) => c.label).join(" · "),
      location: location.trim(),
      locationTags: [...new Set(locationTags)],
      timeAgo: "방금 전",
      price: generatePriceDisplay(priceType, priceAmount),
      imageEmoji: emoji,
      imageUrl: iconMode === "image" && imageUrl ? imageUrl : undefined,
      tags,
      keywords,
      description: description.trim() || undefined,
    });

    setSelectedCategories(new Set(["lesson"]));
    setTitle("");
    setLocation("");
    setPriceType("monthly");
    setPriceAmount("");
    setEmoji("🎵");
    setImageUrl(null);
    setIconMode("emoji");
    setDescription("");
    setKeywords([]);
    onClose();
  };

  const isValid =
    title.trim() &&
    location.trim() &&
    (!currentPriceType.hasAmount || priceAmount.trim());

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full mx-4 flex flex-col"
        style={{
          maxWidth: "440px",
          maxHeight: "90vh",
          boxShadow: "0 24px 64px rgba(15,23,42,0.18)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-base shrink-0">
          <span className="text-md font-bold text-text-primary">
            새 글 작성
          </span>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-body text-lg border-none bg-transparent cursor-pointer leading-none"
          >
            ✕
          </button>
        </div>

        {/* 폼 */}
        <div className="px-6 py-5 flex flex-col gap-5 overflow-y-auto flex-1">
          <Field label="카테고리" required>
            <CategorySelector
              selected={selectedCategories}
              onToggle={toggleCategory}
            />
          </Field>

          <Field label="제목" required>
            <RpInput
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 기타 입문 레슨 모집합니다"
              maxLength={50}
            />
          </Field>

          <Field label="지역" required>
            <LocationSearch
              value={location}
              onChange={setLocation}
              onSelect={(place) => {
                setLocation(place.roadAddress || place.address);
              }}
              placeholder="예: 검암동 투썸플레이스, 마포구"
            />
          </Field>

          <Field label="가격" required>
            <div className="flex flex-wrap gap-2">
              {PRICE_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setPriceType(t.id)}
                  className={`px-3 py-1.5 rounded-full text-2xs font-semibold border cursor-pointer transition-colors ${
                    priceType === t.id
                      ? "bg-brand text-white border-brand"
                      : "bg-white text-text-muted border-border-base hover:border-brand hover:text-brand"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {currentPriceType.hasAmount && (
              <div className="flex items-center gap-2 mt-2">
                <RpInput
                  type="text"
                  value={priceAmount}
                  onChange={(e) => setPriceAmount(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="금액을 입력하세요"
                  className="flex-1"
                />
                <span className="text-xs text-text-muted shrink-0">원</span>
              </div>
            )}
          </Field>

          <Field label="해시태그">
            <TagInput
              tags={keywords}
              onChange={setKeywords}
              suggestions={ALL_KEYWORDS}
            />
          </Field>

          <Field label="기타 사항">
            <RpTextarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="상세 내용, 연락 방법, 기타 안내 사항을 자유롭게 작성해 주세요."
              maxLength={1000}
              rows={7}
            />
            <p className="text-right text-[10px] text-text-placeholder">
              {description.length}/1000
            </p>
          </Field>

          <Field label="대표 이미지">
            <ImagePicker
              mode={iconMode}
              emoji={emoji}
              imageUrl={imageUrl}
              onModeChange={setIconMode}
              onEmojiChange={setEmoji}
              onImageChange={setImageUrl}
              onImageClear={() => setImageUrl(null)}
            />
          </Field>
        </div>

        {/* 푸터 */}
        <div className="px-6 pb-5 pt-3 border-t border-border-base shrink-0">
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className="w-full h-11 rounded-xl bg-brand text-white text-xs font-semibold border-none cursor-pointer hover:opacity-85 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            등록하기
          </button>
        </div>
      </div>
    </div>
  );
}
