import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { POST_SELECT, mapPost } from "@/lib/postMapper";

const PAGE_SIZE = 50;

const PRICE_TYPE_MAP: Record<string, string> = {
  free: "FREE",
  monthly: "MONTHLY",
  yearly: "YEARLY",
  per_session: "PER_SESSION",
  negotiable: "NEGOTIABLE",
};

// GET /api/posts?q=&category=&direction=&page=
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = (searchParams.get("q") ?? "").slice(0, 100);
  const category = (searchParams.get("category") ?? "").slice(0, 50);
  const direction = searchParams.get("direction") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1") || 1);

  const posts = await prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      ...(q && { title: { contains: q } }),
      ...(category && {
        categories: { some: { category: { slug: category } } },
      }),
      ...(direction === "offer" && { direction: "OFFER" }),
      ...(direction === "seek" && { direction: "SEEK" }),
    },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE,
    skip: (page - 1) * PAGE_SIZE,
    select: POST_SELECT,
  });

  return NextResponse.json(posts.map(mapPost));
}

// POST /api/posts — 새 게시글 작성 (로그인 필수)
export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = (session?.user as any)?.id as number | undefined;
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const {
    title, description, priceType, priceAmount, priceDisplay,
    imageEmoji, imageUrls, location, locationTags, tags, keywords, direction, lat, lng,
  } = body;

  if (!title?.trim()) return NextResponse.json({ error: "title required" }, { status: 400 });
  if (!location?.trim()) return NextResponse.json({ error: "location required" }, { status: 400 });
  if (!priceDisplay?.trim()) return NextResponse.json({ error: "price required" }, { status: 400 });

  try {
    // 카테고리 슬러그로 ID 조회
    const categories = await prisma.category.findMany({
      where: { slug: { in: Array.isArray(tags) ? tags : [] } },
      select: { id: true },
    });

    // 해시태그 find-or-create (upsert는 HTTP 모드에서 트랜잭션 사용 가능)
    const hashtagIds: number[] = [];
    for (const name of (Array.isArray(keywords) ? keywords : [])) {
      if (!name?.trim()) continue;
      const trimmed = name.trim();
      let h = await prisma.hashtag.findUnique({ where: { name: trimmed }, select: { id: true } });
      if (!h) h = await prisma.hashtag.create({ data: { name: trimmed }, select: { id: true } });
      hashtagIds.push(h.id);
    }

    const post = await (prisma.post.create as any)({
      data: {
        title: title.trim().slice(0, 100),
        description: description?.trim() || null,
        priceType: PRICE_TYPE_MAP[priceType] ?? "NEGOTIABLE",
        priceAmount: priceAmount ? parseInt(priceAmount) || null : null,
        priceDisplay: priceDisplay.trim().slice(0, 100),
        imageEmoji: (imageEmoji || "🎵").slice(0, 10),
        location: location.trim().slice(0, 100),
        lat: typeof lat === "number" ? lat : null,
        lng: typeof lng === "number" ? lng : null,
        direction: direction === "seek" ? "SEEK" : "OFFER",
        authorId: userId,
      },
      select: { id: true },
    });

    const postId = post.id;

    // 중첩 create 대신 순차 create (PrismaNeonHttp는 트랜잭션 미지원)
    for (const c of categories) {
      await prisma.postCategory.create({ data: { postId, categoryId: c.id } });
    }
    for (const hashtagId of hashtagIds) {
      await prisma.postHashtag.create({ data: { postId, hashtagId } });
    }
    for (const t of (Array.isArray(locationTags) ? locationTags : [])) {
      if (!t?.trim()) continue;
      await prisma.postLocationTag.create({ data: { postId, tag: t.trim().slice(0, 50) } });
    }
    const urls: string[] = Array.isArray(imageUrls) ? imageUrls : [];
    for (let i = 0; i < urls.length; i++) {
      if (!urls[i]) continue;
      await prisma.postImage.create({ data: { postId, url: urls[i], order: i } });
    }

    const created = await prisma.post.findUnique({
      where: { id: postId },
      select: POST_SELECT,
    });
    return NextResponse.json(mapPost(created!), { status: 201 });
  } catch (err) {
    console.error("[posts POST] error:", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
