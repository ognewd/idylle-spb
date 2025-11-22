import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedDevDatabase() {
  try {
    console.log('🌱 Заполняем локальную базу данных тестовыми данными...');

    // Создаем админа
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@idylle.spb.ru' },
      update: {},
      create: {
        email: 'admin@idylle.spb.ru',
        password: hashedPassword,
        name: 'Администратор',
        role: 'admin',
        isActive: true,
      },
    });
    console.log('✅ Админ создан:', admin.email);

    // Создаем бренды
    const brands = await Promise.all([
      prisma.brand.upsert({
        where: { slug: 'dr-vranjes-firenze' },
        update: {},
        create: {
          name: 'Dr. Vranjes Firenze',
          slug: 'dr-vranjes-firenze',
          description: 'Итальянский бренд элитных ароматов для дома',
          logo: '/images/brands/dr-vranjes-firenze.png',
          website: 'https://drvranjes.com',
          isActive: true,
        },
      }),
      prisma.brand.upsert({
        where: { slug: 'diptyque' },
        update: {},
        create: {
          name: 'Diptyque',
          slug: 'diptyque',
          description: 'Французский бренд ароматических свечей',
          logo: '/images/brands/diptyque.png',
          website: 'https://diptyque.com',
          isActive: true,
        },
      }),
    ]);
    console.log('✅ Бренды созданы:', brands.length);

    // Создаем категории
    const categories = await Promise.all([
      prisma.category.upsert({
        where: { slug: 'candles' },
        update: {},
        create: {
          name: 'Свечи',
          slug: 'candles',
          description: 'Ароматические свечи',
        },
      }),
      prisma.category.upsert({
        where: { slug: 'diffusers' },
        update: {},
        create: {
          name: 'Диффузоры',
          slug: 'diffusers',
          description: 'Ароматические диффузоры',
        },
      }),
      prisma.category.upsert({
        where: { slug: 'home' },
        update: {},
        create: {
          name: 'Ароматы для дома',
          slug: 'home',
          description: 'Различные ароматы для дома',
        },
      }),
    ]);
    console.log('✅ Категории созданы:', categories.length);

    // Создаем тестовые товары
    const products = [
      {
        name: 'Ароматическая свеча "Лаванда"',
        slug: 'aromaticheskaya-svecha-lavanda-dev',
        price: 2500,
        sku: 'CANDLE-LAV-DEV',
        categorySlug: 'candles',
      },
      {
        name: 'Диффузор "Цитрус"',
        slug: 'diffuzor-tsitrus-dev',
        price: 3200,
        sku: 'DIFF-CIT-DEV',
        categorySlug: 'diffusers',
      },
      {
        name: 'Домашний ароматизатор "Жасмин"',
        slug: 'domashniy-aromatizator-zhasmin-dev',
        price: 2200,
        sku: 'HOME-JAS-DEV',
        categorySlug: 'home',
      },
    ];

    for (const productData of products) {
      const category = categories.find(cat => cat.slug === productData.categorySlug);
      if (!category) continue;

      const product = await prisma.product.upsert({
        where: { slug: productData.slug },
        update: {},
        create: {
          name: productData.name,
          slug: productData.slug,
          description: `Описание для ${productData.name} (DEV версия)`,
          price: productData.price,
          sku: productData.sku,
          stock: Math.floor(Math.random() * 50) + 10,
          isActive: true,
          isFeatured: Math.random() > 0.5,
          brandId: brands[0].id,
          productCategories: {
            create: [{ categoryId: category.id, isPrimary: true }],
          },
          images: {
            create: [{ url: '/placeholder-product.jpg', alt: productData.name, isPrimary: true }],
          },
        },
      });
      console.log(`✅ Товар создан: ${product.name}`);
    }

    console.log('\n🎉 Локальная база данных заполнена!');
    console.log('📊 Данные для входа в админку:');
    console.log('   Email: admin@idylle.spb.ru');
    console.log('   Пароль: admin123');

  } catch (error) {
    console.error('❌ Ошибка при заполнении базы данных:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDevDatabase();

