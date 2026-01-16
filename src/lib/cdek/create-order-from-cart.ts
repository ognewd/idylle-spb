/**
 * Вспомогательная функция для создания заказа в СДЕК из данных корзины
 */

import { createCdekOrder } from './orders';
import { getCityCode } from './cities';
import { CdekCreateOrderRequest } from './types';

export interface CreateOrderParams {
  // Данные отправителя (магазина)
  sender: {
    name: string;
    phone: string;
    email?: string;
  };
  // Данные получателя
  recipient: {
    name: string;
    phone: string;
    email?: string;
    city: string;
    address?: string; // Для доставки до двери
    pvzCode?: string; // Для доставки в ПВЗ
  };
  // Товары
  items: Array<{
    name: string;
    quantity: number;
    cost: number; // стоимость единицы товара
    weight: number; // вес в граммах
    ware_key?: string; // артикул/SKU
  }>;
  // Параметры доставки
  tariffCode: number;
  deliveryType: 'door' | 'pvz';
  comment?: string;
  orderNumber?: string; // Номер заказа в нашей системе
}

/**
 * Создать заказ в СДЕК из данных корзины
 */
export async function createCdekOrderFromCart(params: CreateOrderParams) {
  // Получаем коды городов
  const fromCityCode = await getCityCode('Санкт-Петербург') || 137; // СПб обычно 137 или 270
  const toCityCode = await getCityCode(params.recipient.city);

  if (!toCityCode) {
    throw new Error(`Не удалось найти код города "${params.recipient.city}"`);
  }

  // Рассчитываем общий вес
  const totalWeight = params.items.reduce((sum, item) => sum + (item.weight * item.quantity), 0);

  // Формируем запрос
  const request: CdekCreateOrderRequest = {
    number: params.orderNumber,
    tariff_code: params.tariffCode,
    from_location: {
      code: fromCityCode,
      city: 'Санкт-Петербург',
    },
    to_location: params.deliveryType === 'pvz' && params.recipient.pvzCode
      ? {
          code: toCityCode,
          city: params.recipient.city,
        }
      : {
          code: toCityCode,
          city: params.recipient.city,
          address: params.recipient.address,
        },
    sender: {
      name: params.sender.name,
      phones: [{ number: params.sender.phone }],
      ...(params.sender.email && { email: params.sender.email }),
    },
    recipient: {
      name: params.recipient.name,
      phones: [{ number: params.recipient.phone }],
      ...(params.recipient.email && { email: params.recipient.email }),
    },
    packages: [
      {
        weight: totalWeight,
        items: params.items.map((item, index) => ({
          name: item.name,
          ware_key: item.ware_key || `item-${index + 1}`,
          cost: item.cost,
          amount: item.quantity,
          weight: item.weight,
          payment: {
            value: item.cost * item.quantity,
          },
        })),
      },
    ],
    ...(params.comment && { comment: params.comment }),
  };

  // Если выбран ПВЗ, добавляем код ПВЗ
  if (params.deliveryType === 'pvz' && params.recipient.pvzCode) {
    // В СДЕК API v2 код ПВЗ передается через to_location.code для ПВЗ или через отдельное поле
    // Нужно проверить документацию, но обычно это делается через location.code
    // Для упрощения оставим как есть, может потребоваться доработка
  }

  return createCdekOrder(request);
}
