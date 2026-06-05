"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MOCK_RESULTS } from "@/data/sampleMockResults";
import Header from "@/components/organisms/Header";
import InfoRow from "@/components/atom/InfoRow";

interface CommentData {
  id: number;
  content: string;
  guestName: string | null;
  createdAt: string;
  author: { name: string } | null;
}

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const item = MOCK_RESULTS.find((r) => r.id === Number(id));

  const [comments, setComments] = useState<CommentData[]>([]);
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/posts/${id}/comments`)
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setComments(data))
      .catch(() => {});
  }, [id]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: commentText.trim(),
          guestName: commentName.trim() || "익명",
        }),
      });
      if (res.ok) {
        const created: CommentData = await res.json();
        setComments((prev) => [...prev, created]);
        setCommentText("");
      }
    } finally {
      setSubmitting(false);
    }
  };

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

        {/* 게시글 카드 */}
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

            <hr className="border-border-base" />

            {/* 기본 정보 */}
            <div className="flex flex-col gap-3">
              <InfoRow label="가격" value={item.price} highlight />
              <InfoRow label="지역" value={item.location} />
              <InfoRow label="등록일" value={item.timeAgo} />
              {item.author && <InfoRow label="작성자" value={item.author} />}
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

            {/* 해시태그 */}
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

        {/* 댓글 섹션 */}
        <div className="mt-6 bg-white rounded-2xl border border-border-card px-8 py-7 flex flex-col gap-6">
          <h2 className="text-[15px] font-bold text-text-heading">
            댓글 {comments.length > 0 && <span className="text-brand">{comments.length}</span>}
          </h2>

          {/* 댓글 목록 */}
          {comments.length === 0 ? (
            <p className="text-[13px] text-text-muted py-4 text-center">
              첫 번째 댓글을 남겨보세요.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-border-base">
              {comments.map((c) => (
                <li key={c.id} className="py-4 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-text-heading">
                      {c.author?.name ?? c.guestName ?? "익명"}
                    </span>
                    <span className="text-[11px] text-text-muted">
                      {new Date(c.createdAt).toLocaleDateString("ko-KR", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-[13px] text-text-body leading-relaxed">
                    {c.content}
                  </p>
                </li>
              ))}
            </ul>
          )}

          {/* 댓글 작성 폼 */}
          <form onSubmit={handleCommentSubmit} className="flex flex-col gap-3 border-t border-border-base pt-5">
            <input
              type="text"
              value={commentName}
              onChange={(e) => setCommentName(e.target.value)}
              placeholder="닉네임 (선택, 기본: 익명)"
              maxLength={20}
              className="w-40 h-9 px-3 rounded-lg border border-border-base text-[13px] text-text-body placeholder:text-text-placeholder focus:outline-none focus:border-brand transition-colors"
            />
            <div className="flex gap-3 items-end">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="댓글을 입력하세요."
                maxLength={500}
                rows={3}
                className="flex-1 px-3 py-2 rounded-lg border border-border-base text-[13px] text-text-body placeholder:text-text-placeholder focus:outline-none focus:border-brand transition-colors resize-none"
              />
              <button
                type="submit"
                disabled={!commentText.trim() || submitting}
                className="h-10 px-5 rounded-xl bg-brand text-white text-[13px] font-semibold border-none cursor-pointer hover:opacity-85 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                등록
              </button>
            </div>
            <p className="text-right text-[11px] text-text-placeholder">
              {commentText.length}/500
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
