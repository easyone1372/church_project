"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MOCK_RESULTS } from "@/data/sampleMockResults";
import Header from "@/components/organisms/Header";

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const item = MOCK_RESULTS.find((r) => r.id === Number(id));

  if (!item) {
    return (
      <div className="min-h-screen bg-surface-page text-text-body">
        <Header />
        <div className="flex flex-col items-center justify-center py-40 text-text-muted text-[15px]">
          <p>게시글을 찾을 수 없어요.</p>
          <button
            onClick={() => router.back()}
            className="mt-6 px-5 py-2 rounded-full border border-border-base text-xs text-text-body hover:bg-surface-card transition-colors cursor-pointer bg-transparent"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-page text-text-body">
      <Header />

      <div
        className="mx-auto px-6 pt-8 pb-20"
        style={{ maxWidth: "var(--max-w-hero)" }}
      >
        {/* 뒤로가기 */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-body transition-colors cursor-pointer bg-transparent border-none mb-6"
        >
          ← 목록으로
        </button>

        <div className="bg-white rounded-2xl border border-border-card overflow-hidden">
          {/* 대표 이미지 */}
          <div className="w-full h-56 bg-[#f1f5f9] flex items-center justify-center text-8xl overflow-hidden">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              item.imageEmoji
            )}
          </div>

          {/* 본문 */}
          <div className="px-8 py-7 flex flex-col gap-6">
            {/* 카테고리 + 제목 */}
            <div>
              <span className="inline-block mb-2 text-[11px] font-semibold text-brand bg-brand-bg px-2.5 py-0.5 rounded-full">
                {item.category}
              </span>
              <h1 className="text-[22px] font-bold text-text-heading leading-snug">
                {item.title}
              </h1>
            </div>

            {/* 구분선 */}
            <hr className="border-border-base" />

            {/* 기본 정보 */}
            <div className="flex flex-col gap-3">
              <InfoRow label="가격" value={item.price} highlight />
              <InfoRow label="지역" value={item.location} />
              <InfoRow label="등록일" value={item.timeAgo} />
            </div>

            {/* 기타 사항 */}
            {item.description && (
              <>
                <hr className="border-border-base" />
                <div className="flex flex-col gap-2">
                  <p className="text-[12px] font-semibold text-text-muted">기타 사항</p>
                  <p className="text-[14px] text-text-body leading-relaxed whitespace-pre-wrap">
                    {item.description}
                  </p>
                </div>
              </>
            )}

            {/* 태그 */}
            {item.keywords.length > 0 && (
              <>
                <hr className="border-border-base" />
                <div className="flex flex-wrap gap-2">
                  {item.keywords.map((kw) => (
                    <Link
                      key={kw}
                      href={`/?q=${encodeURIComponent(kw)}`}
                      className="px-3 py-1 rounded-full bg-surface-card text-[11px] text-text-muted border border-border-base hover:border-brand hover:text-brand transition-colors"
                    >
                      #{kw}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="text-[12px] font-semibold text-text-muted w-12 shrink-0">
        {label}
      </span>
      <span
        className={
          highlight
            ? "text-[20px] font-bold text-text-heading"
            : "text-[14px] text-text-body"
        }
      >
        {value}
      </span>
    </div>
  );
}
