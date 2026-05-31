import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/posts — 전체 조회 (검색어, 카테고리 필터 지원)
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";

  const posts = await prisma.post.findMany({
    where: {
      ...(q && { title: { contains: q } }),
      ...(category && { tags: { path: "$", array_contains: category } }),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(posts);
}

// POST /api/posts — 글 등록
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, category, location, locationTags, price, imageEmoji, imageUrl, tags, keywords, description } = body;

  if (!title || !category || !location || !price) {
    return NextResponse.json({ error: "필수 항목이 누락됐습니다." }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: { title, category, location, locationTags, price, imageEmoji, imageUrl, tags, keywords, description },
  });

  return NextResponse.json(post, { status: 201 });
}
