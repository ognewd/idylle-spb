import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function fixAdmin() {
  try {
    console.log('🔐 Исправляем админского пользователя...');

    const email = 'admin@idylle.spb.ru';
    const password = 'admin123';
    const name = 'Администратор';

    // Удаляем существующего админа, если есть
    await prisma.user.deleteMany({
      where: { email },
    });

    console.log('🗑️  Удален существующий админ');

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем нового админа с полными правами
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'super_admin', // Даем роль super_admin для полного доступа
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

    console.log('✅ Новый админский пользователь создан!');
    console.log(`🔑 Email: ${email}`);
    console.log(`🔑 Пароль: ${password}`);
    console.log(`👤 ID: ${admin.id}`);
    console.log(`🔐 Роль: ${admin.role} (полный доступ ко всем разделам)`);

    // Проверяем, что пароль работает
    const testPassword = await bcrypt.compare(password, hashedPassword);
    console.log(`🔍 Тест пароля: ${testPassword ? '✅ Работает' : '❌ Не работает'}`);

  } catch (error) {
    console.error('❌ Ошибка при исправлении админа:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdmin();


