import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function testSimpleAPI() {
  try {
    await prisma.$connect();
    
    console.log('🧪 Тестируем простой API продуктов...');
    
    // Простой запрос без сезонных скидок
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      include: {
        brand: true,
        productCategories: {
          include: {
            category: true,
          },
        },
      },
      take: 5,
    });
    
    console.log(`✅ Найдено продуктов: ${products.length}`);
    
    for (const product of products) {
      console.log(`\n🛍️ Продукт: ${product.name}`);
      console.log(`  - Бренд: ${product.brand?.name || 'Нет бренда'}`);
      console.log(`  - Категории: ${product.productCategories.map(pc => pc.category.name).join(', ')}`);
      console.log(`  - Цена: ${product.price}`);
      console.log(`  - Активен: ${product.isActive}`);
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSimpleAPI();


