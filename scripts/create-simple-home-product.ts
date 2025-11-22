import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createSimpleHomeProduct() {
  try {
    console.log('🏠 Создаем простой продукт для дома...');

    // Создаем категорию "Ароматы для дома" если её нет
    const homeCategory = await prisma.category.upsert({
      where: { slug: 'home' },
      update: {},
      create: {
        id: 'cat_home',
        name: 'Ароматы для дома',
        slug: 'home',
        description: 'Ароматы и товары для создания уютной атмосферы в доме',
        image: '/images/categories/home.jpg',
        sortOrder: 1,
        isActive: true,
      },
    });

    console.log('✅ Категория "Ароматы для дома" создана/найдена');

    // Получаем первый бренд
    const brand = await prisma.brand.findFirst();
    if (!brand) {
      console.log('❌ Нет брендов в базе данных');
      return;
    }

    console.log(`✅ Используем бренд: ${brand.name}`);

    // Создаем простой продукт
    const product = await prisma.product.create({
      data: {
        name: 'Ароматическая свеча "Лаванда"',
        slug: 'aromaticheskaya-svecha-lavanda',
        description: 'Роскошная ароматическая свеча с ароматом лаванды',
        shortDescription: 'Свеча с ароматом лаванды',
        price: 2500,
        comparePrice: 3000,
        sku: 'CANDLE-LAV-001',
        volume: '200ml',
        gender: 'unisex',
        aromaFamily: 'floral',
        ingredients: 'Пчелиный воск, эфирное масло лаванды',
        stock: 15,
        isActive: true,
        isFeatured: true,
        brandId: brand.id,
        productCategories: {
          create: {
            categoryId: homeCategory.id,
            isPrimary: true,
          },
        },
      },
    });

    console.log(`✅ Создан продукт: ${product.name}`);
    console.log('🎉 Продукт успешно добавлен!');

  } catch (error) {
    console.error('❌ Ошибка при создании продукта:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSimpleHomeProduct();


