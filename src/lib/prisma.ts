import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/** После `prisma generate` / смены схемы перезапустите `npm run dev` — иначе в dev останется старый singleton без новых моделей. */
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://dognev@localhost:5432/idylle_spb?schema=public',
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/** false, если dev-сервер не перезапущен после prisma generate (singleton без новой модели). */
export function prismaSiteCertificatesReady(): boolean {
  return typeof (prisma as { siteCertificate?: { aggregate?: unknown } }).siteCertificate?.aggregate ===
    'function';
}
