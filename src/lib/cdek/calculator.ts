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
 * Известные коды городов (для fallback)
 */
const KNOWN_CITY_CODES: Record<string, number> = {
  'Санкт-Петербург': 137, // Код СПб в СДЕК (проверено через тест)
  'Москва': 44,
  'МСК': 44,
  'СПБ': 137,
  'СПб': 137,
};

/**
 * Рассчитать стоимость доставки с упрощенными параметрами
 */
export async function calculateDelivery(params: SimpleCalculateParams): Promise<CdekCalculateResponse> {
  // Получаем коды городов, если они не указаны
  let fromCode = params.fromCityCode;
  let toCode = params.toCityCode;
  
  try {
    // Для города отправителя (СПб) используем известный код или ищем
    if (!fromCode) {
      // Сначала проверяем известные коды
      const normalizedFromCity = params.fromCity.trim();
      if (KNOWN_CITY_CODES[normalizedFromCity]) {
        fromCode = KNOWN_CITY_CODES[normalizedFromCity];
      } else {
        // Пытаемся найти код через API
        const cityCode = await getCityCode(params.fromCity);
        fromCode = cityCode || undefined;
      }
      
      // Если все равно не найден, используем код СПб по умолчанию
      if (!fromCode && (normalizedFromCity.includes('Санкт-Петербург') || normalizedFromCity.includes('СПб') || normalizedFromCity.includes('СПБ'))) {
        fromCode = 137; // Код СПб
        console.log(`✅ Используем код СПб по умолчанию: ${fromCode}`);
      }
      
      if (!fromCode) {
        throw new Error(`Не удалось определить код города отправителя: "${params.fromCity}"`);
      }
    }
    
    // Для города получателя
    if (!toCode) {
      // Сначала проверяем известные коды
      const normalizedToCity = params.toCity.trim();
      if (KNOWN_CITY_CODES[normalizedToCity]) {
        toCode = KNOWN_CITY_CODES[normalizedToCity];
      } else {
        // Пытаемся найти код через API
        const cityCode2 = await getCityCode(params.toCity);
        toCode = cityCode2 ?? undefined;
      }
      
      if (!toCode) {
        // Проверяем, не слишком ли короткое название города
        if (params.toCity.trim().length < 3) {
          throw new Error(`Укажите полное название города (минимум 3 символа)`);
        }
        throw new Error(`Не удалось найти код города получателя: "${params.toCity}". Проверьте правильность написания.`);
      }
    }
    
    // Обязательно используем коды городов для расчета
    const request: CdekCalculateRequest = {
      from_location: { code: fromCode },
      to_location: { code: toCode },
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
    console.error('❌ Ошибка в calculateDelivery:', error);
    throw error;
  }
}
