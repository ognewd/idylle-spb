import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔐 Создаем админского пользователя...');

    const email = 'admin@idylle.spb.ru';
    const password = 'admin123';
    const name = 'Администратор';

    // Проверяем, существует ли уже админ
    const existingAdmin = await prisma.user.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      console.log(`✅ Админ уже существует: ${email}`);
      console.log(`🔑 Email: ${email}`);
      console.log(`🔑 Пароль: ${password}`);
      return;
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем админа
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'admin',
        isActive: true,
      },
    });

    console.log('✅ Админский пользователь создан!');
    console.log(`🔑 Email: ${email}`);
    console.log(`🔑 Пароль: ${password}`);
    console.log(`👤 ID: ${admin.id}`);

  } catch (error) {
    console.error('❌ Ошибка при создании админа:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();


