"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Header from "@/components/organisms/Header";
import InfoField from "@/components/atom/InfoField";
import type { SearchResultItem } from "@/data/sampleMockResults";

type Tab = "info" | "posts" | "bookmarks";

interface UserProfile {
  id: number;
  name: string;
  email: string | null;
  nickname: string | null;
  avatarUrl: string | null;
  createdAt: string;
  oauthAccounts: { provider: string }[];
}

const PROVIDER_LABEL: Record<string, string> = {
  kakao: "카카오",
  naver: "네이버",
};

export default function ProfilePage() {
  const router = useRouter();
  const { status } = useSession();
  const [tab, setTab] = useState<Tab>("info");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [nicknameInput, setNicknameInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [myPosts, setMyPosts] = useState<SearchResultItem[]>([]);
  const [myBookmarks, setMyBookmarks] = useState<SearchResultItem[]>([]);

  // 아바타 업로드 상태
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data: UserProfile) => {
        setProfile(data);
        setNicknameInput(data.nickname ?? data.name);
      })
      .catch(() => {});
    fetch("/api/profile/posts")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setMyPosts(data))
      .catch(() => {});
    fetch("/api/bookmarks?full=1")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setMyBookmarks(data))
      .catch(() => {});
  }, [status]);

  const handleNicknameSave = async () => {
    if (!nicknameInput.trim() || saving || !profile) return;
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: nicknameInput.trim() }),
      });
      if (res.ok) setProfile((p) => p ? { ...p, nickname: nicknameInput.trim() } : p);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await fetch("/api/profile", { method: "DELETE" });
      await signOut({ redirect: false });
      router.replace("/");
    } finally {
      setDeleting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarError("이미지 파일만 선택할 수 있어요.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("파일 크기는 5MB 이하여야 해요.");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    // 같은 파일 재선택 가능하도록 초기화
    e.target.value = "";
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile || avatarUploading) return;
    setAvatarUploading(true);
    setAvatarError(null);
    try {
      const fd = new FormData();
      fd.append("image", avatarFile);
      const res = await fetch("/api/upload/avatar", { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setAvatarError(err.error === "too large" ? "파일 크기는 5MB 이하여야 해요." : "업로드에 실패했어요. 다시 시도해 주세요.");
        return;
      }
      const { url } = await res.json();
      setProfile((p) => p ? { ...p, avatarUrl: url } : p);
      setAvatarPreview(null);
      setAvatarFile(null);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleAvatarReset = async () => {
    if (avatarUploading) return;
    setAvatarUploading(true);
    try {
      await fetch("/api/upload/avatar", { method: "DELETE" });
      setProfile((p) => p ? { ...p, avatarUrl: null } : p);
    } finally {
      setAvatarUploading(false);
    }
  };

  const cancelPreview = () => {
    setAvatarPreview(null);
    setAvatarFile(null);
    setAvatarError(null);
  };

  if (status === "loading" || !profile) {
    return (
      <div className="min-h-screen bg-surface-page">
        <Header />
        <div className="flex items-center justify-center py-40">
          <div className="w-8 h-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  const displayName = profile.nickname || profile.name;
  const savedNickname = profile.nickname ?? profile.name;
  const currentAvatar = profile.avatarUrl ?? null;
  const hasCustomAvatar = !!profile.avatarUrl?.includes(".blob.vercel-storage.com");

  return (
    <div className="min-h-screen bg-surface-page">
      <Header />

      {/* 아바타 미리보기 모달 */}
      {avatarPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.55)" }}
          onClick={cancelPreview}
        >
          <div
            className="bg-white rounded-2xl p-6 flex flex-col items-center gap-4 mx-4"
            style={{ maxWidth: 320, width: "100%", boxShadow: "0 24px 64px rgba(15,23,42,0.22)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[15px] font-bold text-text-heading">프로필 사진 변경</p>
            <img
              src={avatarPreview}
              alt="미리보기"
              className="w-28 h-28 rounded-full object-cover border-2 border-brand"
            />
            {avatarError && (
              <p className="text-[12px] text-red-500 text-center">{avatarError}</p>
            )}
            <p className="text-[12px] text-text-muted text-center">
              이 사진을 프로필 사진으로 사용하시겠어요?
            </p>
            <div className="flex gap-2 w-full">
              <button
                onClick={cancelPreview}
                disabled={avatarUploading}
                className="flex-1 h-10 rounded-xl border border-border-base text-text-body text-[13px] font-semibold bg-white cursor-pointer hover:bg-surface-card transition-colors disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleAvatarUpload}
                disabled={avatarUploading}
                className="flex-1 h-10 rounded-xl bg-brand text-white text-[13px] font-semibold border-none cursor-pointer hover:opacity-85 transition-opacity disabled:opacity-50"
              >
                {avatarUploading ? "업로드 중…" : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto px-3 sm:px-6 pt-5 sm:pt-8 pb-20" style={{ maxWidth: "720px" }}>
        {/* 프로필 헤더 */}
        <div className="bg-white rounded-2xl border border-border-card px-4 py-5 sm:px-8 sm:py-7 flex items-center gap-4 sm:gap-5 mb-6">
          {/* 클릭 가능한 아바타 */}
          <div className="relative group shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="block rounded-full overflow-hidden w-16 h-16 cursor-pointer border-none p-0 bg-transparent"
              title="프로필 사진 변경"
            >
              {currentAvatar ? (
                <img
                  src={currentAvatar}
                  alt={displayName}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-brand-bg flex items-center justify-center text-2xl font-bold text-brand">
                  {displayName[0]}
                </div>
              )}
              {/* 호버 오버레이 */}
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[18px] font-bold text-text-heading">{displayName}</p>
            {profile.email && (
              <p className="text-[13px] text-text-muted mt-0.5 truncate">{profile.email}</p>
            )}
            <div className="flex gap-1.5 mt-1.5 flex-wrap">
              {profile.oauthAccounts.map((acc) => (
                <span
                  key={acc.provider}
                  className="text-[10px] font-semibold text-brand bg-brand-bg px-2 py-0.5 rounded-full"
                >
                  {PROVIDER_LABEL[acc.provider] ?? acc.provider}
                </span>
              ))}
            </div>
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
          <div className="bg-white rounded-2xl border border-border-card px-4 py-5 sm:px-8 sm:py-7 flex flex-col gap-6">
            {/* 프로필 사진 섹션 */}
            <section className="flex flex-col gap-3">
              <div>
                <h2 className="text-[14px] font-bold text-text-heading">프로필 사진</h2>
                <p className="text-[12px] text-text-muted mt-0.5">
                  상단 사진을 클릭하면 새 사진을 등록할 수 있어요. (JPG, PNG, WEBP · 최대 5MB)
                </p>
              </div>
              {hasCustomAvatar && (
                <button
                  onClick={handleAvatarReset}
                  disabled={avatarUploading}
                  className="self-start px-4 h-9 rounded-lg border border-border-base text-text-muted text-[12px] font-semibold bg-transparent cursor-pointer hover:bg-surface-card transition-colors disabled:opacity-50"
                >
                  {avatarUploading ? "처리 중…" : "기본 사진으로 되돌리기"}
                </button>
              )}
            </section>

            <hr className="border-border-base" />

            <section className="flex flex-col gap-4">
              <h2 className="text-[14px] font-bold text-text-heading">로그인 정보</h2>
              <div className="flex flex-col gap-3">
                <InfoField label="이름" value={profile.name} />
                {profile.email && <InfoField label="이메일" value={profile.email} />}
                <InfoField
                  label="가입일"
                  value={new Date(profile.createdAt).toLocaleDateString("ko-KR")}
                />
                <div className="flex items-center gap-4">
                  <span className="text-[12px] font-semibold text-text-muted w-14 shrink-0">연동</span>
                  <div className="flex gap-1.5">
                    {profile.oauthAccounts.map((acc) => (
                      <span
                        key={acc.provider}
                        className="text-[12px] font-semibold text-brand bg-brand-bg px-2.5 py-1 rounded-full"
                      >
                        {PROVIDER_LABEL[acc.provider] ?? acc.provider}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <hr className="border-border-base" />

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
                  disabled={!nicknameInput.trim() || nicknameInput === savedNickname || saving}
                  className="px-5 h-10 rounded-lg bg-brand text-white text-[13px] font-semibold border-none cursor-pointer hover:opacity-85 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  {saving ? "저장중…" : "저장"}
                </button>
              </div>
              <p className="text-right text-[11px] text-text-placeholder">
                {nicknameInput.length}/20
              </p>
            </section>

            <hr className="border-border-base" />

            <section className="flex flex-col gap-3">
              <div>
                <h2 className="text-[14px] font-bold text-red-500">회원 탈퇴</h2>
                <p className="text-[12px] text-text-muted mt-0.5">
                  탈퇴 시 모든 데이터가 삭제되고 카카오/네이버 연결도 해제됩니다.
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
                      disabled={deleting}
                      className="px-4 h-9 rounded-lg bg-red-500 text-white text-[12px] font-semibold border-none cursor-pointer hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      {deleting ? "처리중…" : "탈퇴 확인"}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={deleting}
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
            {myPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-text-muted">
                <p className="text-[14px]">작성한 글이 없어요.</p>
                <Link href="/" className="mt-4 text-[12px] text-brand hover:underline">
                  글 작성하러 가기 →
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-border-base">
                {myPosts.map((post) => (
                  <li key={post.id}>
                    <Link
                      href={`/post/${post.id}`}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-surface-card transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-brand-bg flex items-center justify-center text-xl shrink-0">
                        {post.imageEmoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold text-text-heading truncate">{post.title}</p>
                        <p className="text-[12px] text-text-muted mt-0.5">{post.location} · {post.timeAgo}</p>
                      </div>
                      <span className="text-[13px] font-semibold text-brand shrink-0">{post.price}</span>
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
            {myBookmarks.length === 0 ? (
              <div className="flex items-center justify-center py-16 text-text-muted text-[14px]">
                북마크한 글이 없어요.
              </div>
            ) : (
              <ul className="divide-y divide-border-base">
                {myBookmarks.map((post) => (
                  <li key={post.id}>
                    <Link
                      href={`/post/${post.id}`}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-surface-card transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-brand-bg flex items-center justify-center text-xl shrink-0">
                        {post.imageEmoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold text-text-heading truncate">{post.title}</p>
                        <p className="text-[12px] text-text-muted mt-0.5">{post.location} · {post.timeAgo}</p>
                      </div>
                      <span className="text-[13px] font-semibold text-brand shrink-0">{post.price}</span>
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
