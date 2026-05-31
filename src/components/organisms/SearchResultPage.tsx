"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/organisms/Header";
import CategoryFilter from "@/components/molecules/CategoryFilter";
import ResultItem from "@/components/atom/ResultItem";
import SearchBar from "@/components/molecules/SearchBar";
import { MOCK_RESULTS } from "@/data/sampleMockResults";
import { CATEGORY_TAG_MAP, inferCategoriesFromTokens } from "@/data/Categories";
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
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(() => {
    const tokens = extractKeywords(initialQuery.trim().toLowerCase());
    return inferCategoriesFromTokens(tokens);
  });

  const toggleCategory = (id: string) => {
    if (id === "all") { setSelectedCategories(new Set()); return; }
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
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
      matchesQuery = tokens.length > 0 ? tokens.every(matchToken) : matchToken(q);
    }

    const matchesCategory =
      selectedCategories.size === 0 ||
      [...selectedCategories].some((catId) =>
        (CATEGORY_TAG_MAP[catId] ?? []).some((tag) => item.tags.includes(tag)),
      );

    return matchesQuery && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-surface-page text-text-body">
      <Header onLogoClick={onLogoClick} />

      {/* 검색바 */}
      <div className="border-b border-border-header py-4 px-6 bg-white">
        <div className="mx-auto" style={{ maxWidth: "var(--max-w-hero)" }}>
          <SearchBar
            value={query}
            onChange={setQuery}
            onSearch={() => { if (query.trim()) onBack(query); }}
          />
        </div>
      </div>

      {/* 결과 타이틀 */}
      <div
        className="mx-auto px-6 pt-8 pb-4"
        style={{ maxWidth: "var(--max-w-hero)" }}
      >
        <h2 className="text-[22px] font-bold text-text-heading tracking-tight">
          &ldquo;{initialQuery}&rdquo; 검색 결과
        </h2>
      </div>

      {/* 본문 레이아웃 */}
      <div
        className="mx-auto px-6 pb-16 flex gap-10"
        style={{ maxWidth: "var(--max-w-hero)" }}
      >
        <aside className="w-44 shrink-0 pt-2">
          <CategoryFilter
            selected={selectedCategories}
            onToggle={toggleCategory}
          />
        </aside>

        <div className="flex-1">
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
    </div>
  );
}
