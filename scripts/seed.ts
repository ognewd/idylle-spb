import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Load environment variables
config({ path: '.env.local' });

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Начинаем заполнение базы данных...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@idylle.spb.ru' },
    update: {},
    create: {
      email: 'admin@idylle.spb.ru',
      name: 'Администратор',
      password: hashedPassword,
      role: 'super_admin',
      isActive: true,
      termsAcceptedAt: new Date(),
      privacyAcceptedAt: new Date(),
    },
  });

  console.log('✅ Админ пользователь создан:', admin.email);

  // Create categories
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

  // Create brands
  const brands = await Promise.all([
    prisma.brand.upsert({
      where: { slug: 'diptyque' },
      update: {},
      create: {
        name: 'Diptyque',
        slug: 'diptyque',
        description: 'Французский бренд ароматических свечей и парфюмов',
        isActive: true,
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'tom-ford' },
      update: {},
      create: {
        name: 'Tom Ford',
        slug: 'tom-ford',
        description: 'Роскошные парфюмы от американского дизайнера',
        isActive: true,
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'creed' },
      update: {},
      create: {
        name: 'Creed',
        slug: 'creed',
        description: 'Эксклюзивные парфюмы с 1760 года',
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Бренды созданы:', brands.length);

  // Create products
  const products = await Promise.all([
    prisma.product.upsert({
      where: { slug: 'diptyque-philosykos' },
      update: {},
      create: {
        name: 'Diptyque Philosykos Eau de Toilette',
        slug: 'diptyque-philosykos',
        description: 'A green, woody fragrance capturing the scent of fig trees in the sun. This eau de toilette is a perfect blend of fig leaves, fig fruit, and woody notes.',
        shortDescription: 'Green, woody fragrance with fig notes',
        price: 14200,
        comparePrice: 16000,
        sku: 'DIP-PHIL-100',
        volume: '100 ml',
        gender: 'unisex',
        aromaFamily: 'Woody',
        ingredients: 'Alcohol, Aqua, Parfum, Fig Leaf, Fig Fruit, Cedar, Sandalwood',
        stock: 5,
        isActive: true,
        isFeatured: true,
        brandId: brands[0].id,
        productCategories: {
          create: [
            {
              categoryId: categories[0].id,
            },
          ],
        },
        images: {
          create: [
            {
              url: '/placeholder-product.jpg',
              alt: 'Diptyque Philosykos',
              sortOrder: 0,
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
        description: 'A luxurious oriental fragrance with black orchid, dark chocolate, and patchouli.',
        shortDescription: 'Luxurious oriental fragrance',
        price: 18500,
        sku: 'TF-BO-50',
        volume: '50 ml',
        gender: 'women',
        aromaFamily: 'Oriental',
        ingredients: 'Alcohol, Aqua, Parfum, Black Orchid, Dark Chocolate, Patchouli',
        stock: 3,
        isActive: true,
        isFeatured: false,
        brandId: brands[1].id,
        productCategories: {
          create: [
            {
              categoryId: categories[0].id,
            },
          ],
        },
        images: {
          create: [
            {
              url: '/placeholder-product.jpg',
              alt: 'Tom Ford Black Orchid',
              sortOrder: 0,
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
        description: 'A fruity, woody fragrance inspired by the dramatic life of a historic emperor.',
        shortDescription: 'Fruity, woody fragrance',
        price: 22000,
        sku: 'CREED-AV-100',
        volume: '100 ml',
        gender: 'men',
        aromaFamily: 'Fruity',
        ingredients: 'Alcohol, Aqua, Parfum, Pineapple, Black Currant, Birch',
        stock: 8,
        isActive: true,
        isFeatured: true,
        brandId: brands[2].id,
        productCategories: {
          create: [
            {
              categoryId: categories[0].id,
            },
          ],
        },
        images: {
          create: [
            {
              url: '/placeholder-product.jpg',
              alt: 'Creed Aventus',
              sortOrder: 0,
              isPrimary: true,
            },
          ],
        },
      },
    }),
  ]);

  console.log('✅ Товары созданы:', products.length);

  // Create filter groups
  const filterGroups = await Promise.all([
    prisma.filterGroup.upsert({
      where: { id: 'brand-filter' },
      update: {},
      create: {
        id: 'brand-filter',
        name: 'Бренд',
        type: 'checkbox',
        isActive: true,
        sortOrder: 1,
        options: {
          create: [
            { name: 'Diptyque', value: 'diptyque', sortOrder: 1 },
            { name: 'Tom Ford', value: 'tom-ford', sortOrder: 2 },
            { name: 'Creed', value: 'creed', sortOrder: 3 },
          ],
        },
      },
    }),
    prisma.filterGroup.upsert({
      where: { id: 'family-filter' },
      update: {},
      create: {
        id: 'family-filter',
        name: 'Ароматическая семья',
        type: 'checkbox',
        isActive: true,
        sortOrder: 2,
        options: {
          create: [
            { name: 'Woody', value: 'woody', sortOrder: 1 },
            { name: 'Oriental', value: 'oriental', sortOrder: 2 },
            { name: 'Fruity', value: 'fruity', sortOrder: 3 },
          ],
        },
      },
    }),
    prisma.filterGroup.upsert({
      where: { id: 'gender-filter' },
      update: {},
      create: {
        id: 'gender-filter',
        name: 'Пол',
        type: 'checkbox',
        isActive: true,
        sortOrder: 3,
        options: {
          create: [
            { name: 'Мужской', value: 'men', sortOrder: 1 },
            { name: 'Женский', value: 'women', sortOrder: 2 },
            { name: 'Унисекс', value: 'unisex', sortOrder: 3 },
          ],
        },
      },
    }),
  ]);

  console.log('✅ Фильтры созданы:', filterGroups.length);

  // Create payment methods
  const paymentMethods = await Promise.all([
    prisma.paymentMethod.upsert({
      where: { id: 'card-payment' },
      update: {},
      create: {
        id: 'card-payment',
        name: 'Банковская карта',
        type: 'card',
        isActive: true,
        commission: 0,
        sortOrder: 1,
      },
    }),
    prisma.paymentMethod.upsert({
      where: { id: 'bank-transfer' },
      update: {},
      create: {
        id: 'bank-transfer',
        name: 'Банковский перевод',
        type: 'bank_transfer',
        isActive: true,
        commission: 0,
        sortOrder: 2,
        instructions: 'Реквизиты для оплаты будут отправлены на email после оформления заказа',
      },
    }),
    prisma.paymentMethod.upsert({
      where: { id: 'cash-delivery' },
      update: {},
      create: {
        id: 'cash-delivery',
        name: 'Наличные при доставке',
        type: 'cash_delivery',
        isActive: true,
        commission: 0,
        sortOrder: 3,
      },
    }),
  ]);

  console.log('✅ Способы оплаты созданы:', paymentMethods.length);

  console.log('🎉 База данных успешно заполнена!');
  console.log('📧 Админ: admin@idylle.spb.ru');
  console.log('🔑 Пароль: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при заполнении базы данных:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
