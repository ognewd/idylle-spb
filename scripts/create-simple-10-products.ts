import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createSimple10Products() {
  try {
    console.log('🚀 Создаем 10 простых продуктов...');

    // Получаем первый бренд
    const brand = await prisma.brand.findFirst();
    if (!brand) {
      console.log('❌ Нет брендов в базе данных');
      return;
    }

    console.log(`✅ Используем бренд: ${brand.name}`);

    const products = [
      {
        name: 'Ароматическая свеча "Лаванда"',
        slug: 'aromaticheskaya-svecha-lavanda-1',
        description: 'Роскошная ароматическая свеча с ароматом лаванды',
        price: 2500,
        sku: 'CANDLE-LAV-001',
        stock: 15,
      },
      {
        name: 'Диффузор "Цитрус"',
        slug: 'diffuzor-citrus-1',
        description: 'Элегантный диффузор с ароматом цитрусовых',
        price: 3200,
        sku: 'DIFF-CIT-001',
        stock: 12,
      },
      {
        name: 'Ароматические палочки "Сандал"',
        slug: 'aromaticheskie-palochki-sandal-1',
        description: 'Традиционные ароматические палочки с ароматом сандала',
        price: 800,
        sku: 'INC-SAND-001',
        stock: 25,
      },
      {
        name: 'Свечи "Ваниль"',
        slug: 'svechi-vanil-1',
        description: 'Теплые ароматические свечи с ароматом ванили',
        price: 2800,
        sku: 'CANDLE-VAN-001',
        stock: 18,
      },
      {
        name: 'Диффузор "Роза"',
        slug: 'diffuzor-roza-1',
        description: 'Романтичный диффузор с ароматом розы',
        price: 3500,
        sku: 'DIFF-ROSE-001',
        stock: 10,
      },
      {
        name: 'Эфирное масло "Мята"',
        slug: 'efirnoe-maslo-myata-1',
        description: 'Натуральное эфирное масло мяты',
        price: 1200,
        sku: 'OIL-MINT-001',
        stock: 30,
      },
      {
        name: 'Благовония "Ладан"',
        slug: 'blagovoniya-ladan-1',
        description: 'Традиционные благовония с ароматом ладана',
        price: 600,
        sku: 'INC-INC-001',
        stock: 40,
      },
      {
        name: 'Ароматический спрей "Эвкалипт"',
        slug: 'aromaticheskiy-sprey-evkalipt-1',
        description: 'Освежающий ароматический спрей с ароматом эвкалипта',
        price: 1800,
        sku: 'SPRAY-EUC-001',
        stock: 20,
      },
      {
        name: 'Свечи "Кедр"',
        slug: 'svechi-kedr-1',
        description: 'Лесные ароматические свечи с ароматом кедра',
        price: 2600,
        sku: 'CANDLE-CED-001',
        stock: 14,
      },
      {
        name: 'Домашний ароматизатор "Жасмин"',
        slug: 'domashniy-aromatizator-zhasmin-1',
        description: 'Нежный домашний ароматизатор с ароматом жасмина',
        price: 2200,
        sku: 'HOME-JAS-001',
        stock: 16,
      },
    ];

    let createdCount = 0;

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
              price: productData.price,
              sku: productData.sku,
              stock: productData.stock,
              isActive: true,
              isFeatured: Math.random() > 0.5,
              brandId: brand.id,
              productCategories: {
                create: {
                  categoryId: 'cat_3', // Свечи
                  isPrimary: true,
                },
              },
            },
          });

          console.log(`✅ Создан: ${product.name}`);
          createdCount++;
        } else {
          console.log(`⏭️  Пропущен (уже существует): ${productData.name}`);
        }
      } catch (error) {
        console.log(`❌ Ошибка при создании ${productData.name}:`, error);
      }
    }

    console.log(`\n🎉 Завершено! Создано: ${createdCount} продуктов`);

    // Проверяем общее количество продуктов
    const totalProducts = await prisma.product.count();
    console.log(`📊 Всего продуктов в базе данных: ${totalProducts}`);

  } catch (error) {
    console.error('❌ Ошибка при создании продуктов:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSimple10Products();


