import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAdminPage() {
  try {
    console.log('🧪 Тестируем страницу управления администраторами...\n');

    // 1. Проверяем API напрямую
    console.log('1️⃣ Тестируем API...');
    const response = await fetch('http://localhost:3000/api/admin/admins');
    const result = await response.json();
    
    console.log('Статус:', response.status);
    console.log('Успех:', result.success);
    console.log('Количество администраторов:', result.admins?.length || 0);
    
    if (result.admins && result.admins.length > 0) {
      console.log('\n📊 Администраторы:');
      result.admins.forEach((admin: any, index: number) => {
        console.log(`${index + 1}. ${admin.name} (${admin.email})`);
        console.log(`   Статус: ${admin.isActive ? 'Активен' : 'Неактивен'}`);
        console.log(`   Разделы: ${admin.allowedAdminSections?.join(', ') || 'Не указано'}`);
      });
    }

    // 2. Проверяем страницу
    console.log('\n2️⃣ Тестируем страницу...');
    const pageResponse = await fetch('http://localhost:3000/admin/admins');
    const pageHtml = await pageResponse.text();
    
    console.log('Статус страницы:', pageResponse.status);
    console.log('Содержит "Управление администраторами":', pageHtml.includes('Управление администраторами'));
    console.log('Содержит "Загрузка администраторов":', pageHtml.includes('Загрузка администраторов'));
    console.log('Содержит "Администраторы не найдены":', pageHtml.includes('Администраторы не найдены'));

    // 3. Проверяем базу данных напрямую
    console.log('\n3️⃣ Проверяем базу данных...');
    const admins = await prisma.user.findMany({
      where: { role: 'admin' },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        allowedAdminSections: true,
      },
    });

    console.log('Администраторов в БД:', admins.length);
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.name} (${admin.email}) - ${admin.isActive ? 'Активен' : 'Неактивен'}`);
    });

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminPage();

