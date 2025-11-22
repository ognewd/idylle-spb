import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function createSimpleProduct() {
  try {
    await prisma.$connect();
    
    console.log('🛍️ Создаем простой продукт...');
    
    // Проверяем бренды
    const brands = await prisma.brand.findMany();
    console.log('Доступные бренды:', brands.map(b => ({ id: b.id, name: b.name })));
    
    if (brands.length === 0) {
      console.log('❌ Нет брендов для создания продукта');
      return;
    }
    
    const firstBrand = brands[0];
    
    // Создаем простой продукт
    const simpleProduct = await prisma.product.create({
      data: {
        name: 'Simple Test Product',
        slug: 'simple-test-product-' + Date.now(),
        description: 'Simple test product description',
        price: 1000,
        brandId: firstBrand.id,
        stock: 10,
        isActive: true
      }
    });
    
    console.log('✅ Простой продукт создан:', simpleProduct);
    
    // Проверяем, что продукт создался
    const products = await prisma.product.findMany();
    console.log('Всего продуктов:', products.length);
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSimpleProduct();


