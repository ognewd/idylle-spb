import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateCategoryContent() {
  try {
    console.log('📝 Переносим контент категории "Ароматы для дома" в базу данных...');

    // HTML контент из существующей страницы
    const content = `<p class="leading-relaxed">
У каждого из нас свой дом… И исторически так сложилось, что с первого шага, как только мы открываем дверь, мы слышим запах дома, и потом видим обстановку, детали интерьера. Если аромат приятный, нам хочется им дышать, чувствовать его. Мы просыпаемся в хорошем настроении, благодаря аромату, испытываем полное пробуждение или расслабление в ванной комнате, видим атмосферу гостиной и уют на кухне.</p>

<p class="font-medium text-foreground">Мы даем Вам верные советы, чтобы аромат звучал в Вашем доме именно так – чувственно и проникновенно, чтобы было приятно всем членам семьи и гостям.</p>

<p>Выбирайте предметы ароматизации в соответствие с площадью комнат, регулируйте интенсивность аромата, с ним должно быть комфортно.</p>

<p class="font-medium text-foreground">AROMA BOUTIQUE IDYLLE выбирает для Вас лучшие марки Франции, Италии, Португалии. Мы работаем только с достойными производителями. Качество продукции обеспечивается международными стандартами. Со своей стороны мы дарим лучший сервис.</p>`;

    // Ищем категорию с slug aromaty-dlya-doma
    const category = await prisma.category.findUnique({
      where: { slug: 'aromaty-dlya-doma' },
    });

    if (category) {
      // Обновляем существующую категорию
      const updated = await prisma.category.update({
        where: { slug: 'aromaty-dlya-doma' },
        data: {
          pageContent: content,
        },
      });
      console.log('✅ Контент обновлен для существующей категории:', updated.name);
    } else {
      // Создаем новую категорию если её нет
      const created = await prisma.category.create({
        data: {
          name: 'Ароматы для дома',
          slug: 'aromaty-dlya-doma',
          description: 'Ароматы и товары для создания уютной атмосферы в доме',
          pageContent: content,
          isActive: true,
        },
      });
      console.log('✅ Создана новая категория с контентом:', created.name);
    }

    // Проверяем результат
    const check = await prisma.category.findUnique({
      where: { slug: 'aromaty-dlya-doma' },
      select: {
        id: true,
        name: true,
        slug: true,
        pageContent: true,
      },
    });

    if (check && check.pageContent) {
      console.log('✅ Проверка пройдена! Контент успешно сохранен в базе данных.');
      console.log('   Длина контента:', check.pageContent.length, 'символов');
    } else {
      console.log('❌ Ошибка: контент не найден после обновления');
    }
  } catch (error) {
    console.error('❌ Ошибка при миграции контента:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateCategoryContent();

