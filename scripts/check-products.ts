import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProducts() {
  try {
    console.log('🔍 Проверяем товары в базе данных...');

    // Проверяем все товары
    const allProducts = await prisma.product.findMany({
      include: {
        productCategories: {
          include: {
            category: true,
          },
        },
        brand: true,
      },
    });

    console.log(`📦 Всего товаров: ${allProducts.length}`);

    // Показываем все товары с их категориями
    allProducts.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name}`);
      console.log(`   Цена: ${product.price} ₽`);
      console.log(`   Бренд: ${product.brand?.name || 'Не указан'}`);
      console.log(`   Категории: ${product.productCategories.map(pc => pc.category.name).join(', ')}`);
      console.log(`   Активен: ${product.isActive ? '✅' : '❌'}`);
    });

    // Проверяем категории
    const categories = await prisma.category.findMany();
    console.log(`\n📂 Доступные категории:`);
    categories.forEach(category => {
      console.log(`   - ${category.name} (${category.slug})`);
    });

  } catch (error) {
    console.error('❌ Ошибка при проверке товаров:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProducts();


