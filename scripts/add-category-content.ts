import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addCategoryContent() {
  try {
    console.log('📝 Добавляем контент для категории "Ароматы для дома"...');

    const content = `
      <p class="leading-relaxed">
        У каждого из нас свой дом… И исторически так сложилось, что с первого шага, как только мы открываем дверь, 
        мы слышим запах дома, и потом видим обстановку, детали интерьера. Если аромат приятный, нам хочется им дышать, 
        чувствовать его. Мы просыпаемся в хорошем настроении, благодаря аромату, испытываем полное пробуждение или 
        расслабление в ванной комнате, видим атмосферу гостиной и уют на кухне.
      </p>

      <p class="font-medium text-foreground">
        Мы даем Вам верные советы, чтобы аромат звучал в Вашем доме именно так – чувственно и проникновенно, 
        чтобы было приятно всем членам семьи и гостям.
      </p>

      <p>
        Выбирайте предметы ароматизации в соответствие с площадью комнат, регулируйте интенсивность аромата, 
        с ним должно быть комфортно.
      </p>

      <p class="font-medium text-foreground">
        AROMA BOUTIQUE IDYLLE выбирает для Вас лучшие марки Франции, Италии, Португалии. Мы работаем только 
        с достойными производителями. Качество продукции обеспечивается международными стандартами. 
        Со своей стороны мы дарим лучший сервис.
      </p>
    `.trim();

    // Обновляем категорию с slug 'aromaty-dlya-doma' или создаем её, если не существует
    const category = await prisma.category.upsert({
      where: { slug: 'aromaty-dlya-doma' },
      update: {
        pageContent: content,
      },
      create: {
        name: 'Ароматы для дома',
        slug: 'aromaty-dlya-doma',
        description: 'Ароматы и товары для создания уютной атмосферы в доме',
        pageContent: content,
        isActive: true,
      },
    });

    console.log('✅ Контент успешно добавлен для категории:', category.name);
    console.log('   Slug:', category.slug);
    console.log('   ID:', category.id);
  } catch (error) {
    console.error('❌ Ошибка при добавлении контента:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addCategoryContent();

