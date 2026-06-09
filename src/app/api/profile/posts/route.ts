import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { POST_SELECT, mapPost } from "@/lib/postMapper";

// GET /api/profile/posts — 내가 작성한 글 목록
export async function GET() {
  const session = await auth();
  const userId = (session?.user as any)?.id as number | undefined;
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const posts = await prisma.post.findMany({
    where: { authorId: userId, status: { not: "DELETED" as any } },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: POST_SELECT,
  });

  return NextResponse.json(posts.map(mapPost));
}
