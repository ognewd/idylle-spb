import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteOneAdmin() {
  try {
    console.log('🗑️ Удаляем одного администратора для тестирования защиты...\n');

    // 1. Получаем всех администраторов
    const allAdmins = await prisma.user.findMany({
      where: { role: 'admin' },
    });

    console.log(`📊 Найдено администраторов: ${allAdmins.length}`);
    allAdmins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.name} (${admin.email})`);
    });

    // 2. Удаляем первого администратора (не основной admin@idylle.spb.ru)
    const adminToDelete = allAdmins.find(admin => admin.email !== 'admin@idylle.spb.ru');
    
    if (adminToDelete) {
      console.log(`\n🗑️ Удаляем администратора: ${adminToDelete.name} (${adminToDelete.email})`);
      
      const response = await fetch(`http://localhost:3000/api/admin/admins/${adminToDelete.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      console.log('Результат удаления:', result);

      if (result.success) {
        console.log('✅ Администратор успешно удален');
      } else {
        console.error('❌ Ошибка при удалении:', result.error);
      }
    } else {
      console.log('⚠️ Не найден администратор для удаления');
    }

    // 3. Проверяем оставшихся администраторов
    const remainingAdmins = await prisma.user.findMany({
      where: { role: 'admin' },
    });

    console.log(`\n📊 Оставшихся администраторов: ${remainingAdmins.length}`);
    remainingAdmins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.name} (${admin.email})`);
    });

  } catch (error) {
    console.error('❌ Ошибка при удалении:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteOneAdmin();

