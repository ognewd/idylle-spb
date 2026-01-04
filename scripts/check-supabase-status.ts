import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Загружаем connection string из файла
const supabaseConnectionString = fs.readFileSync(
  path.join(process.cwd(), '.supabase_connection_string.txt'),
  'utf-8'
).trim();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: supabaseConnectionString,
    },
  },
});

async function checkSupabaseStatus() {
  try {
    console.log('🔍 Проверяю состояние Supabase БД...\n');

    // Подключаемся
    await prisma.$connect();
    console.log('✅ Подключение к Supabase успешно!\n');

    // Количество товаров
    const productsCount = await prisma.product.count();
    console.log(`📦 Товаров: ${productsCount}`);

    // Количество категорий
    const categoriesCount = await prisma.category.count();
    console.log(`📂 Категорий: ${categoriesCount}`);

    // Количество брендов
    const brandsCount = await prisma.brand.count();
    console.log(`🏷️  Брендов: ${brandsCount}`);

    // Количество пользователей
    const usersCount = await prisma.user.count();
    console.log(`👥 Пользователей: ${usersCount}`);

    // Администраторы
    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: ['admin', 'super_admin'],
        },
      },
      select: {
        email: true,
        role: true,
        name: true,
      },
    });
    console.log(`\n🔐 Администраторы (${admins.length}):`);
    admins.forEach(admin => {
      console.log(`   - ${admin.email} (${admin.role})${admin.name ? ` - ${admin.name}` : ''}`);
    });

    // Категории
    const categories = await prisma.category.findMany({
      select: {
        name: true,
        slug: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    console.log(`\n📂 Категории (${categories.length}):`);
    categories.forEach(cat => {
      console.log(`   - ${cat.name} (${cat.slug})`);
    });

    // Бренды (первые 10)
    const brands = await prisma.brand.findMany({
      select: {
        name: true,
        slug: true,
      },
      take: 10,
      orderBy: {
        name: 'asc',
      },
    });
    console.log(`\n🏷️  Бренды (показано ${brands.length} из ${brandsCount}):`);
    brands.forEach(brand => {
      console.log(`   - ${brand.name} (${brand.slug})`);
    });

    // Проверка схемы
    console.log(`\n📊 Структура БД:`);
    console.log(`   - Товаров: ${productsCount}`);
    console.log(`   - Категорий: ${categoriesCount}`);
    console.log(`   - Брендов: ${brandsCount}`);
    console.log(`   - Пользователей: ${usersCount}`);
    console.log(`   - Администраторов: ${admins.length}`);

    if (productsCount === 0) {
      console.log(`\n⚠️  ВНИМАНИЕ: В БД нет товаров!`);
      console.log(`   Нужно применить схему: npx prisma db push`);
    }

  } catch (error) {
    console.error('❌ Ошибка при проверке Supabase:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSupabaseStatus();

