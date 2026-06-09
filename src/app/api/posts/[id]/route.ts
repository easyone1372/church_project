import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { POST_SELECT, mapPost } from "@/lib/postMapper";

// GET /api/posts/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const postId = Number((await params).id);
  if (isNaN(postId)) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  const post = await prisma.post.findFirst({
    where: { id: postId, status: "PUBLISHED" },
    select: POST_SELECT,
  });

  if (!post) return NextResponse.json({ error: "not found" }, { status: 404 });

  // 조회수 증가 (fire-and-forget)
  prisma.post.update({ where: { id: postId }, data: { viewCount: { increment: 1 } } }).catch(() => {});

  return NextResponse.json(mapPost(post));
}
