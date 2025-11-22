import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function create10Products() {
  try {
    console.log('🚀 Создаем 10 продуктов для тестирования...');

    // Получаем бренды
    const brands = await prisma.brand.findMany();
    if (brands.length === 0) {
      console.log('❌ Нет брендов в базе данных');
      return;
    }

    // Получаем категории
    const categories = await prisma.category.findMany();
    if (categories.length === 0) {
      console.log('❌ Нет категорий в базе данных');
      return;
    }

    console.log(`✅ Найдено брендов: ${brands.length}`);
    console.log(`✅ Найдено категорий: ${categories.length}`);

    const products = [
      {
        name: 'Ароматическая свеча "Лаванда"',
        slug: 'aromaticheskaya-svecha-lavanda',
        description: 'Роскошная ароматическая свеча с ароматом лаванды. Создает атмосферу спокойствия и уюта.',
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
        brandId: brands[0].id,
        categoryId: categories[0].id,
      },
      {
        name: 'Диффузор "Цитрусовый микс"',
        slug: 'diffuzor-citrusovyy-miks',
        description: 'Элегантный диффузор с ароматом цитрусовых. Идеально подходит для гостиной.',
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
        categoryId: categories[1].id,
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
        categoryId: categories[2].id,
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
        categoryId: categories[0].id,
      },
      {
        name: 'Диффузор "Роза и жасмин"',
        slug: 'diffuzor-roza-i-zhasmin',
        description: 'Романтичный диффузор с ароматом розы и жасмина. Создает атмосферу нежности.',
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
        categoryId: categories[1].id,
      },
      {
        name: 'Эфирное масло "Мята"',
        slug: 'efirnoe-maslo-myata',
        description: 'Натуральное эфирное масло мяты. Освежает и бодрит, идеально для утренних процедур.',
        shortDescription: 'Эфирное масло мяты',
        price: 1200,
        comparePrice: 1500,
        sku: 'OIL-MINT-001',
        volume: '10ml',
        gender: 'unisex',
        aromaFamily: 'herbal',
        ingredients: '100% натуральное эфирное масло мяты',
        stock: 30,
        isActive: true,
        isFeatured: false,
        brandId: brands[0].id,
        categoryId: categories[3].id,
      },
      {
        name: 'Благовония "Ладан"',
        slug: 'blagovoniya-ladan',
        description: 'Традиционные благовония с ароматом ладана. Создают духовную атмосферу.',
        shortDescription: 'Благовония с ароматом ладана',
        price: 600,
        comparePrice: 800,
        sku: 'INC-INC-001',
        volume: '15шт',
        gender: 'unisex',
        aromaFamily: 'woody',
        ingredients: 'Натуральные благовония, ладан',
        stock: 40,
        isActive: true,
        isFeatured: false,
        brandId: brands[0].id,
        categoryId: categories[4].id,
      },
      {
        name: 'Ароматический спрей "Эвкалипт"',
        slug: 'aromaticheskiy-sprey-evkalipt',
        description: 'Освежающий ароматический спрей с ароматом эвкалипта. Идеален для офиса.',
        shortDescription: 'Спрей с ароматом эвкалипта',
        price: 1800,
        comparePrice: 2200,
        sku: 'SPRAY-EUC-001',
        volume: '150ml',
        gender: 'unisex',
        aromaFamily: 'fresh',
        ingredients: 'Дистиллированная вода, эфирное масло эвкалипта',
        stock: 20,
        isActive: true,
        isFeatured: true,
        brandId: brands[0].id,
        categoryId: categories[5].id,
      },
      {
        name: 'Свечи "Кедр и сосна"',
        slug: 'svechi-kedr-i-sosna',
        description: 'Лесные ароматические свечи с нотами кедра и сосны. Напоминают о прогулке в лесу.',
        shortDescription: 'Свечи с ароматом кедра и сосны',
        price: 2600,
        comparePrice: 3000,
        sku: 'CANDLE-CED-001',
        volume: '180ml',
        gender: 'men',
        aromaFamily: 'woody',
        ingredients: 'Пчелиный воск, эфирные масла кедра и сосны',
        stock: 14,
        isActive: true,
        isFeatured: false,
        brandId: brands[0].id,
        categoryId: categories[0].id,
      },
      {
        name: 'Домашний ароматизатор "Жасмин"',
        slug: 'domashniy-aromatizator-zhasmin',
        description: 'Нежный домашний ароматизатор с ароматом жасмина. Создает романтичную атмосферу.',
        shortDescription: 'Ароматизатор с ароматом жасмина',
        price: 2200,
        comparePrice: 2600,
        sku: 'HOME-JAS-001',
        volume: '200ml',
        gender: 'women',
        aromaFamily: 'floral',
        ingredients: 'Натуральные ароматические масла, жасмин',
        stock: 16,
        isActive: true,
        isFeatured: true,
        brandId: brands[0].id,
        categoryId: categories[6].id,
      },
    ];

    let createdCount = 0;
    let skippedCount = 0;

    for (const productData of products) {
      try {
        // Проверяем, существует ли продукт
        const existingProduct = await prisma.product.findUnique({
          where: { slug: productData.slug },
        });

        if (!existingProduct) {
          const product = await prisma.product.create({
            data: {
              name: productData.name,
              slug: productData.slug,
              description: productData.description,
              shortDescription: productData.shortDescription,
              price: productData.price,
              comparePrice: productData.comparePrice,
              sku: productData.sku,
              volume: productData.volume,
              gender: productData.gender,
              aromaFamily: productData.aromaFamily,
              ingredients: productData.ingredients,
              stock: productData.stock,
              isActive: productData.isActive,
              isFeatured: productData.isFeatured,
              brandId: productData.brandId,
              productCategories: {
                create: {
                  categoryId: productData.categoryId,
                  isPrimary: true,
                },
              },
            },
          });

          console.log(`✅ Создан: ${product.name}`);
          createdCount++;
        } else {
          console.log(`⏭️  Пропущен (уже существует): ${productData.name}`);
          skippedCount++;
        }
      } catch (error) {
        console.log(`❌ Ошибка при создании ${productData.name}:`, error);
      }
    }

    console.log(`\n🎉 Завершено!`);
    console.log(`✅ Создано: ${createdCount} продуктов`);
    console.log(`⏭️  Пропущено: ${skippedCount} продуктов`);

    // Проверяем общее количество продуктов
    const totalProducts = await prisma.product.count();
    console.log(`📊 Всего продуктов в базе данных: ${totalProducts}`);

  } catch (error) {
    console.error('❌ Ошибка при создании продуктов:', error);
  } finally {
    await prisma.$disconnect();
  }
}

create10Products();


