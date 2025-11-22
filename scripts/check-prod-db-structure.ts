import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

// Load environment variables for production database
config({ path: '.env' });

const prisma = new PrismaClient();

async function checkProdDbStructure() {
  console.log('🔍 Проверяем структуру базы данных на продакшене...');

  try {
    // Check if allowedAdminSections column exists
    console.log('\n1️⃣ Проверяем структуру таблицы users...');
    
    // Try to query the allowedAdminSections field
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          allowedAdminSections: true,
        },
        take: 1,
      });
      console.log('✅ Колонка allowedAdminSections существует');
      console.log('📊 Пример пользователя:', users[0]);
    } catch (error: any) {
      if (error.message.includes('allowedAdminSections')) {
        console.log('❌ Колонка allowedAdminSections НЕ существует');
        console.log('🔧 Нужно применить миграцию');
      } else {
        throw error;
      }
    }

    // Check users table structure
    console.log('\n2️⃣ Проверяем общую структуру таблицы users...');
    const userCount = await prisma.user.count();
    console.log(`📊 Всего пользователей в базе: ${userCount}`);

    if (userCount > 0) {
      const firstUser = await prisma.user.findFirst({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      });
      console.log('👤 Первый пользователь:', firstUser);
    }

    // Check admin users
    console.log('\n3️⃣ Проверяем администраторов...');
    const adminUsers = await prisma.user.findMany({
      where: { role: 'admin' },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
      },
    });
    console.log(`👥 Найдено администраторов: ${adminUsers.length}`);
    adminUsers.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.name} (${admin.email}) - ${admin.isActive ? 'Активен' : 'Неактивен'}`);
    });

  } catch (error) {
    console.error('❌ Ошибка при проверке структуры базы данных:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProdDbStructure();

