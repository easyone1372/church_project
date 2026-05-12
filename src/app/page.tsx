"use client";

import { useState } from "react";
import Header from "@/components/organisms/Header";
import TitleSection from "@/components/organisms/TitleSection";
import SearchResultPage from "@/components/organisms/SearchResultPage";

export default function HomePage() {
  const [submittedQuery, setSubmittedQuery] = useState("");

  const handleLogoClick = () => setSubmittedQuery("");

  if (submittedQuery) {
    return (
      <SearchResultPage
        initialQuery={submittedQuery}
        onBack={setSubmittedQuery}
        onLogoClick={handleLogoClick}
      />
    );
  }

  return (
    <div className="min-h-screen bg-surface-page text-text-body">
      <Header onLogoClick={handleLogoClick} />
      <TitleSection onSearch={setSubmittedQuery} />
    </div>
  );
}
