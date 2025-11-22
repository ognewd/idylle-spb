import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

// Load production environment variables
config({ path: '.env.production' });

const prisma = new PrismaClient();

const ALL_SECTIONS = [
  'products',
  'categories',
  'seasonal-discounts',
  'filters',
  'users',
  'orders',
  'administrators',
];

async function updateAdminPermissions() {
  console.log('🔧 Обновляем права администраторов...');

  try {
    // Find all admin users
    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: ['admin', 'super_admin'],
        },
      },
    });

    console.log(`📊 Найдено администраторов: ${admins.length}`);

    // Update each admin with full permissions
    for (const admin of admins) {
      await prisma.user.update({
        where: { id: admin.id },
        data: {
          allowedAdminSections: ALL_SECTIONS,
        },
      });
      console.log(`✅ Обновлен: ${admin.name} (${admin.email})`);
    }

    console.log('\n🎉 Все администраторы получили полный доступ ко всем разделам!');
  } catch (error) {
    console.error('❌ Ошибка при обновлении прав администраторов:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminPermissions();
