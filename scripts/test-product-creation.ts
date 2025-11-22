import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function testProductCreation() {
  try {
    await prisma.$connect();
    
    // Проверяем бренды
    const brands = await prisma.brand.findMany();
    console.log('Доступные бренды:', brands.map(b => ({ id: b.id, name: b.name })));
    
    if (brands.length === 0) {
      console.log('❌ Нет брендов для создания продукта');
      return;
    }
    
    const firstBrand = brands[0];
    
    // Создаем тестовый продукт
    const testProduct = await prisma.product.create({
      data: {
        name: 'Test Product',
        slug: 'test-product-' + Date.now(),
        description: 'Test product description',
        price: 1000,
        brandId: firstBrand.id,
        stock: 10,
        isActive: true
      }
    });
    
    console.log('✅ Тестовый продукт создан:', testProduct);
    
    // Проверяем, что продукт создался
    const products = await prisma.product.findMany();
    console.log('Всего продуктов:', products.length);
    
    // Удаляем тестовый продукт
    await prisma.product.delete({
      where: { id: testProduct.id }
    });
    
    console.log('✅ Тестовый продукт удален');
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testProductCreation();


