import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Создаем новый экземпляр Prisma Client
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
// Если нет - принудительно пересоздаем клиент
let prismaInstance = globalForPrisma.prisma;
if (!prismaInstance || !('task' in prismaInstance)) {
  if (prismaInstance) {
    // Закрываем старое соединение
    try {
      prismaInstance.$disconnect();
    } catch (e) {
      // Игнорируем ошибки при закрытии
    }
  }
  // Создаем новый клиент
  prismaInstance = createPrismaClient();
  globalForPrisma.prisma = prismaInstance;
}

export const prisma = prismaInstance;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
