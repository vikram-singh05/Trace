import { PrismaClient } from '@prisma/client';

/**
 * Singleton Prisma client.
 *
 * Why singleton? Prisma opens a connection pool. In development with
 * ts-node-dev hot reloads, a new module evaluation would create a new
 * client on every reload — exhausting the database connection limit.
 * Storing the instance on the global object survives hot reloads.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
