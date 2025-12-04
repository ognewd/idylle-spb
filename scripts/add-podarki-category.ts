import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Добавляем категорию "Подарки" в базу данных...');

  // Проверяем, существует ли категория "podarki"
  const existingCategory = await prisma.category.findUnique({
    where: { slug: 'podarki' },
  });

  if (existingCategory) {
    console.log('✅ Категория "Подарки" уже существует:', existingCategory.name);
    return;
  }

  // Получаем максимальный sortOrder
  const maxSortOrder = await prisma.category.aggregate({
    _max: {
      sortOrder: true,
    },
  });

  const nextSortOrder = (maxSortOrder._max.sortOrder || 0) + 1;

  // Создаем категорию "Подарки"
  const category = await prisma.category.create({
    data: {
      name: 'Подарки',
      slug: 'podarki',
      description: 'Идеальные подарки для ваших близких - ароматы и товары для дома, которые создадут незабываемые впечатления',
      isActive: true,
      sortOrder: nextSortOrder,
    },
  });

  console.log('✅ Категория "Подарки" успешно создана:');
  console.log('   ID:', category.id);
  console.log('   Название:', category.name);
  console.log('   Slug:', category.slug);
  console.log('   Описание:', category.description);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при добавлении категории:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


