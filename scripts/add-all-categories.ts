import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Проверяем и добавляем все необходимые категории...');

  // Определяем все категории, которые используются в коде
  const requiredCategories = [
    {
      name: 'Ароматы для дома',
      slug: 'aromaty-dlya-doma',
      description: 'Ароматы и товары для создания уютной атмосферы в доме',
      sortOrder: 1,
    },
    {
      name: 'Уют и интерьер',
      slug: 'uyut-i-interer',
      description: 'Товары для создания уюта и улучшения интерьера',
      sortOrder: 2,
    },
    {
      name: 'Подарки',
      slug: 'podarki',
      description: 'Идеальные подарки для ваших близких - ароматы и товары для дома, которые создадут незабываемые впечатления',
      sortOrder: 3,
    },
  ];

  console.log(`📋 Найдено ${requiredCategories.length} категорий для проверки\n`);

  // Проверяем и создаем каждую категорию
  for (const categoryData of requiredCategories) {
    const existing = await prisma.category.findUnique({
      where: { slug: categoryData.slug },
    });

    if (existing) {
      console.log(`✅ Категория "${categoryData.name}" уже существует (ID: ${existing.id})`);
      // Обновляем, если нужно
      await prisma.category.update({
        where: { slug: categoryData.slug },
        data: {
          name: categoryData.name,
          description: categoryData.description,
          sortOrder: categoryData.sortOrder,
          isActive: true,
        },
      });
      console.log(`   Обновлена: ${categoryData.name}`);
    } else {
      const category = await prisma.category.create({
        data: {
          name: categoryData.name,
          slug: categoryData.slug,
          description: categoryData.description,
          sortOrder: categoryData.sortOrder,
          isActive: true,
        },
      });
      console.log(`✅ Создана категория: "${categoryData.name}" (ID: ${category.id})`);
    }
    console.log('');
  }

  // Выводим все категории
  const allCategories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });

  console.log('📊 Все активные категории в базе данных:');
  console.log('─'.repeat(60));
  allCategories.forEach((cat, index) => {
    console.log(`${index + 1}. ${cat.name} (slug: ${cat.slug})`);
    if (cat.description) {
      console.log(`   ${cat.description}`);
    }
  });
  console.log('─'.repeat(60));
  console.log(`\n✅ Всего категорий: ${allCategories.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при проверке/добавлении категорий:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


