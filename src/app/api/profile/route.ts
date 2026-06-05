import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 임시 사용자 ID — 인증 구현 전 고정값 사용
const MOCK_USER_ID = 1;

export async function GET() {
  const user = await prisma.user.findUnique({
    where: { id: MOCK_USER_ID },
    select: { id: true, name: true, email: true, nickname: true, createdAt: true },
  });

  if (!user) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const { nickname } = await req.json();
  const trimmed = (nickname ?? "").trim();

  if (!trimmed) return NextResponse.json({ error: "nickname required" }, { status: 400 });
  if (trimmed.length > 50) return NextResponse.json({ error: "too long" }, { status: 400 });

  const user = await prisma.user.update({
    where: { id: MOCK_USER_ID },
    data: { nickname: trimmed },
    select: { id: true, name: true, email: true, nickname: true },
  });

  return NextResponse.json(user);
}

export async function DELETE() {
  await prisma.user.delete({ where: { id: MOCK_USER_ID } });
  return NextResponse.json({ ok: true });
}
