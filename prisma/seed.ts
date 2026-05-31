import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const dbUrl = new URL(process.env.DATABASE_URL!);
const adapter = new PrismaMariaDb({
  host:     dbUrl.hostname,
  port:     Number(dbUrl.port) || 3306,
  user:     dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.slice(1),
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const categories = [
    { slug: "lesson",     name: "레슨" },
    { slug: "band",       name: "밴드/합주" },
    { slug: "guitar",     name: "기타/베이스" },
    { slug: "drum",       name: "드럼" },
    { slug: "piano",      name: "피아노/건반" },
    { slug: "vocal",      name: "보컬/노래" },
    { slug: "wind",       name: "관악기" },
    { slug: "string",     name: "현악기" },
    { slug: "dj",         name: "DJ/전자음악" },
    { slug: "record",     name: "음반/LP" },
    { slug: "instrument", name: "악기거래" },
    { slug: "equipment",  name: "음향장비" },
    { slug: "etc",        name: "기타" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: cat,
    });
  }

  console.log(`✅ ${categories.length}개 카테고리 시드 완료`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
