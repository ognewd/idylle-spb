#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

// Загружаем переменные окружения для продакшена
// Проверяем разные возможные файлы
config({ path: '.env.production' });
config({ path: '.env' });
config({ path: '.env.local' });

const PROD_URL = process.env.NEXTAUTH_URL || 'https://idylle.spb.ru';
const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

async function checkProduction() {
  console.log('🔍 Проверка продакшена на VPS...\n');
  
  // 1. Проверка переменных окружения
  console.log('1️⃣ Проверка переменных окружения...');
  const dbUrl = process.env.DATABASE_URL;
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  const nextAuthSecret = process.env.NEXTAUTH_SECRET;
  
  if (!dbUrl) {
    console.error('❌ DATABASE_URL не установлен!');
    console.log('💡 Создайте файл .env.production или .env с переменными окружения');
    return;
  }
  
  const maskedDbUrl = dbUrl.replace(/:[^:@]+@/, ':****@');
  console.log(`✅ DATABASE_URL: ${maskedDbUrl.substring(0, 60)}...`);
  console.log(`✅ NEXTAUTH_URL: ${nextAuthUrl || 'не установлен'}`);
  console.log(`✅ NEXTAUTH_SECRET: ${nextAuthSecret ? 'установлен' : '❌ не установлен'}`);
  
  // 2. Проверка подключения к базе данных
  console.log('\n2️⃣ Проверка подключения к базе данных...');
  try {
    await prisma.$connect();
    console.log('✅ Подключение к базе данных успешно');
    
    // Проверка данных
    const userCount = await prisma.user.count();
    const productCount = await prisma.product.count();
    const brandCount = await prisma.brand.count();
    const categoryCount = await prisma.category.count();
    
    console.log(`📊 Пользователей: ${userCount}`);
    console.log(`📦 Товаров: ${productCount}`);
    console.log(`🏷️ Брендов: ${brandCount}`);
    console.log(`📂 Категорий: ${categoryCount}`);
    
    // Проверка администраторов
    const admins = await prisma.user.findMany({
      where: {
        role: { in: ['admin', 'super_admin'] },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });
    
    console.log(`\n👥 Администраторов: ${admins.length}`);
    if (admins.length === 0) {
      console.warn('⚠️ Администраторы не найдены!');
    } else {
      admins.forEach((admin, i) => {
        console.log(`   ${i + 1}. ${admin.name} (${admin.email}) - ${admin.role} - ${admin.isActive ? 'активен' : 'неактивен'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Ошибка подключения к базе данных:');
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
      if (error.message.includes('P1001')) {
        console.error('\n💡 База данных недоступна. Проверьте:');
        console.error('   - Запущен ли PostgreSQL на VPS');
        console.error('   - Правильный ли DATABASE_URL');
        console.error('   - Открыт ли порт 5432 в файрволе');
      }
      if (error.message.includes('authentication')) {
        console.error('\n💡 Ошибка аутентификации. Проверьте:');
        console.error('   - Правильный ли пароль в DATABASE_URL');
        console.error('   - Существует ли пользователь БД');
      }
    }
    await prisma.$disconnect();
    return;
  }
  
  // 3. Проверка доступности сайта
  console.log('\n3️⃣ Проверка доступности сайта...');
  try {
    const response = await fetch(`${PROD_URL}/api/products/basic`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Сайт доступен: ${PROD_URL}`);
      console.log(`✅ API работает: получено ${data.products?.length || 0} товаров`);
    } else {
      console.error(`❌ Сайт недоступен: статус ${response.status}`);
      console.error(`   URL: ${PROD_URL}/api/products/basic`);
    }
  } catch (error) {
    console.error('❌ Ошибка при проверке сайта:');
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
      console.error('\n💡 Возможные причины:');
      console.error('   - Сайт не запущен на VPS');
      console.error('   - Неправильный NEXTAUTH_URL');
      console.error('   - Проблемы с сетью/файрволом');
      console.error('   - Nginx не настроен или не запущен');
    }
  }
  
  // 4. Проверка структуры базы данных
  console.log('\n4️⃣ Проверка структуры базы данных...');
  try {
    // Проверка колонки allowedAdminSections
    const testUser = await prisma.user.findFirst({
      select: {
        allowedAdminSections: true,
      },
    });
    console.log('✅ Структура таблицы users корректна');
    
    // Проверка других важных таблиц
    const tables = {
      products: await prisma.product.count(),
      categories: await prisma.category.count(),
      brands: await prisma.brand.count(),
      orders: await prisma.order.count(),
    };
    
    console.log('✅ Все таблицы доступны:');
    Object.entries(tables).forEach(([table, count]) => {
      console.log(`   - ${table}: ${count} записей`);
    });
    
  } catch (error) {
    console.error('❌ Ошибка при проверке структуры БД:');
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
      if (error.message.includes('allowedAdminSections')) {
        console.error('\n💡 Нужно применить миграции:');
        console.error('   npx prisma db push');
      }
    }
  }
  
  await prisma.$disconnect();
  
  console.log('\n✅ Проверка завершена!');
}

checkProduction().catch((error) => {
  console.error('❌ Критическая ошибка:', error);
  process.exit(1);
});

