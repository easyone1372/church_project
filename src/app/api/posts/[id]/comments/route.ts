import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const postId = Number(id);
  if (isNaN(postId)) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  const comments = await prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      content: true,
      guestName: true,
      createdAt: true,
      author: { select: { name: true } },
    },
  });

  return NextResponse.json(comments);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const postId = Number(id);
  if (isNaN(postId)) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  const body = await req.json();
  const content = (body.content ?? "").trim();
  const guestName = (body.guestName ?? "익명").trim() || "익명";

  if (!content) return NextResponse.json({ error: "content required" }, { status: 400 });
  if (content.length > 500) return NextResponse.json({ error: "too long" }, { status: 400 });

  const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true } });
  if (!post) return NextResponse.json({ error: "post not found" }, { status: 404 });

  const comment = await prisma.comment.create({
    data: { postId, content, guestName },
    select: {
      id: true,
      content: true,
      guestName: true,
      createdAt: true,
      author: { select: { name: true } },
    },
  });

  return NextResponse.json(comment, { status: 201 });
}
