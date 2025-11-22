import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Проверяем пользователей в базе данных...\n');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    console.log(`📊 Всего пользователей: ${users.length}\n`);

    if (users.length === 0) {
      console.log('❌ Пользователи не найдены');
      return;
    }

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   Роль: ${user.role}`);
      console.log(`   Активен: ${user.isActive ? '✅' : '❌'}`);
      console.log(`   Создан: ${new Date(user.createdAt).toLocaleString('ru-RU')}`);
      console.log('');
    });

    const adminUsers = users.filter(user => user.role === 'admin');
    console.log(`👑 Администраторов: ${adminUsers.length}`);

  } catch (error) {
    console.error('❌ Ошибка при проверке пользователей:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();

