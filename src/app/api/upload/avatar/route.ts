import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = (session?.user as any)?.id as number | undefined;
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("image") as File | null;

  if (!file) return NextResponse.json({ error: "no file" }, { status: 400 });
  if (!ALLOWED_TYPES.has(file.type))
    return NextResponse.json({ error: "invalid type" }, { status: 400 });
  if (file.size > MAX_SIZE)
    return NextResponse.json({ error: "too large" }, { status: 400 });

  // 기존 커스텀 아바타 삭제 (Vercel Blob URL인 경우)
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarUrl: true },
  });
  if (existing?.avatarUrl?.includes(".blob.vercel-storage.com")) {
    await del(existing.avatarUrl).catch(() => {});
  }

  const ext = EXT[file.type] ?? "jpg";
  const filename = `avatars/${crypto.randomUUID()}.${ext}`;

  const blob = await put(filename, file, { access: "public" });

  // DB 업데이트
  await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl: blob.url },
  });

  return NextResponse.json({ url: blob.url });
}

// DELETE: 커스텀 아바타 제거 (OAuth 사진으로 복원)
export async function DELETE() {
  const session = await auth();
  const userId = (session?.user as any)?.id as number | undefined;
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarUrl: true },
  });

  if (user?.avatarUrl?.includes(".blob.vercel-storage.com")) {
    await del(user.avatarUrl).catch(() => {});
  }

  await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl: null },
  });

  return NextResponse.json({ ok: true });
}
