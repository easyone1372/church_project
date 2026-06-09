import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function getSessionUserId() {
  const session = await auth();
  const id = (session?.user as any)?.id;
  return typeof id === "number" ? id : null;
}

// ── OAuth 연결 해제 ────────────────────────────────────────────────────────

async function revokeKakao(accessToken: string) {
  await fetch("https://kapi.kakao.com/v1/user/unlink", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  }).catch(() => {});
}

async function revokeNaver(accessToken: string) {
  const clientId = process.env.NAVER_SEARCH_CLIENT_ID ?? "";
  const clientSecret = process.env.NAVER_SEARCH_CLIENT_SECRET ?? "";
  const url = `https://nid.naver.com/oauth2.0/token?grant_type=delete&client_id=${clientId}&client_secret=${clientSecret}&access_token=${encodeURIComponent(accessToken)}&service_provider=NAVER`;
  await fetch(url).catch(() => {});
}

// ── GET /api/profile ───────────────────────────────────────────────────────

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      nickname: true,
      avatarUrl: true,
      createdAt: true,
      oauthAccounts: { select: { provider: true } },
    },
  });

  if (!user) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(user);
}

// ── PATCH /api/profile ─────────────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { nickname } = await req.json();
  const trimmed = (nickname ?? "").trim();
  if (!trimmed) return NextResponse.json({ error: "nickname required" }, { status: 400 });
  if (trimmed.length > 50) return NextResponse.json({ error: "too long" }, { status: 400 });

  const user = await prisma.user.update({
    where: { id: userId },
    data: { nickname: trimmed },
    select: { id: true, name: true, email: true, nickname: true },
  });

  return NextResponse.json(user);
}

// ── DELETE /api/profile ────────────────────────────────────────────────────

export async function DELETE() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const accounts = await prisma.oAuthAccount.findMany({
    where: { userId },
    select: { provider: true, accessToken: true },
  });

  // 각 OAuth 서비스에 연결 해제 요청 (병렬)
  await Promise.allSettled(
    accounts.map((acc) => {
      if (!acc.accessToken) return Promise.resolve();
      if (acc.provider === "kakao") return revokeKakao(acc.accessToken);
      if (acc.provider === "naver") return revokeNaver(acc.accessToken);
      return Promise.resolve();
    }),
  );

  // DB에서 사용자 삭제 (cascade로 OAuthAccount, Post 등 함께 삭제)
  await prisma.user.delete({ where: { id: userId } });

  return NextResponse.json({ ok: true });
}
