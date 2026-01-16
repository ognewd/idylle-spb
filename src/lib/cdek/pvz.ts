/**
 * Модуль работы с пунктами выдачи заказов (ПВЗ) СДЕК
 */

import { cdekGet } from './client';
import { CdekPvz, CdekPvzRequest } from './types';
import { getCityCode } from './cities';

/**
 * Получить список ПВЗ
 */
export async function getCdekPvzList(params?: CdekPvzRequest): Promise<CdekPvz[]> {
  try {
    // СДЕК возвращает массив напрямую, не объект с data
    const response = await cdekGet<CdekPvz[]>('/deliverypoints', params || {});
    return Array.isArray(response) ? response : [];
  } catch (error: any) {
    console.error('❌ Ошибка получения списка ПВЗ СДЕК:', error);
    throw error;
  }
}

/**
 * Получить ПВЗ по городу (с автопоиском кода города)
 */
export async function getPvzByCity(city: string): Promise<CdekPvz[]> {
  // Сначала пытаемся найти код города
  const cityCode = await getCityCode(city);
  
  if (cityCode) {
    // Используем код города для более точного поиска
    return getCdekPvzList({
      type: 'PVZ',
      city_code: cityCode,
      lang: 'rus',
    });
  }
  
  // Если код не найден, пытаемся по названию
  return getCdekPvzList({
    type: 'PVZ',
    city: city,
    lang: 'rus',
  });
}

/**
 * Получить ПВЗ по коду города
 */
export async function getPvzByCityCode(cityCode: number): Promise<CdekPvz[]> {
  return getCdekPvzList({
    type: 'PVZ',
    city_code: cityCode,
    lang: 'rus',
  });
}

/**
 * Получить информацию о конкретном ПВЗ по коду
 */
export async function getPvzByCode(code: string): Promise<CdekPvz | null> {
  try {
    const list = await getCdekPvzList({
      code: code,
      lang: 'rus',
    });
    return list.length > 0 ? list[0] : null;
  } catch (error: any) {
    console.error('❌ Ошибка получения ПВЗ по коду:', error);
    return null;
  }
}
