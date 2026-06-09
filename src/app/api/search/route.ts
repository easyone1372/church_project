import { NextRequest, NextResponse } from "next/server";
import { parseSearchQuery } from "@/lib/SearchParser";
import { prisma } from "@/lib/prisma";
import { POST_SELECT, mapPost } from "@/lib/postMapper";

export async function POST(req: NextRequest) {
  const { query } = await req.json();

  if (!query?.trim()) {
    return NextResponse.json({ results: [], keywords: [] });
  }

  const parsed = await parseSearchQuery(query);

  const where: any = { status: "PUBLISHED" };

  // 지역 필터
  if (parsed.regions.length > 0) {
    const regionKeywords = parsed.regions.flatMap((r: any) => r.keywords);
    where.locationTags = {
      some: { tag: { in: regionKeywords } },
    };
  }

  // 악기/서비스 키워드 필터
  const keywords = [...parsed.instruments, ...parsed.services];
  if (keywords.length > 0) {
    where.OR = keywords.flatMap((kw: string) => [
      { title: { contains: kw } },
      { hashtags: { some: { hashtag: { name: { contains: kw } } } } },
      { categories: { some: { category: { name: { contains: kw } } } } },
    ]);
  }

  const results = await prisma.post.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
    select: POST_SELECT,
  });

  return NextResponse.json({
    results: results.map(mapPost),
    keywords: parsed.keywords,
    regions: parsed.regions.map((r: any) => r.name),
  });
}
