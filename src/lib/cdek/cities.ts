/**
 * Модуль работы с городами СДЕК
 * Для получения кодов городов по названию
 */

import { cdekGet } from './client';

export interface CdekCity {
  code: number;
  city: string;
  region: string;
  region_code?: number;
  country: string;
  country_code: string;
  fias_region_guid?: string;
  fias_city_guid?: string;
  kladr_region_code?: string;
  kladr_code?: string;
  postal_codes?: string[];
  longitude?: number;
  latitude?: number;
  time_zone?: string;
}

/**
 * Поиск города по названию
 */
export async function findCityByName(cityName: string, country?: string): Promise<CdekCity | null> {
  try {
    const params: any = {
      city: cityName,
      size: 1, // Только первый результат
    };
    
    if (country) {
      params.country_code = country;
    } else {
      params.country_code = 'RU'; // По умолчанию Россия
    }

    const cities = await getCdekCitiesList(params);
    
    if (cities.length > 0) {
      return cities[0];
    }
    
    return null;
  } catch (error: any) {
    console.error('❌ Ошибка поиска города:', error);
    return null;
  }
}

/**
 * Получить код города по названию (с кэшированием)
 */
const cityCodeCache: Map<string, number | null> = new Map();

export async function getCityCode(cityName: string): Promise<number | null> {
  if (!cityName || !cityName.trim()) {
    return null;
  }
  
  const cacheKey = cityName.toLowerCase().trim();
  
  // Проверяем кэш
  if (cityCodeCache.has(cacheKey)) {
    return cityCodeCache.get(cacheKey) || null;
  }

  try {
    const city = await findCityByName(cityName.trim());
    const code = city?.code || null;
    
    // Сохраняем в кэш
    cityCodeCache.set(cacheKey, code);
    
    return code;
  } catch (error: any) {
    console.error(`❌ Ошибка получения кода города "${cityName}":`, error.message);
    // Сохраняем null в кэш, чтобы не повторять запрос
    cityCodeCache.set(cacheKey, null);
    return null;
  }
}

/**
 * Очистить кэш кодов городов
 */
export function clearCityCodeCache(): void {
  cityCodeCache.clear();
}
