"use client";

import { useState } from "react";
import SearchBar from "@/components/molecules/SearchBar";

interface TitleSectionProps {
  onSearch: (query: string) => void;
}

export default function TitleSection({ onSearch }: TitleSectionProps) {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (!query.trim()) return;
    onSearch(query);
  };

  return (
    <main
      className="mx-auto text-center px-4"
      style={{
        maxWidth: "var(--max-w-hero)",
        paddingTop: "var(--pt-hero)",
      }}
    >
      <h1
        className="m-0 font-bold leading-snug"
        style={{
          fontSize: "64px",
          letterSpacing: "-2.5px",
          color: "var(--color-text-primary)",
        }}
      >
        음악을 더 쉽게{" "}
        <span style={{ color: "var(--color-brand)" }}>
          찾고, 배우고, 연결하다
        </span>
      </h1>

      <p
        className="mt-6 text-[22px]"
        style={{
          marginBottom: "var(--mb-hero-desc)",
          color: "var(--color-text-muted)",
        }}
      >
        AI가 음악 레슨, 악기, 선생님, 모임, 중고거래까지 빠르게 찾아드려요.
      </p>

      <SearchBar value={query} onChange={setQuery} onSearch={handleSearch} />
    </main>
  );
}
