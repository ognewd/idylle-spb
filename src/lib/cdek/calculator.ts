/**
 * Модуль расчета стоимости доставки СДЕК
 */

import { cdekPost } from './client';
import { CdekCalculateRequest, CdekCalculateResponse } from './types';

/**
 * Рассчитать стоимость доставки
 */
export async function calculateCdekDelivery(
  request: CdekCalculateRequest
): Promise<CdekCalculateResponse> {
  try {
    const response = await cdekPost<CdekCalculateResponse>('/calculator/tarifflist', request);
    return response;
  } catch (error: any) {
    console.error('❌ Ошибка расчета стоимости СДЕК:', error);
    throw error;
  }
}

/**
 * Упрощенный расчет стоимости доставки
 */
export interface SimpleCalculateParams {
  fromCity: string;
  toCity: string;
  weight: number; // в граммах
  length?: number; // в см
  width?: number; // в см
  height?: number; // в см
  deliveryType?: 'door' | 'pvz'; // до двери или в ПВЗ
}

/**
 * Рассчитать стоимость доставки с упрощенными параметрами
 */
export async function calculateDelivery(params: SimpleCalculateParams): Promise<CdekCalculateResponse> {
  // Определяем тариф на основе типа доставки
  // 139 - дверь-дверь, 136 - склад-склад (ПВЗ)
  // Для начала используем базовые тарифы, можно будет расширить
  
  const request: CdekCalculateRequest = {
    from_location: {
      city: params.fromCity,
    },
    to_location: {
      city: params.toCity,
    },
    packages: [
      {
        weight: params.weight,
        ...(params.length && params.width && params.height && {
          length: params.length,
          width: params.width,
          height: params.height,
        }),
      },
    ],
    // Не указываем tariff_code, чтобы получить все доступные тарифы
  };

  return calculateCdekDelivery(request);
}
