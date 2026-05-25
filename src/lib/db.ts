import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: process.env.NODE_ENV === "production" ? 2 : 10,
  idleTimeoutMillis: process.env.NODE_ENV === "production" ? 10_000 : 30_000,
  connectionTimeoutMillis: 5_000,
});

const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg(pool),
  });

globalForPrisma.prisma = db;

export { db };
