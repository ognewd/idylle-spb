import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestOrders() {
  try {
    console.log('🧪 Создаем тестовые заказы для проверки функционала покупателей...\n');

    // 1. Создаем несколько тестовых заказов
    const testOrders = [
      {
        orderNumber: 'IDY-001',
        firstName: 'Иван',
        lastName: 'Петров',
        email: 'ivan.petrov@example.com',
        phone: '+7 (911) 123-45-67',
        city: 'Санкт-Петербург',
        deliveryAddress: 'Невский проспект, 123, кв. 45',
        paymentMethod: 'card',
        deliveryMethod: 'delivery',
        subtotal: 5000,
        total: 5000,
        items: [
          {
            productName: 'Ароматическая свеча "Лаванда"',
            quantity: 2,
            price: 2500,
          },
        ],
      },
      {
        orderNumber: 'IDY-002',
        firstName: 'Мария',
        lastName: 'Сидорова',
        email: 'maria.sidorova@example.com',
        phone: '+7 (911) 234-56-78',
        city: 'Москва',
        deliveryAddress: 'Тверская улица, 15, кв. 12',
        paymentMethod: 'card',
        deliveryMethod: 'delivery',
        subtotal: 7500,
        total: 7500,
        items: [
          {
            productName: 'Диффузор "Цитрус"',
            quantity: 1,
            price: 3200,
          },
          {
            productName: 'Домашний ароматизатор "Жасмин"',
            quantity: 1,
            price: 2200,
          },
        ],
      },
      {
        orderNumber: 'IDY-003',
        firstName: 'Алексей',
        lastName: 'Козлов',
        email: 'alexey.kozlov@example.com',
        phone: '+7 (911) 345-67-89',
        city: 'Санкт-Петербург',
        deliveryAddress: 'Литейный проспект, 45, кв. 78',
        paymentMethod: 'cash',
        deliveryMethod: 'pickup',
        subtotal: 3200,
        total: 3200,
        items: [
          {
            productName: 'Диффузор "Цитрус"',
            quantity: 1,
            price: 3200,
          },
        ],
      },
      {
        orderNumber: 'IDY-004',
        firstName: 'Елена',
        lastName: 'Морозова',
        email: 'elena.morozova@example.com',
        phone: '+7 (911) 456-78-90',
        city: 'Казань',
        deliveryAddress: 'Баумана, 67, кв. 23',
        paymentMethod: 'card',
        deliveryMethod: 'delivery',
        subtotal: 4400,
        total: 4400,
        items: [
          {
            productName: 'Ароматическая свеча "Лаванда"',
            quantity: 1,
            price: 2500,
          },
          {
            productName: 'Домашний ароматизатор "Жасмин"',
            quantity: 1,
            price: 2200,
          },
        ],
      },
      {
        orderNumber: 'IDY-005',
        firstName: 'Иван',
        lastName: 'Петров',
        email: 'ivan.petrov@example.com',
        phone: '+7 (911) 123-45-67',
        city: 'Санкт-Петербург',
        deliveryAddress: 'Невский проспект, 123, кв. 45',
        paymentMethod: 'card',
        deliveryMethod: 'delivery',
        subtotal: 6400,
        total: 6400,
        items: [
          {
            productName: 'Диффузор "Цитрус"',
            quantity: 2,
            price: 3200,
          },
        ],
      },
    ];

    // 2. Создаем заказы
    for (const orderData of testOrders) {
      const order = await prisma.order.create({
        data: {
          orderNumber: orderData.orderNumber,
          firstName: orderData.firstName,
          lastName: orderData.lastName,
          email: orderData.email,
          phone: orderData.phone,
          city: orderData.city,
          deliveryAddress: orderData.deliveryAddress,
          paymentMethod: orderData.paymentMethod,
          deliveryMethod: orderData.deliveryMethod,
          subtotal: orderData.subtotal,
          total: orderData.total,
          items: {
            create: orderData.items.map(item => ({
              productName: item.productName,
              quantity: item.quantity,
              price: item.price,
              productId: 'test-product-id', // Заглушка для тестирования
            })),
          },
        },
      });

      console.log(`✅ Заказ создан: ${order.orderNumber} - ${order.firstName} ${order.lastName}`);
    }

    console.log('\n🎉 Тестовые заказы созданы!');
    console.log('\n📊 Созданные покупатели:');
    console.log('1. Иван Петров - 2 заказа');
    console.log('2. Мария Сидорова - 1 заказ');
    console.log('3. Алексей Козлов - 1 заказ');
    console.log('4. Елена Морозова - 1 заказ');

  } catch (error) {
    console.error('❌ Ошибка при создании тестовых заказов:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestOrders();

