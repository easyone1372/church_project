import { PrismaClient } from "@/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

function createPrismaClient() {
  const dbUrl = new URL(process.env.DATABASE_URL!);
  // URL에 ?ssl=true 가 있으면 SSL 활성화 (TiDB Cloud 등 원격 DB용)
  const useSSL = dbUrl.searchParams.get("ssl") === "true";

  const adapter = new PrismaMariaDb({
    host:     dbUrl.hostname,
    port:     Number(dbUrl.port) || 3306,
    user:     dbUrl.username,
    password: decodeURIComponent(dbUrl.password),
    database: dbUrl.pathname.slice(1),
    ssl:      useSSL ? { rejectUnauthorized: true } : undefined,
  });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
