"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/organisms/Header";
import InfoField from "@/components/atom/InfoField";
import { MOCK_RESULTS } from "@/data/sampleMockResults";

type Tab = "info" | "posts" | "bookmarks";

const MOCK_USER = {
  name: "김민준",
  email: "test@refill.music",
  nickname: "기타리스트",
  createdAt: "2025-11-01",
};

const MOCK_MY_POSTS = MOCK_RESULTS.filter((r) => r.author === "김민준");
const MOCK_BOOKMARKS = MOCK_RESULTS.slice(0, 3);

export default function ProfilePage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("info");
  const [nickname, setNickname] = useState(MOCK_USER.nickname);
  const [nicknameInput, setNicknameInput] = useState(MOCK_USER.nickname);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleNicknameSave = async () => {
    if (!nicknameInput.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: nicknameInput.trim() }),
      });
      if (res.ok) setNickname(nicknameInput.trim());
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    await fetch("/api/profile", { method: "DELETE" });
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-surface-page">
      <Header />

      <div className="mx-auto px-6 pt-8 pb-20" style={{ maxWidth: "720px" }}>
        {/* 프로필 헤더 */}
        <div className="bg-white rounded-2xl border border-border-card px-8 py-7 flex items-center gap-5 mb-6">
          <div className="w-16 h-16 rounded-full bg-brand-bg flex items-center justify-center text-2xl shrink-0">
            🎵
          </div>
          <div>
            <p className="text-[18px] font-bold text-text-heading">
              {nickname || MOCK_USER.name}
            </p>
            <p className="text-[13px] text-text-muted mt-0.5">{MOCK_USER.email}</p>
          </div>
        </div>

        {/* 탭 */}
        <div className="flex gap-1 mb-6 bg-white rounded-2xl border border-border-card p-1.5">
          {(
            [
              { id: "info", label: "내 정보" },
              { id: "posts", label: "작성한 글" },
              { id: "bookmarks", label: "북마크" },
            ] as { id: Tab; label: string }[]
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2 rounded-xl text-[13px] font-semibold transition-colors border-none cursor-pointer ${
                tab === t.id
                  ? "bg-brand text-white"
                  : "bg-transparent text-text-muted hover:text-text-body"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 내 정보 탭 */}
        {tab === "info" && (
          <div className="bg-white rounded-2xl border border-border-card px-8 py-7 flex flex-col gap-6">
            {/* 로그인 정보 */}
            <section className="flex flex-col gap-4">
              <h2 className="text-[14px] font-bold text-text-heading">로그인 정보</h2>
              <div className="flex flex-col gap-3">
                <InfoField label="이름" value={MOCK_USER.name} />
                <InfoField label="이메일" value={MOCK_USER.email} />
                <InfoField label="가입일" value={MOCK_USER.createdAt} />
              </div>
            </section>

            <hr className="border-border-base" />

            {/* 닉네임 설정 */}
            <section className="flex flex-col gap-3">
              <div>
                <h2 className="text-[14px] font-bold text-text-heading">닉네임</h2>
                <p className="text-[12px] text-text-muted mt-0.5">
                  게시글과 댓글에 표시되는 이름입니다.
                </p>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nicknameInput}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  maxLength={20}
                  placeholder="닉네임 입력"
                  className="flex-1 h-10 px-3 rounded-lg border border-border-base text-[13px] text-text-body placeholder:text-text-placeholder focus:outline-none focus:border-brand transition-colors"
                />
                <button
                  onClick={handleNicknameSave}
                  disabled={!nicknameInput.trim() || nicknameInput === nickname || saving}
                  className="px-5 h-10 rounded-lg bg-brand text-white text-[13px] font-semibold border-none cursor-pointer hover:opacity-85 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  저장
                </button>
              </div>
              <p className="text-right text-[11px] text-text-placeholder">
                {nicknameInput.length}/20
              </p>
            </section>

            <hr className="border-border-base" />

            {/* 회원 탈퇴 */}
            <section className="flex flex-col gap-3">
              <div>
                <h2 className="text-[14px] font-bold text-red-500">회원 탈퇴</h2>
                <p className="text-[12px] text-text-muted mt-0.5">
                  탈퇴 시 모든 게시글과 데이터가 삭제되며 복구할 수 없습니다.
                </p>
              </div>
              {showDeleteConfirm ? (
                <div className="flex flex-col gap-2 p-4 rounded-xl bg-red-50 border border-red-200">
                  <p className="text-[13px] text-red-600 font-semibold">
                    정말 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDeleteAccount}
                      className="px-4 h-9 rounded-lg bg-red-500 text-white text-[12px] font-semibold border-none cursor-pointer hover:bg-red-600 transition-colors"
                    >
                      탈퇴 확인
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 h-9 rounded-lg bg-white text-text-body text-[12px] font-semibold border border-border-base cursor-pointer hover:bg-surface-card transition-colors"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="self-start px-4 h-9 rounded-lg border border-red-300 text-red-500 text-[12px] font-semibold bg-transparent cursor-pointer hover:bg-red-50 transition-colors"
                >
                  회원 탈퇴
                </button>
              )}
            </section>
          </div>
        )}

        {/* 작성한 글 탭 */}
        {tab === "posts" && (
          <div className="bg-white rounded-2xl border border-border-card overflow-hidden">
            {MOCK_MY_POSTS.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-text-muted">
                <p className="text-[14px]">작성한 글이 없어요.</p>
                <Link
                  href="/"
                  className="mt-4 text-[12px] text-brand hover:underline"
                >
                  글 작성하러 가기 →
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-border-base">
                {MOCK_MY_POSTS.map((post) => (
                  <li key={post.id}>
                    <Link
                      href={`/post/${post.id}`}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-surface-card transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-brand-bg flex items-center justify-center text-xl shrink-0">
                        {post.imageEmoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold text-text-heading truncate">
                          {post.title}
                        </p>
                        <p className="text-[12px] text-text-muted mt-0.5">
                          {post.location} · {post.timeAgo}
                        </p>
                      </div>
                      <span className="text-[13px] font-semibold text-brand shrink-0">
                        {post.price}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* 북마크 탭 */}
        {tab === "bookmarks" && (
          <div className="bg-white rounded-2xl border border-border-card overflow-hidden">
            {MOCK_BOOKMARKS.length === 0 ? (
              <div className="flex items-center justify-center py-16 text-text-muted text-[14px]">
                북마크한 글이 없어요.
              </div>
            ) : (
              <ul className="divide-y divide-border-base">
                {MOCK_BOOKMARKS.map((post) => (
                  <li key={post.id}>
                    <Link
                      href={`/post/${post.id}`}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-surface-card transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-brand-bg flex items-center justify-center text-xl shrink-0">
                        {post.imageEmoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold text-text-heading truncate">
                          {post.title}
                        </p>
                        <p className="text-[12px] text-text-muted mt-0.5">
                          {post.location} · {post.timeAgo}
                        </p>
                      </div>
                      <span className="text-[13px] font-semibold text-brand shrink-0">
                        {post.price}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

