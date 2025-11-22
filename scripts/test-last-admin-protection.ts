import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testLastAdminProtection() {
  try {
    console.log('🔒 Тестируем защиту от удаления последнего администратора...\n');

    // 1. Получаем всех администраторов
    const allAdmins = await prisma.user.findMany({
      where: { role: 'admin' },
    });

    console.log(`📊 Найдено администраторов: ${allAdmins.length}`);
    allAdmins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.name} (${admin.email})`);
    });

    // 2. Если у нас больше 2 администраторов, удаляем одного
    if (allAdmins.length > 2) {
      const adminToDelete = allAdmins[0];
      console.log(`\n🗑️ Удаляем администратора: ${adminToDelete.name}`);
      
      const response = await fetch(`http://localhost:3000/api/admin/admins/${adminToDelete.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      console.log('Результат удаления:', result);
    }

    // 3. Получаем оставшихся администраторов
    const remainingAdmins = await prisma.user.findMany({
      where: { role: 'admin' },
    });

    console.log(`\n📊 Оставшихся администраторов: ${remainingAdmins.length}`);

    // 4. Тестируем удаление последнего администратора
    if (remainingAdmins.length === 1) {
      const lastAdmin = remainingAdmins[0];
      console.log(`\n🔒 Пытаемся удалить последнего администратора: ${lastAdmin.name}`);
      
      const deleteResponse = await fetch(`http://localhost:3000/api/admin/admins/${lastAdmin.id}`, {
        method: 'DELETE',
      });

      const deleteResult = await deleteResponse.json();
      console.log('Статус ответа:', deleteResponse.status);
      console.log('Результат:', deleteResult);

      if (!deleteResult.success && deleteResult.error.includes('последнего администратора')) {
        console.log('✅ Защита от удаления последнего администратора работает!');
      } else {
        console.error('❌ Защита от удаления последнего администратора не работает');
      }
    } else {
      console.log('⚠️ У нас больше одного администратора, защита не тестируется');
    }

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLastAdminProtection();

