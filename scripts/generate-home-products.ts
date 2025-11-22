import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';

config({ path: '.env.local' });
const prisma = new PrismaClient();

// Данные для генерации
const productTypes = ['Свеча', 'Диффузор', 'Спрей для дома', 'Саше', 'Ароматические палочки'];
const scents = [
  'Лаванда', 'Ваниль', 'Сандал', 'Роза', 'Жасмин', 'Бергамот', 'Цитрус',
  'Мускус', 'Амбра', 'Пачули', 'Кедр', 'Иланг-иланг', 'Корица', 'Мята',
  'Эвкалипт', 'Сосна', 'Апельсин', 'Лимон', 'Вербена', 'Фиалка'
];
const aromaFamilies = [
  'Цитрусовые', 'Цветочные', 'Древесные', 'Восточные', 'Свежие', 'Пряные', 'Фруктовые'
];
const volumes = ['100 мл', '150 мл', '200 мл', '250 мл', '300 мл', '500 мл'];
const weights = [0.3, 0.5, 0.7, 1.0, 1.5, 2.0];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSKU(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const nums = '0123456789';
  let sku = '';
  for (let i = 0; i < 3; i++) {
    sku += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  sku += '-';
  for (let i = 0; i < 4; i++) {
    sku += nums.charAt(Math.floor(Math.random() * nums.length));
  }
  return sku;
}

function transliterate(text: string): string {
  const ru: { [key: string]: string } = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '',
    'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya', ' ': '-'
  };
  
  return text.toLowerCase().split('').map(char => ru[char] || char).join('').replace(/[^a-z0-9-]/g, '');
}

async function main() {
  console.log('🏠 Генерация 100 товаров для категории "Ароматы для дома"...\n');

  // Найти категорию
  const homeCategory = await prisma.category.findFirst({
    where: { slug: 'home' },
  });

  if (!homeCategory) {
    console.error('❌ Категория "home" не найдена');
    return;
  }

  console.log(`✅ Найдена категория: ${homeCategory.name}\n`);

  // Найти или создать бренды
  const brandNames = ['Mathilde M', 'Maison Berger', 'Diptyque', 'Cire Trudon', 'L\'Artisan Parfumeur'];
  const brands = [];

  for (const brandName of brandNames) {
    let brand = await prisma.brand.findFirst({
      where: { name: brandName },
    });

    if (!brand) {
      brand = await prisma.brand.create({
        data: {
          name: brandName,
          slug: transliterate(brandName),
          isActive: true,
        },
      });
      console.log(`✅ Создан бренд: ${brandName}`);
    }
    brands.push(brand);
  }

  console.log(`\n📦 Создание 100 товаров...\n`);

  const products = [];
  for (let i = 1; i <= 100; i++) {
    const productType = getRandomElement(productTypes);
    const scent = getRandomElement(scents);
    const aromaFamily = getRandomElement(aromaFamilies);
    const brand = getRandomElement(brands);
    const volume = getRandomElement(volumes);
    const basePrice = getRandomInt(1500, 8000);
    const hasComparePrice = Math.random() > 0.7;
    const comparePrice = hasComparePrice ? basePrice + getRandomInt(500, 2000) : null;
    const stock = getRandomInt(0, 50);
    const isFeatured = Math.random() > 0.9;
    const weight = getRandomElement(weights);

    const name = `${productType} "${scent}"`;
    const slug = `${transliterate(name)}-${i}`;
    const sku = generateSKU();

    const description = `Роскошный ${productType.toLowerCase()} с ароматом ${scent.toLowerCase()}. ` +
      `Создает атмосферу уюта и комфорта в вашем доме. ` +
      `Изысканная композиция из ${aromaFamily.toLowerCase()} нот подарит незабываемые ощущения. ` +
      `Идеально подходит для гостиной, спальни или офиса.`;

    const shortDescription = `${productType} с ароматом ${scent.toLowerCase()} от ${brand.name}`;

    const ingredients = [
      scent,
      getRandomElement(scents),
      getRandomElement(scents)
    ].join(', ');

    try {
      const product = await prisma.product.create({
        data: {
          name,
          slug,
          description,
          shortDescription,
          price: basePrice,
          comparePrice,
          sku,
          volume,
          gender: 'unisex',
          aromaFamily,
          ingredients,
          stock,
          weight,
          isActive: true,
          isFeatured,
          brandId: brand.id,
          productCategories: {
            create: [
              {
                categoryId: homeCategory.id,
                isPrimary: true,
              },
            ],
          },
          images: {
            create: [
              {
                url: '/placeholder-product.jpg',
                alt: name,
                sortOrder: 0,
                isPrimary: true,
              },
            ],
          },
        },
      });

      products.push(product);

      if (i % 10 === 0) {
        console.log(`✅ Создано ${i} товаров...`);
      }
    } catch (error: any) {
      console.error(`❌ Ошибка при создании товара ${i}: ${error.message}`);
    }
  }

  console.log(`\n✅ Успешно создано ${products.length} товаров!\n`);

  // Статистика
  const stats = {
    total: products.length,
    inStock: products.filter(p => p.stock > 0).length,
    outOfStock: products.filter(p => p.stock === 0).length,
    featured: products.filter(p => p.isFeatured).length,
    withDiscount: products.filter(p => p.comparePrice !== null).length,
  };

  console.log('📊 Статистика:');
  console.log(`   Всего товаров: ${stats.total}`);
  console.log(`   В наличии: ${stats.inStock}`);
  console.log(`   Нет в наличии: ${stats.outOfStock}`);
  console.log(`   Рекомендуемых: ${stats.featured}`);
  console.log(`   Со скидкой: ${stats.withDiscount}`);
  console.log(`\n💰 Диапазон цен: ${Math.min(...products.map(p => Number(p.price)))} - ${Math.max(...products.map(p => Number(p.price)))} ₽`);

  // Статистика по брендам
  console.log('\n🏷️  Распределение по брендам:');
  for (const brand of brands) {
    const count = products.filter(p => p.brandId === brand.id).length;
    console.log(`   ${brand.name}: ${count} товаров`);
  }

  // Статистика по типам
  console.log('\n📦 Распределение по типам:');
  const typeCounts: { [key: string]: number } = {};
  products.forEach(p => {
    const type = p.name.split(' ')[0];
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });
  Object.entries(typeCounts).forEach(([type, count]) => {
    console.log(`   ${type}: ${count} шт.`);
  });

  console.log('\n🎉 Генерация завершена!');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });




