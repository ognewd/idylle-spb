import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function restoreMainAdmin() {
  try {
    console.log('🔧 Восстанавливаем основного администратора...\n');

    // 1. Проверяем, есть ли уже основной администратор
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@idylle.spb.ru' },
    });

    if (existingAdmin) {
      console.log('✅ Основной администратор уже существует');
      console.log(`   Имя: ${existingAdmin.name}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Статус: ${existingAdmin.isActive ? 'Активен' : 'Неактивен'}`);
    } else {
      // 2. Создаем основного администратора
      const mainAdmin = await prisma.user.create({
        data: {
          name: 'Администратор',
          email: 'admin@idylle.spb.ru',
          password: await bcrypt.hash('admin123', 10),
          role: 'admin',
          isActive: true,
          allowedAdminSections: ['products', 'categories', 'seasonal-discounts', 'filters', 'users', 'orders', 'administrators'],
        },
      });

      console.log('✅ Основной администратор создан:');
      console.log(`   Имя: ${mainAdmin.name}`);
      console.log(`   Email: ${mainAdmin.email}`);
      console.log(`   Разделы: ${mainAdmin.allowedAdminSections?.join(', ') || 'Нет'}`);
    }

    // 3. Проверяем общее количество администраторов
    const adminCount = await prisma.user.count({
      where: { role: 'admin' },
    });

    console.log(`\n📊 Общее количество администраторов: ${adminCount}`);

  } catch (error) {
    console.error('❌ Ошибка при восстановлении:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreMainAdmin();

