import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/posts?q=&category=
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";

  const posts = await prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      ...(q && { title: { contains: q } }),
      ...(category && {
        categories: { some: { category: { slug: category } } },
      }),
    },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true } },
      categories: { include: { category: { select: { slug: true, name: true } } } },
      hashtags: { include: { hashtag: { select: { name: true } } } },
      locationTags: { select: { tag: true } },
    },
  });

  return NextResponse.json(posts);
}
