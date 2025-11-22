import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function testAPI() {
  console.log('🧪 Тестируем API функции...');
  try {
    await prisma.$connect();
    console.log('✅ Подключение к базе данных успешно!');

    // Тест 1: Создание бренда
    console.log('\n📝 Тест 1: Создание бренда...');
    const testBrand = await prisma.brand.create({
      data: {
        name: 'Test Brand',
        slug: 'test-brand',
        description: 'Test brand description',
        isActive: true
      }
    });
    console.log('✅ Бренд создан:', testBrand);

    // Тест 2: Создание категории
    console.log('\n📝 Тест 2: Создание категории...');
    const testCategory = await prisma.category.create({
      data: {
        name: 'Test Category',
        slug: 'test-category',
        description: 'Test category description',
        isActive: true
      }
    });
    console.log('✅ Категория создана:', testCategory);

    // Тест 3: Создание продукта
    console.log('\n📝 Тест 3: Создание продукта...');
    const testProduct = await prisma.product.create({
      data: {
        name: 'Test Product',
        slug: 'test-product',
        description: 'Test product description',
        price: 1000.00,
        brandId: testBrand.id,
        stock: 10,
        isActive: true
      }
    });
    console.log('✅ Продукт создан:', testProduct);

    // Тест 4: Связывание продукта с категорией
    console.log('\n📝 Тест 4: Связывание продукта с категорией...');
    const productCategory = await prisma.productCategory.create({
      data: {
        productId: testProduct.id,
        categoryId: testCategory.id
      }
    });
    console.log('✅ Связь создана:', productCategory);

    // Тест 5: Получение продуктов с брендом
    console.log('\n📝 Тест 5: Получение продуктов с брендом...');
    const products = await prisma.product.findMany({
      include: {
        brand: true
      }
    });
    console.log('✅ Продукты получены:', products.length, 'штук');

    // Очистка тестовых данных
    console.log('\n🧹 Очистка тестовых данных...');
    await prisma.productCategory.deleteMany({
      where: { productId: testProduct.id }
    });
    await prisma.product.delete({
      where: { id: testProduct.id }
    });
    await prisma.category.delete({
      where: { id: testCategory.id }
    });
    await prisma.brand.delete({
      where: { id: testBrand.id }
    });
    console.log('✅ Тестовые данные удалены');

    console.log('\n🎉 Все тесты прошли успешно!');

  } catch (error) {
    console.error('❌ Ошибка в тестах:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAPI();
