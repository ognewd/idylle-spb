import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Создаем новый экземпляр Prisma Client, если его еще нет
// или если модель Task недоступна (нужен перезапуск после миграции)
const createPrismaClient = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'postgresql://dognev@localhost:5432/idylle_spb?schema=public',
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

// Проверяем, есть ли модель Task в существующем клиенте
if (globalForPrisma.prisma && !('task' in globalForPrisma.prisma)) {
  // Старый клиент не знает о Task - создаем новый
  console.warn('Prisma Client missing Task model, recreating...');
  globalForPrisma.prisma = undefined;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
