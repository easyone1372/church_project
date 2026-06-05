"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/organisms/Header";
import FilterChip from "@/components/atom/FilterChip";
import ResultItem from "@/components/atom/ResultItem";
import SearchBar from "@/components/molecules/SearchBar";
import PriceRangeSlider from "@/components/molecules/PriceRangeSlider";
import { MOCK_RESULTS } from "@/data/sampleMockResults";
import {
  WRITE_CATEGORIES,
  CATEGORY_TAG_MAP,
  inferCategoriesFromTokens,
} from "@/data/Categories";
import { PRICE_RANGES, SLIDER_MAX, parsePrice } from "@/data/postOptions";
import { extractKeywords } from "@/lib/mapUtils";

interface SearchResultPageProps {
  initialQuery: string;
  onBack: (query: string) => void;
  onLogoClick: () => void;
}

export default function SearchResultPage({
  initialQuery,
  onBack,
  onLogoClick,
}: SearchResultPageProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    () => {
      const tokens = extractKeywords(initialQuery.trim().toLowerCase());
      return inferCategoriesFromTokens(tokens);
    },
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([
    0,
    SLIDER_MAX,
  ]);
  const [showSlider, setShowSlider] = useState(false);

  const toggleCategory = (id: string) => {
    if (id === "all") {
      setSelectedCategories(new Set());
      return;
    }
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handlePriceChip = (min: number, max: number) => {
    const chipMax = max === Infinity ? SLIDER_MAX : max;
    const isActive = priceRange[0] === min && priceRange[1] === chipMax;
    setPriceRange(isActive ? [0, SLIDER_MAX] : [min, chipMax]);
  };

  const isChipActive = (min: number, max: number) => {
    const chipMax = max === Infinity ? SLIDER_MAX : max;
    return priceRange[0] === min && priceRange[1] === chipMax;
  };

  const filtered = MOCK_RESULTS.filter((item) => {
    const q = initialQuery.trim().toLowerCase();

    let matchesQuery: boolean;
    if (q === "") {
      matchesQuery = true;
    } else {
      const tokens = extractKeywords(q);
      const matchToken = (token: string) =>
        item.title.toLowerCase().includes(token) ||
        item.category.toLowerCase().includes(token) ||
        item.keywords.some((kw) => kw.toLowerCase().includes(token)) ||
        item.locationTags.some((lt) => lt.toLowerCase().includes(token));
      matchesQuery =
        tokens.length > 0 ? tokens.every(matchToken) : matchToken(q);
    }

    const matchesCategory =
      selectedCategories.size === 0 ||
      [...selectedCategories].some((catId) =>
        (CATEGORY_TAG_MAP[catId] ?? []).some((tag) => item.tags.includes(tag)),
      );

    const matchesPrice = (() => {
      const [lo, hi] = priceRange;
      if (lo === 0 && hi === SLIDER_MAX) return true;
      const amount = parsePrice(item.price);
      if (amount === -1) return true;
      if (lo === 0 && hi === 0) return amount === 0;
      return amount >= lo && (hi >= SLIDER_MAX || amount <= hi);
    })();

    return matchesQuery && matchesCategory && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-surface-page text-text-body">
      <Header onLogoClick={onLogoClick} />

      {/* 검색바 */}
      <div className="border-b border-border-header bg-white">
        <div
          className="mx-auto px-6 py-4"
          style={{ maxWidth: "var(--max-w-hero)" }}
        >
          <SearchBar
            value={query}
            onChange={setQuery}
            onSearch={() => {
              if (query.trim()) onBack(query);
            }}
          />
        </div>
      </div>

      {/* 필터 바 */}
      <div className="border-b border-border-header bg-white">
        <div
          className="mx-auto px-6 py-4 flex flex-col gap-4"
          style={{ maxWidth: "var(--max-w-hero)" }}
        >
          {/* 카테고리 칩 */}
          <div
            className="flex gap-2 overflow-x-auto"
            style={{ scrollbarWidth: "none" }}
          >
            <FilterChip
              active={selectedCategories.size === 0}
              onClick={() => toggleCategory("all")}
            >
              전체
            </FilterChip>
            {WRITE_CATEGORIES.map((cat) => (
              <FilterChip
                key={cat.id}
                active={selectedCategories.has(cat.id)}
                onClick={() => toggleCategory(cat.id)}
              >
                {cat.label}
              </FilterChip>
            ))}
          </div>

          {/* 가격 칩 + 직접 입력 토글 */}
          <div className="flex flex-col gap-3">
            <div
              className="flex gap-2 overflow-x-auto"
              style={{ scrollbarWidth: "none" }}
            >
              {PRICE_RANGES.map((r) => (
                <FilterChip
                  key={r.id}
                  active={isChipActive(r.min, r.max)}
                  onClick={() => handlePriceChip(r.min, r.max)}
                >
                  {r.label}
                </FilterChip>
              ))}
              <button
                onClick={() => setShowSlider((v) => !v)}
                className="shrink-0 text-[12px] font-semibold text-brand border border-brand rounded-full px-3 py-1.5 bg-transparent cursor-pointer hover:bg-brand-bg transition-colors whitespace-nowrap"
              >
                {showSlider ? "닫기" : "직접 입력"}
              </button>
            </div>
            {showSlider && (
              <div style={{ maxWidth: "260px" }}>
                <PriceRangeSlider value={priceRange} onChange={setPriceRange} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 결과 */}
      <div
        className="mx-auto px-6 py-8 pb-16"
        style={{ maxWidth: "var(--max-w-hero)" }}
      >
        <h2 className="text-[22px] font-bold text-text-heading tracking-tight mb-4">
          &ldquo;{initialQuery}&rdquo; 검색 결과
        </h2>
        <p className="text-[13px] text-text-muted mb-4">
          총 {filtered.length}개의 결과
        </p>
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-text-muted text-[15px]">
            검색 결과가 없어요.
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border-header">
            {filtered.map((item) => (
              <ResultItem
                key={item.id}
                title={item.title}
                category={item.category}
                location={item.location}
                timeAgo={item.timeAgo}
                price={item.price}
                imageEmoji={item.imageEmoji}
                imageUrl={item.imageUrl}
                onClick={() => router.push(`/post/${item.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
