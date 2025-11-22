import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAdminAPI() {
  try {
    console.log('🧪 Тестируем API администраторов...\n');

    // Тестируем запрос к базе данных напрямую
    const admins = await prisma.user.findMany({
      where: {
        role: 'admin',
      },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        allowedAdminSections: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('✅ Запрос к базе данных успешен');
    console.log(`📊 Найдено администраторов: ${admins.length}\n`);

    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.name} (${admin.email})`);
      console.log(`   ID: ${admin.id}`);
      console.log(`   Активен: ${admin.isActive}`);
      console.log(`   Разделы: ${admin.allowedAdminSections?.join(', ') || 'Не указано'}`);
      console.log(`   Создан: ${new Date(admin.createdAt).toLocaleString('ru-RU')}`);
      console.log('');
    });

    // Тестируем API через fetch
    console.log('🌐 Тестируем API через fetch...');
    const response = await fetch('http://localhost:3000/api/admin/admins');
    const result = await response.json();
    
    console.log('Статус ответа:', response.status);
    console.log('Результат:', JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminAPI();
