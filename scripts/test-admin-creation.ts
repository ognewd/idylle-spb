import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testAdminCreation() {
  try {
    console.log('🧪 Тестируем создание администратора с новыми разделами...\n');

    // 1. Создаем тестового администратора
    const testAdmin = await prisma.user.create({
      data: {
        name: 'Тестовый Админ',
        email: 'test-admin@idylle.spb.ru',
        password: await bcrypt.hash('test123', 10),
        role: 'admin',
        isActive: true,
        allowedAdminSections: ['products', 'categories', 'orders'], // Только некоторые разделы
      },
    });

    console.log('✅ Тестовый администратор создан:');
    console.log(`   Имя: ${testAdmin.name}`);
    console.log(`   Email: ${testAdmin.email}`);
    console.log(`   Разделы: ${testAdmin.allowedAdminSections?.join(', ') || 'Нет'}`);

    // 2. Создаем администратора с полным доступом
    const fullAccessAdmin = await prisma.user.create({
      data: {
        name: 'Полный Доступ',
        email: 'full-access@idylle.spb.ru',
        password: await bcrypt.hash('full123', 10),
        role: 'admin',
        isActive: true,
        allowedAdminSections: ['products', 'categories', 'seasonal-discounts', 'filters', 'users', 'orders', 'administrators'], // Все разделы
      },
    });

    console.log('\n✅ Администратор с полным доступом создан:');
    console.log(`   Имя: ${fullAccessAdmin.name}`);
    console.log(`   Email: ${fullAccessAdmin.email}`);
    console.log(`   Разделы: ${fullAccessAdmin.allowedAdminSections?.join(', ') || 'Нет'}`);

    // 3. Проверяем API
    console.log('\n🔍 Проверяем API...');
    const response = await fetch('http://localhost:3000/api/admin/admins');
    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ API работает - найдено ${result.admins.length} администраторов`);
      result.admins.forEach((admin: any, index: number) => {
        console.log(`${index + 1}. ${admin.name} (${admin.email})`);
        console.log(`   Разделы: ${admin.allowedAdminSections?.join(', ') || 'Нет'}`);
      });
    } else {
      console.error('❌ API не работает:', result.error);
    }

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminCreation();

