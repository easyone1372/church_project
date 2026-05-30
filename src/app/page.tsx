"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/organisms/Header";
import TitleSection from "@/components/organisms/TitleSection";
import SearchResultPage from "@/components/organisms/SearchResultPage";

function HomePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") ?? "";

  const handleSearch = (q: string) => {
    if (q.trim()) router.push(`/?q=${encodeURIComponent(q.trim())}`);
  };

  const handleLogoClick = () => router.push("/");

  if (query) {
    return (
      <SearchResultPage
        initialQuery={query}
        onBack={handleSearch}
        onLogoClick={handleLogoClick}
      />
    );
  }

  return (
    <div className="min-h-screen bg-surface-page text-text-body">
      <Header onLogoClick={handleLogoClick} />
      <TitleSection onSearch={handleSearch} />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense>
      <HomePageContent />
    </Suspense>
  );
}
