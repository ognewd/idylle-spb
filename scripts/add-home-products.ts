import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addHomeProducts() {
  try {
    console.log('🏠 Добавляем продукты для категории "Ароматы для дома"...');

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

    // Получаем бренды
    const brands = await prisma.brand.findMany();
    if (brands.length === 0) {
      console.log('❌ Нет брендов в базе данных');
      return;
    }

    // Создаем продукты для дома
    const homeProducts = [
      {
        name: 'Ароматические свечи "Лаванда"',
        slug: 'aromaticheskie-svechi-lavanda',
        description: 'Роскошные ароматические свечи с ароматом лаванды. Создают атмосферу спокойствия и уюта в вашем доме.',
        shortDescription: 'Свечи с ароматом лаванды для уюта дома',
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
        brandId: brands[0].id,
      },
      {
        name: 'Диффузор "Цитрусовый микс"',
        slug: 'diffuzor-citrusovyy-miks',
        description: 'Элегантный диффузор с ароматом цитрусовых. Идеально подходит для гостиной и спальни.',
        shortDescription: 'Диффузор с цитрусовым ароматом',
        price: 3200,
        comparePrice: 3800,
        sku: 'DIFF-CIT-001',
        volume: '100ml',
        gender: 'unisex',
        aromaFamily: 'fresh',
        ingredients: 'Дистиллированная вода, эфирные масла цитрусовых',
        stock: 12,
        isActive: true,
        isFeatured: true,
        brandId: brands[0].id,
      },
      {
        name: 'Ароматические палочки "Сандал"',
        slug: 'aromaticheskie-palochki-sandal',
        description: 'Традиционные ароматические палочки с ароматом сандала. Создают медитативную атмосферу.',
        shortDescription: 'Палочки с ароматом сандала',
        price: 800,
        comparePrice: 1000,
        sku: 'INC-SAND-001',
        volume: '20шт',
        gender: 'unisex',
        aromaFamily: 'woody',
        ingredients: 'Натуральные ароматические масла, сандал',
        stock: 25,
        isActive: true,
        isFeatured: false,
        brandId: brands[0].id,
      },
      {
        name: 'Свечи "Ваниль и корица"',
        slug: 'svechi-vanil-i-korica',
        description: 'Теплые ароматические свечи с нотами ванили и корицы. Идеальны для осенних вечеров.',
        shortDescription: 'Свечи с ароматом ванили и корицы',
        price: 2800,
        comparePrice: 3200,
        sku: 'CANDLE-VAN-001',
        volume: '250ml',
        gender: 'unisex',
        aromaFamily: 'oriental',
        ingredients: 'Соевый воск, эфирные масла ванили и корицы',
        stock: 18,
        isActive: true,
        isFeatured: true,
        brandId: brands[0].id,
      },
      {
        name: 'Диффузор "Роза и жасмин"',
        slug: 'diffuzor-roza-i-zhasmin',
        description: 'Романтичный диффузор с ароматом розы и жасмина. Создает атмосферу нежности и любви.',
        shortDescription: 'Диффузор с ароматом розы и жасмина',
        price: 3500,
        comparePrice: 4000,
        sku: 'DIFF-ROSE-001',
        volume: '120ml',
        gender: 'women',
        aromaFamily: 'floral',
        ingredients: 'Дистиллированная вода, эфирные масла розы и жасмина',
        stock: 10,
        isActive: true,
        isFeatured: false,
        brandId: brands[0].id,
      },
    ];

    for (const productData of homeProducts) {
      // Проверяем, существует ли продукт
      const existingProduct = await prisma.product.findUnique({
        where: { slug: productData.slug },
      });

      if (!existingProduct) {
        const product = await prisma.product.create({
          data: {
            ...productData,
            productCategories: {
              create: {
                categoryId: homeCategory.id,
                isPrimary: true,
              },
            },
          },
        });

        console.log(`✅ Создан продукт: ${product.name}`);
      } else {
        console.log(`⏭️  Продукт уже существует: ${productData.name}`);
      }
    }

    console.log('🎉 Все продукты для дома добавлены!');

  } catch (error) {
    console.error('❌ Ошибка при добавлении продуктов:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addHomeProducts();
