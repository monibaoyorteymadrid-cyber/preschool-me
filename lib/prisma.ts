import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Use a singleton for the pool to avoid too many connections in development
const pool = globalForPrisma.prisma 
  ? (globalForPrisma as any).pool 
  : new pg.Pool({ connectionString: process.env.DATABASE_URL });

if (process.env.NODE_ENV !== "production") (globalForPrisma as any).pool = pool;

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    adapter,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
