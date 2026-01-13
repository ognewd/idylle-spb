import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔍 Проверяем подключение к базе данных...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? `${process.env.DATABASE_URL.split('@')[0]}@***` : 'не установлен');
    
    // Пробуем выполнить простой запрос
    await prisma.$connect();
    console.log('✅ Подключение к базе данных установлено');
    
    // Проверяем, есть ли таблица users
    const userCount = await prisma.user.count();
    console.log(`✅ Таблица users доступна, записей: ${userCount}`);
    
    // Проверяем администраторов
    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: ['admin', 'super_admin'],
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });
    
    console.log(`\n📋 Найдено администраторов: ${admins.length}`);
    if (admins.length > 0) {
      admins.forEach(admin => {
        console.log(`   - ${admin.email} (${admin.name}) [${admin.role}] ${admin.isActive ? '✅ активен' : '❌ неактивен'}`);
      });
    } else {
      console.log('   ⚠️  Администраторы не найдены!');
    }
    
  } catch (error) {
    console.error('❌ Ошибка подключения к базе данных:', error);
    if (error instanceof Error) {
      console.error('   Сообщение:', error.message);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

