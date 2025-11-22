import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDevEnvironment() {
  try {
    console.log('🧪 Тестируем локальную среду разработки...\n');

    // 1. Проверяем подключение к базе данных
    console.log('1️⃣ Проверяем подключение к базе данных...');
    await prisma.$connect();
    console.log('✅ Подключение к БД успешно\n');

    // 2. Проверяем количество пользователей
    console.log('2️⃣ Проверяем пользователей...');
    const users = await prisma.user.findMany();
    console.log(`✅ Найдено пользователей: ${users.length}`);
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
    });
    console.log('');

    // 3. Проверяем бренды
    console.log('3️⃣ Проверяем бренды...');
    const brands = await prisma.brand.findMany();
    console.log(`✅ Найдено брендов: ${brands.length}`);
    brands.forEach(brand => {
      console.log(`   - ${brand.name} (${brand.slug})`);
    });
    console.log('');

    // 4. Проверяем категории
    console.log('4️⃣ Проверяем категории...');
    const categories = await prisma.category.findMany();
    console.log(`✅ Найдено категорий: ${categories.length}`);
    categories.forEach(category => {
      console.log(`   - ${category.name} (${category.slug})`);
    });
    console.log('');

    // 5. Проверяем товары
    console.log('5️⃣ Проверяем товары...');
    const products = await prisma.product.findMany({
      include: {
        brand: true,
        productCategories: {
          include: {
            category: true,
          },
        },
      },
    });
    console.log(`✅ Найдено товаров: ${products.length}`);
    products.forEach(product => {
      const categoryNames = product.productCategories.map(pc => pc.category.name).join(', ');
      console.log(`   - ${product.name} (${product.brand.name}) - ${categoryNames} - ${product.price}₽`);
    });
    console.log('');

    // 6. Проверяем связи товаров с категориями
    console.log('6️⃣ Проверяем связи товаров с категориями...');
    const productCategories = await prisma.productCategory.findMany({
      include: {
        product: true,
        category: true,
      },
    });
    console.log(`✅ Найдено связей: ${productCategories.length}`);
    productCategories.forEach(pc => {
      console.log(`   - ${pc.product.name} → ${pc.category.name} (${pc.isPrimary ? 'основная' : 'дополнительная'})`);
    });
    console.log('');

    // 7. Тестируем API endpoints
    console.log('7️⃣ Тестируем API endpoints...');
    try {
      const response = await fetch('http://localhost:3001/api/products');
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ API /api/products работает - возвращает ${data.products?.length || 0} товаров`);
      } else {
        console.log('❌ API /api/products не отвечает');
      }
    } catch (error) {
      console.log('❌ Ошибка при тестировании API:', error);
    }

    console.log('\n🎉 Тестирование завершено!');
    console.log('\n📊 Сводка:');
    console.log(`   - Пользователи: ${users.length}`);
    console.log(`   - Бренды: ${brands.length}`);
    console.log(`   - Категории: ${categories.length}`);
    console.log(`   - Товары: ${products.length}`);
    console.log(`   - Связи товар-категория: ${productCategories.length}`);

    console.log('\n🌐 Доступные URL:');
    console.log('   - Главная страница: http://localhost:3001');
    console.log('   - Каталог: http://localhost:3001/catalog');
    console.log('   - Админка: http://localhost:3001/admin/login');
    console.log('   - API товаров: http://localhost:3001/api/products');

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDevEnvironment();

