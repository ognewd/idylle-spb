import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';

config({ path: '.env.local' });
const prisma = new PrismaClient();

const volumeVariants = [
  { name: 'Объем', value: '100 мл', priceModifier: -500 },
  { name: 'Объем', value: '150 мл', priceModifier: -200 },
  { name: 'Объем', value: '200 мл', priceModifier: 0 },
  { name: 'Объем', value: '250 мл', priceModifier: 300 },
  { name: 'Объем', value: '300 мл', priceModifier: 600 },
  { name: 'Объем', value: '500 мл', priceModifier: 1200 },
];

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log('🔄 Добавление вариантов к товарам...\n');

  // Получить все товары категории "home"
  const products = await prisma.product.findMany({
    where: {
      productCategories: {
        some: {
          category: {
            slug: 'home',
          },
        },
      },
    },
    include: {
      variants: true,
    },
  });

  console.log(`📦 Найдено товаров: ${products.length}\n`);

  // Выбрать 50% товаров случайным образом для добавления вариантов
  const shuffled = products.sort(() => 0.5 - Math.random());
  const selectedProducts = shuffled.slice(0, Math.floor(products.length * 0.5));

  console.log(`🎯 Будет обработано товаров: ${selectedProducts.length}\n`);

  let variantsCreated = 0;

  for (const product of selectedProducts) {
    // Случайно выбрать от 2 до 4 вариантов
    const numVariants = getRandomInt(2, 4);
    const selectedVariants = volumeVariants.sort(() => 0.5 - Math.random()).slice(0, numVariants);

    let sortOrder = 0;
    for (const variant of selectedVariants) {
      const variantPrice = Number(product.price) + variant.priceModifier;
      const hasComparePrice = Math.random() > 0.7;
      const comparePrice = hasComparePrice ? variantPrice + getRandomInt(300, 1000) : null;
      const stock = getRandomInt(0, 30);
      const isDefault = sortOrder === 0;

      try {
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            name: variant.name,
            value: variant.value,
            price: variantPrice,
            comparePrice,
            stock,
            isDefault,
            sortOrder,
          },
        });

        variantsCreated++;
        sortOrder++;
      } catch (error: any) {
        console.error(`❌ Ошибка при создании варианта для товара ${product.name}: ${error.message}`);
      }
    }

    if (variantsCreated % 20 === 0) {
      console.log(`✅ Создано ${variantsCreated} вариантов...`);
    }
  }

  console.log(`\n✅ Всего создано вариантов: ${variantsCreated}`);

  // Статистика
  const productsWithVariants = await prisma.product.count({
    where: {
      variants: {
        some: {},
      },
      productCategories: {
        some: {
          category: {
            slug: 'home',
          },
        },
      },
    },
  });

  console.log(`\n📊 Статистика:`);
  console.log(`   Товаров с вариантами: ${productsWithVariants}`);
  console.log(`   Товаров без вариантов: ${products.length - productsWithVariants}`);
  console.log(`   Среднее вариантов на товар: ${(variantsCreated / productsWithVariants).toFixed(1)}`);

  console.log('\n🎉 Генерация вариантов завершена!');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });




