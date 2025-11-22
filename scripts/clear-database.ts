import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    await prisma.$connect();
    
    console.log('🧹 Очищаем базу данных...');
    
    // Удаляем в правильном порядке (сначала зависимые таблицы)
    await prisma.productCategory.deleteMany();
    await prisma.productVariant.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.wishlistItem.deleteMany();
    await prisma.review.deleteMany();
    await prisma.seasonalDiscountProduct.deleteMany();
    await prisma.seasonalDiscountCategory.deleteMany();
    
    await prisma.product.deleteMany();
    await prisma.order.deleteMany();
    await prisma.seasonalDiscount.deleteMany();
    await prisma.brand.deleteMany();
    await prisma.category.deleteMany();
    await prisma.address.deleteMany();
    await prisma.user.deleteMany();
    
    console.log('✅ База данных очищена');
    
    // Проверяем, что все таблицы пусты
    const counts = {
      users: await prisma.user.count(),
      brands: await prisma.brand.count(),
      categories: await prisma.category.count(),
      products: await prisma.product.count(),
    };
    
    console.log('📊 Количество записей после очистки:', counts);
    
  } catch (error) {
    console.error('❌ Ошибка при очистке базы данных:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase();


