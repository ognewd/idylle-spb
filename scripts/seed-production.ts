import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Версия seed для продакшена - использует DATABASE_URL из переменных окружения
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Начинаем заполнение базы данных на продакшене...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? `${process.env.DATABASE_URL.split('@')[0]}@***` : 'не установлен');

    // Создаем/обновляем админа (если он уже есть, обновим права)
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@idylle.spb.ru' },
    update: {
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
    create: {
      email: 'admin@idylle.spb.ru',
      name: 'Администратор',
      password: hashedPassword,
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
      termsAcceptedAt: new Date(),
      privacyAcceptedAt: new Date(),
    },
  });

  console.log('✅ Админ пользователь создан/обновлен:', admin.email);

  // Создаем категории
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'perfume' },
      update: {},
      create: {
        name: 'Парфюмы',
        slug: 'perfume',
        description: 'Эксклюзивные парфюмы от ведущих мировых брендов',
        isActive: true,
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'home' },
      update: {},
      create: {
        name: 'Товары для дома',
        slug: 'home',
        description: 'Ароматические свечи и диффузоры для дома',
        isActive: true,
        sortOrder: 2,
      },
    }),
  ]);

  console.log('✅ Категории созданы:', categories.length);

  // Создаем бренды
  const brands = await Promise.all([
    prisma.brand.upsert({
      where: { slug: 'diptyque' },
      update: {},
      create: {
        name: 'Diptyque',
        slug: 'diptyque',
        description: 'Французский бренд ароматических свечей и парфюмерии',
        logo: '/images/brands/diptyque.png',
        website: 'https://diptyque.com',
        isActive: true,
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'tom-ford' },
      update: {},
      create: {
        name: 'Tom Ford',
        slug: 'tom-ford',
        description: 'Роскошная парфюмерия и косметика',
        logo: '/images/brands/tom-ford.png',
        website: 'https://www.tomford.com',
        isActive: true,
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'creed' },
      update: {},
      create: {
        name: 'Creed',
        slug: 'creed',
        description: 'Элитная парфюмерия из Франции',
        logo: '/images/brands/creed.png',
        website: 'https://www.creedboutique.com',
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Бренды созданы:', brands.length);

  // Создаем несколько тестовых товаров
  const products = await Promise.all([
    prisma.product.upsert({
      where: { slug: 'diptyque-baies-candle' },
      update: {},
      create: {
        name: 'Свеча Diptyque Baies',
        slug: 'diptyque-baies-candle',
        description: 'Ароматическая свеча с ароматом ягод от Diptyque',
        price: 3500,
        sku: 'DIPTYQUE-BAIES-190',
        stock: 25,
        volume: '190g',
        isActive: true,
        isFeatured: true,
        brandId: brands[0].id,
        productCategories: {
          create: [{ categoryId: categories[1].id, isPrimary: true }],
        },
        images: {
          create: [
            {
              url: '/images/products/diptyque-baies.jpg',
              alt: 'Свеча Diptyque Baies',
              isPrimary: true,
            },
          ],
        },
      },
    }),
    prisma.product.upsert({
      where: { slug: 'tom-ford-black-orchid' },
      update: {},
      create: {
        name: 'Tom Ford Black Orchid',
        slug: 'tom-ford-black-orchid',
        description: 'Роскошный парфюм с ароматом черной орхидеи',
        price: 8500,
        sku: 'TF-BLACK-ORCHID-50',
        stock: 15,
        volume: '50ml',
        gender: 'unisex',
        isActive: true,
        isFeatured: true,
        brandId: brands[1].id,
        productCategories: {
          create: [{ categoryId: categories[0].id, isPrimary: true }],
        },
        images: {
          create: [
            {
              url: '/images/products/tom-ford-black-orchid.jpg',
              alt: 'Tom Ford Black Orchid',
              isPrimary: true,
            },
          ],
        },
      },
    }),
    prisma.product.upsert({
      where: { slug: 'creed-aventus' },
      update: {},
      create: {
        name: 'Creed Aventus',
        slug: 'creed-aventus',
        description: 'Легендарный мужской парфюм Creed Aventus',
        price: 12000,
        sku: 'CREED-AVENTUS-75',
        stock: 10,
        volume: '75ml',
        gender: 'men',
        isActive: true,
        isFeatured: true,
        brandId: brands[2].id,
        productCategories: {
          create: [{ categoryId: categories[0].id, isPrimary: true }],
        },
        images: {
          create: [
            {
              url: '/images/products/creed-aventus.jpg',
              alt: 'Creed Aventus',
              isPrimary: true,
            },
          ],
        },
      },
    }),
  ]);

  console.log('✅ Товары созданы:', products.length);

  console.log('\n🎉 База данных заполнена тестовыми данными!');
  console.log('📊 Создано:');
  console.log(`   - ${categories.length} категорий`);
  console.log(`   - ${brands.length} брендов`);
  console.log(`   - ${products.length} товаров`);

} catch (error) {
  console.error('❌ Ошибка при заполнении базы данных:', error);
  throw error;
} finally {
  await prisma.$disconnect();
}
}

main();

