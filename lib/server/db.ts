import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

if (process.env.NODE_ENV === "production") {
  // In production, create a new connection for each request
  prisma = new PrismaClient();
} else {
  // In development, reuse the connection
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }
  prisma = globalForPrisma.prisma;
}

export { prisma };