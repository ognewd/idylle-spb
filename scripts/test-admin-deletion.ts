import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testAdminDeletion() {
  try {
    console.log('🧪 Тестируем функционал удаления администратора...\n');

    // 1. Создаем тестового администратора для удаления
    const testAdmin = await prisma.user.create({
      data: {
        name: 'Тест Удаление',
        email: 'test-delete@idylle.spb.ru',
        password: await bcrypt.hash('test123', 10),
        role: 'admin',
        isActive: true,
        allowedAdminSections: ['products', 'categories'],
      },
    });

    console.log('✅ Тестовый администратор создан для удаления:');
    console.log(`   ID: ${testAdmin.id}`);
    console.log(`   Имя: ${testAdmin.name}`);
    console.log(`   Email: ${testAdmin.email}`);

    // 2. Проверяем количество администраторов до удаления
    const beforeCount = await prisma.user.count({
      where: { role: 'admin' },
    });
    console.log(`\n📊 Количество администраторов до удаления: ${beforeCount}`);

    // 3. Тестируем API удаления
    console.log('\n🔍 Тестируем API удаления...');
    const response = await fetch(`http://localhost:3000/api/admin/admins/${testAdmin.id}`, {
      method: 'DELETE',
    });

    const result = await response.json();
    console.log('Статус ответа:', response.status);
    console.log('Результат:', result);

    if (result.success) {
      console.log('✅ API удаления работает корректно');
    } else {
      console.error('❌ API удаления не работает:', result.error);
    }

    // 4. Проверяем количество администраторов после удаления
    const afterCount = await prisma.user.count({
      where: { role: 'admin' },
    });
    console.log(`\n📊 Количество администраторов после удаления: ${afterCount}`);

    // 5. Проверяем, что администратор действительно удален
    const deletedAdmin = await prisma.user.findUnique({
      where: { id: testAdmin.id },
    });

    if (!deletedAdmin) {
      console.log('✅ Администратор успешно удален из базы данных');
    } else {
      console.error('❌ Администратор не был удален из базы данных');
    }

    // 6. Тестируем защиту от удаления последнего администратора
    console.log('\n🔒 Тестируем защиту от удаления последнего администратора...');
    
    // Получаем всех администраторов
    const allAdmins = await prisma.user.findMany({
      where: { role: 'admin' },
    });

    if (allAdmins.length > 0) {
      const lastAdmin = allAdmins[0];
      const deleteResponse = await fetch(`http://localhost:3000/api/admin/admins/${lastAdmin.id}`, {
        method: 'DELETE',
      });

      const deleteResult = await deleteResponse.json();
      
      if (!deleteResult.success && deleteResult.error.includes('последнего администратора')) {
        console.log('✅ Защита от удаления последнего администратора работает');
      } else {
        console.error('❌ Защита от удаления последнего администратора не работает');
      }
    }

    console.log('\n🎉 Тестирование завершено!');

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminDeletion();

