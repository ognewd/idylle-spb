import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

// Load production environment variables
config({ path: '.env.production' });

const prisma = new PrismaClient();

async function checkSupabaseDb() {
  console.log('🔍 Проверяем базу данных Supabase (продакшен)...');
  console.log('📍 DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');

  try {
    // Check connection
    await prisma.$connect();
    console.log('✅ Подключение к Supabase успешно');

    // Check users table structure
    console.log('\n1️⃣ Проверяем структуру таблицы users...');
    
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
      if (users.length > 0) {
        console.log('📊 Пример пользователя:', users[0]);
      }
    } catch (error: any) {
      if (error.message.includes('allowedAdminSections')) {
        console.log('❌ Колонка allowedAdminSections НЕ существует');
        console.log('🔧 Нужно применить миграцию к Supabase');
        return;
      } else {
        throw error;
      }
    }

    // Check total users
    console.log('\n2️⃣ Проверяем общую информацию...');
    const userCount = await prisma.user.count();
    console.log(`📊 Всего пользователей в базе: ${userCount}`);

    // Check admin users
    console.log('\n3️⃣ Проверяем администраторов...');
    const adminUsers = await prisma.user.findMany({
      where: { role: 'admin' },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        allowedAdminSections: true,
        createdAt: true,
      },
    });
    console.log(`👥 Найдено администраторов: ${adminUsers.length}`);
    
    if (adminUsers.length === 0) {
      console.log('⚠️ Администраторы не найдены! Нужно создать администратора.');
    } else {
      adminUsers.forEach((admin, index) => {
        console.log(`   ${index + 1}. ${admin.name} (${admin.email})`);
        console.log(`      - Активен: ${admin.isActive ? 'Да' : 'Нет'}`);
        console.log(`      - Разделы: ${admin.allowedAdminSections?.join(', ') || 'Не указаны'}`);
        console.log(`      - Создан: ${admin.createdAt.toLocaleDateString('ru-RU')}`);
      });
    }

    // Check products
    console.log('\n4️⃣ Проверяем товары...');
    const productCount = await prisma.product.count();
    console.log(`📦 Всего товаров: ${productCount}`);

    // Check categories
    console.log('\n5️⃣ Проверяем категории...');
    const categoryCount = await prisma.category.count();
    console.log(`📂 Всего категорий: ${categoryCount}`);

  } catch (error) {
    console.error('❌ Ошибка при проверке базы данных Supabase:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSupabaseDb();

