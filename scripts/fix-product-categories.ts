import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixProductCategories() {
  try {
    console.log('🔧 Исправляем категории товаров...');

    // Получаем все товары
    const products = await prisma.product.findMany({
      include: {
        productCategories: {
          include: {
            category: true,
          },
        },
      },
    });

    // Получаем категории
    const candlesCategory = await prisma.category.findUnique({ where: { slug: 'candles' } });
    const diffusersCategory = await prisma.category.findUnique({ where: { slug: 'diffusers' } });
    const incenseCategory = await prisma.category.findUnique({ where: { slug: 'incense' } });
    const essentialOilsCategory = await prisma.category.findUnique({ where: { slug: 'essential-oils' } });
    const homeCategory = await prisma.category.findUnique({ where: { slug: 'home' } });

    console.log('📂 Категории найдены:', {
      candles: !!candlesCategory,
      diffusers: !!diffusersCategory,
      incense: !!incenseCategory,
      essentialOils: !!essentialOilsCategory,
      home: !!homeCategory,
    });

    // Удаляем все существующие связи товаров с категориями
    await prisma.productCategory.deleteMany({});
    console.log('🗑️  Удалены все связи товаров с категориями');

    // Создаем правильные связи
    for (const product of products) {
      let targetCategory = null;

      // Определяем категорию на основе названия товара
      if (product.name.includes('свеча') || product.name.includes('Свечи')) {
        targetCategory = candlesCategory;
      } else if (product.name.includes('диффузор') || product.name.includes('Диффузор')) {
        targetCategory = diffusersCategory;
      } else if (product.name.includes('палочки') || product.name.includes('благовония') || product.name.includes('Палочки') || product.name.includes('Благовония')) {
        targetCategory = incenseCategory;
      } else if (product.name.includes('масло') || product.name.includes('Масло')) {
        targetCategory = essentialOilsCategory;
      } else {
        targetCategory = homeCategory; // По умолчанию - ароматы для дома
      }

      if (targetCategory) {
        await prisma.productCategory.create({
          data: {
            productId: product.id,
            categoryId: targetCategory.id,
            isPrimary: true,
          },
        });
        console.log(`✅ ${product.name} → ${targetCategory.name}`);
      } else {
        console.log(`⚠️  Не найдена категория для товара: ${product.name}`);
      }
    }

    console.log('\n🎉 Категории товаров исправлены!');

    // Проверяем результат
    const updatedProducts = await prisma.product.findMany({
      include: {
        productCategories: {
          include: {
            category: true,
          },
        },
      },
    });

    console.log('\n📦 Обновленные товары:');
    updatedProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} → ${product.productCategories.map(pc => pc.category.name).join(', ')}`);
    });

  } catch (error) {
    console.error('❌ Ошибка при исправлении категорий:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixProductCategories();