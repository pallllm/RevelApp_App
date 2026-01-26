import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// 本番環境でも開発環境でもシングルトンを使用（サーバーレス環境での接続プール枯渇を防ぐ）
globalForPrisma.prisma = prisma;

export default prisma;
