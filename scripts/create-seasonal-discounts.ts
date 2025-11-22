import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function createSeasonalDiscounts() {
  try {
    await prisma.$connect();
    
    console.log('🎯 Создаем таблицы сезонных скидок...');
    
    // Создаем таблицы через Prisma
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "seasonal_discounts" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "discount" DECIMAL(5,2) NOT NULL,
        "startDate" TIMESTAMP(3) NOT NULL,
        "endDate" TIMESTAMP(3) NOT NULL,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "applyTo" TEXT NOT NULL DEFAULT 'categories',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "seasonal_discount_categories" (
        "id" TEXT PRIMARY KEY,
        "seasonalDiscountId" TEXT NOT NULL,
        "categoryId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "seasonal_discount_products" (
        "id" TEXT PRIMARY KEY,
        "seasonalDiscountId" TEXT NOT NULL,
        "productId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    // Создаем индексы
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "seasonal_discounts_startDate_idx" ON "seasonal_discounts"("startDate");`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "seasonal_discounts_endDate_idx" ON "seasonal_discounts"("endDate");`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "seasonal_discounts_isActive_idx" ON "seasonal_discounts"("isActive");`;
    
    console.log('✅ Таблицы сезонных скидок созданы!');
    
    // Проверяем, что таблицы созданы
    const tables = await prisma.$queryRaw<{ table_name: string }[]>`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      AND table_name LIKE 'seasonal%';
    `;
    
    console.log('📋 Созданные таблицы сезонных скидок:');
    console.log(tables);
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSeasonalDiscounts();