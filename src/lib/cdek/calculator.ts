/**
 * Модуль расчета стоимости доставки СДЕК
 */

import { cdekPost } from './client';
import { CdekCalculateRequest, CdekCalculateResponse } from './types';
import { getCityCode } from './cities';

/**
 * Рассчитать стоимость доставки
 */
export async function calculateCdekDelivery(
  request: CdekCalculateRequest
): Promise<CdekCalculateResponse> {
  try {
    // Логируем запрос для отладки (только в dev режиме)
    if (process.env.NODE_ENV === 'development') {
      console.log('📤 CDEK Calculate Request:', JSON.stringify(request, null, 2));
    }
    
    const response = await cdekPost<any>('/calculator/tarifflist', request);
    
    // Нормализуем ответ: API возвращает tariff_codes, но мы хотим tariffs
    const normalizedResponse: CdekCalculateResponse = {
      ...response,
      tariffs: response.tariff_codes || response.tariffs || [],
    };
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📥 CDEK Calculate Response (normalized):', JSON.stringify(normalizedResponse, null, 2));
    }
    
    return normalizedResponse;
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
  fromCityCode?: number; // код города отправителя (если известен)
  toCityCode?: number; // код города получателя (если известен)
}

/**
 * Рассчитать стоимость доставки с упрощенными параметрами
 */
export async function calculateDelivery(params: SimpleCalculateParams): Promise<CdekCalculateResponse> {
  // Получаем коды городов, если они не указаны
  let fromCode = params.fromCityCode;
  let toCode = params.toCityCode;
  
  try {
    if (!fromCode) {
      fromCode = await getCityCode(params.fromCity);
      if (!fromCode) {
        // Если не найден код, пробуем использовать название города напрямую
        console.warn(`⚠️ Код города "${params.fromCity}" не найден, используем название`);
      }
    }
    
    if (!toCode) {
      toCode = await getCityCode(params.toCity);
      if (!toCode) {
        // Если не найден код, пробуем использовать название города напрямую
        console.warn(`⚠️ Код города "${params.toCity}" не найден, используем название`);
      }
    }
    
    const request: CdekCalculateRequest = {
      from_location: fromCode ? { code: fromCode } : { city: params.fromCity },
      to_location: toCode ? { code: toCode } : { city: params.toCity },
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
  } catch (error: any) {
    // Если произошла ошибка с кодами, пробуем без кодов
    if (error.message && error.message.includes('код города')) {
      console.warn('⚠️ Используем названия городов вместо кодов');
      const request: CdekCalculateRequest = {
        from_location: { city: params.fromCity },
        to_location: { city: params.toCity },
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
      };
      return calculateCdekDelivery(request);
    }
    throw error;
  }
}
