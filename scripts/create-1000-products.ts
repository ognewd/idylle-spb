import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Массивы данных для генерации
const productNames = [
  'Ароматическая свеча',
  'Диффузор',
  'Ароматические палочки',
  'Эфирное масло',
  'Благовония',
  'Ароматический спрей',
  'Свечи для медитации',
  'Домашний ароматизатор',
  'Ароматический гель',
  'Свечи из соевого воска'
];

const fragrances = [
  'Лаванда', 'Ваниль', 'Сандал', 'Жасмин', 'Роза', 'Корица', 'Цитрус', 'Мята',
  'Эвкалипт', 'Бергамот', 'Пачули', 'Иланг-Иланг', 'Розмарин', 'Ладан', 'Мирра',
  'Амбра', 'Мускус', 'Фиалка', 'Ландыш', 'Лаванда', 'Лимон', 'Апельсин', 'Грейпфрут',
  'Мандарин', 'Кедр', 'Сосна', 'Ель', 'Кипарис', 'Можжевельник', 'Тимьян', 'Базилик'
];

const brands = [
  'Dr. Vranjes Firenze', 'Jo Malone', 'Diptyque', 'Byredo', 'Le Labo', 'Maison Margiela',
  'Tom Ford', 'Hermès', 'Chanel', 'Dior', 'Yves Saint Laurent', 'Giorgio Armani',
  'Versace', 'Dolce & Gabbana', 'Prada', 'Bottega Veneta', 'Gucci', 'Louis Vuitton',
  'Cartier', 'Bulgari', 'Tiffany & Co.', 'Chopard', 'Piaget', 'Van Cleef & Arpels'
];

const categories = [
  'Свечи', 'Диффузоры', 'Ароматические палочки', 'Эфирные масла', 'Благовония',
  'Ароматические спреи', 'Домашние ароматизаторы', 'Ароматические гели'
];

const aromas = ['floral', 'woody', 'fresh', 'oriental', 'fruity', 'citrus', 'herbal', 'spicy'];

async function create1000Products() {
  try {
    console.log('🚀 Создаем 1000 продуктов для тестирования производительности...');

    // Получаем все бренды
    const allBrands = await prisma.brand.findMany();
    if (allBrands.length === 0) {
      console.log('❌ Нет брендов в базе данных');
      return;
    }

    // Получаем все категории
    const allCategories = await prisma.category.findMany();
    if (allCategories.length === 0) {
      console.log('❌ Нет категорий в базе данных');
      return;
    }

    console.log(`✅ Найдено брендов: ${allBrands.length}`);
    console.log(`✅ Найдено категорий: ${allCategories.length}`);

    const productsToCreate = [];
    const batchSize = 50; // Создаем по 50 продуктов за раз

    for (let i = 1; i <= 1000; i++) {
      const productName = productNames[Math.floor(Math.random() * productNames.length)];
      const fragrance = fragrances[Math.floor(Math.random() * fragrances.length)];
      const brand = allBrands[Math.floor(Math.random() * allBrands.length)];
      const category = allCategories[Math.floor(Math.random() * allCategories.length)];
      const aroma = aromas[Math.floor(Math.random() * aromas.length)];

      const productData = {
        name: `${productName} "${fragrance}" #${i}`,
        slug: `product-${i}-${fragrance.toLowerCase().replace(/\s+/g, '-')}`,
        description: `Роскошный ${productName.toLowerCase()} с ароматом ${fragrance.toLowerCase()}. Создает неповторимую атмосферу в вашем доме.`,
        shortDescription: `${productName} с ароматом ${fragrance}`,
        price: Math.floor(Math.random() * 5000) + 1000, // От 1000 до 6000
        comparePrice: Math.floor(Math.random() * 1000) + 500, // Сравнительная цена
        sku: `PROD-${i.toString().padStart(4, '0')}`,
        volume: `${Math.floor(Math.random() * 500) + 50}ml`,
        gender: ['men', 'women', 'unisex'][Math.floor(Math.random() * 3)],
        aromaFamily: aroma,
        ingredients: `Натуральные ингредиенты, эфирное масло ${fragrance.toLowerCase()}`,
        stock: Math.floor(Math.random() * 100) + 1,
        isActive: true,
        isFeatured: Math.random() > 0.9, // 10% продуктов featured
        brandId: brand.id,
        productCategories: {
          create: {
            categoryId: category.id,
            isPrimary: true,
          },
        },
      };

      productsToCreate.push(productData);

      // Создаем батч каждые 50 продуктов
      if (productsToCreate.length === batchSize || i === 1000) {
        console.log(`📦 Создаем батч ${productsToCreate.length} продуктов (${i - productsToCreate.length + 1}-${i})...`);
        
        for (const productData of productsToCreate) {
          try {
            await prisma.product.create({ data: productData });
          } catch (error) {
            console.log(`⚠️  Пропускаем продукт ${productData.name} (возможно, дубликат)`);
          }
        }
        
        productsToCreate.length = 0; // Очищаем массив
        console.log(`✅ Батч завершен. Создано: ${i} продуктов`);
      }
    }

    console.log('🎉 Все 1000 продуктов созданы!');

    // Проверяем количество продуктов в базе
    const totalProducts = await prisma.product.count();
    console.log(`📊 Всего продуктов в базе данных: ${totalProducts}`);

  } catch (error) {
    console.error('❌ Ошибка при создании продуктов:', error);
  } finally {
    await prisma.$disconnect();
  }
}

create1000Products();


