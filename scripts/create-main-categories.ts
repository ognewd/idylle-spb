import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createMainCategories() {
  try {
    console.log('🌱 Создаем основные категории...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? `${process.env.DATABASE_URL.split('@')[0]}@***` : 'не установлен');

    // Три основные категории из навигации
    const categories = [
      {
        name: 'Ароматы для дома',
        slug: 'aromaty-dlya-doma',
        description: 'Ароматические свечи, диффузоры и аксессуары для создания уютной атмосферы дома',
        pageContent: null, // Можно добавить HTML контент позже через админку
        sortOrder: 1,
        isActive: true,
      },
      {
        name: 'Уют и интерьер',
        slug: 'uyut-i-interer',
        description: 'Элементы декора и интерьера для создания особой атмосферы в доме',
        pageContent: null,
        sortOrder: 2,
        isActive: true,
      },
      {
        name: 'Подарки',
        slug: 'podarki',
        description: 'Идеальные подарки для особенных моментов и близких людей',
        pageContent: null,
        sortOrder: 3,
        isActive: true,
      },
    ];

    const createdCategories = [];

    for (const categoryData of categories) {
      const category = await prisma.category.upsert({
        where: { slug: categoryData.slug },
        update: {
          name: categoryData.name,
          description: categoryData.description,
          // Не обновляем pageContent если он уже есть
        },
        create: categoryData,
      });

      createdCategories.push(category);
      console.log(`✅ Категория "${category.name}" создана/обновлена (slug: ${category.slug})`);
    }

    console.log(`\n🎉 Создано категорий: ${createdCategories.length}`);
    console.log('\n📋 Список категорий:');
    createdCategories.forEach((cat, index) => {
      console.log(`   ${index + 1}. ${cat.name} (${cat.slug})`);
    });

  } catch (error) {
    console.error('❌ Ошибка при создании категорий:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createMainCategories();

