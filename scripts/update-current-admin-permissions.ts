import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function updateCurrentAdmin() {
  try {
    console.log('🔧 Обновляем права текущего админа...\n');

    const email = 'admin@idylle.spb.ru';

    // Находим текущего админа
    const existingAdmin = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingAdmin) {
      console.log('❌ Админ не найден. Запустите fix-admin.ts для создания.');
      return;
    }

    console.log('📋 Текущий статус:');
    console.log(`   Роль: ${existingAdmin.role}`);
    console.log(`   Разделы: ${existingAdmin.allowedAdminSections?.join(', ') || 'нет'}`);

    // Обновляем на super_admin с полными правами
    const updatedAdmin = await prisma.user.update({
      where: { email },
      data: {
        role: 'super_admin',
        isActive: true,
        allowedAdminSections: [
          'products',
          'categories',
          'seasonal-discounts',
          'filters',
          'users',
          'orders',
          'administrators',
        ],
      },
    });

    console.log('\n✅ Админ обновлен!');
    console.log(`   Роль: ${updatedAdmin.role}`);
    console.log(`   Разделы: ${updatedAdmin.allowedAdminSections?.join(', ') || 'все'}`);
    console.log(`   Статус: ${updatedAdmin.isActive ? 'Активен' : 'Неактивен'}`);

  } catch (error) {
    console.error('❌ Ошибка при обновлении админа:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateCurrentAdmin();

