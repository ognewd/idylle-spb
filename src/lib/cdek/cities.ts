/**
 * Города СДЭК через sdek-api-lib (getCities).
 */

import { getCdekApi } from './sdek-client';

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

export interface CdekCityRequest {
  city?: string;
  size?: number;
  country_code?: string;
  region_code?: number;
  fias_region_guid?: string;
  kladr_region_code?: string;
  lang?: 'rus' | 'eng' | 'zho';
}

function mapCityFromSdek(raw: Record<string, unknown>): CdekCity {
  return {
    code: Number(raw.code),
    city: String(raw.city ?? ''),
    region: String(raw.region ?? ''),
    region_code: raw.region_code != null ? Number(raw.region_code) : undefined,
    country: String(raw.country ?? ''),
    country_code: String(raw.country_code ?? ''),
    fias_region_guid: raw.fias_region_guid != null ? String(raw.fias_region_guid) : undefined,
    fias_city_guid: raw.fias_guid != null ? String(raw.fias_guid) : undefined,
    kladr_region_code: raw.kladr_region_code != null ? String(raw.kladr_region_code) : undefined,
    kladr_code: raw.kladr_code != null ? String(raw.kladr_code) : undefined,
    postal_codes: Array.isArray(raw.postal_codes) ? raw.postal_codes.map(String) : undefined,
    longitude: raw.longitude != null ? Number(raw.longitude) : undefined,
    latitude: raw.latitude != null ? Number(raw.latitude) : undefined,
    time_zone: raw.time_zone != null ? String(raw.time_zone) : undefined,
  };
}

/**
 * Список городов по параметрам.
 */
export async function getCdekCitiesList(params?: CdekCityRequest): Promise<CdekCity[]> {
  try {
    const cdek = await getCdekApi();
    const options = {
      country_codes: params?.country_code ?? 'RU',
      size: params?.size ?? 10,
      ...(params?.city && { city: params.city }),
      ...(params?.region_code != null && { region_code: params.region_code }),
    };
    const list = await cdek.getCities(options);
    const arr = Array.isArray(list) ? list : [];
    return arr.map((item: Record<string, unknown>) => mapCityFromSdek(item));
  } catch (err) {
    console.error('❌ Ошибка получения списка городов СДЭК:', err);
    return [];
  }
}

/**
 * Поиск города по названию.
 */
export async function findCityByName(
  cityName: string,
  country?: string
): Promise<CdekCity | null> {
  try {
    const cities = await getCdekCitiesList({
      city: cityName,
      size: 1,
      country_code: country ?? 'RU',
    });
    return cities.length > 0 ? cities[0] : null;
  } catch (err) {
    console.error('❌ Ошибка поиска города СДЭК:', err);
    return null;
  }
}

const cityCodeCache = new Map<string, number | null>();

/**
 * Код города по названию (с кэшем).
 */
export async function getCityCode(cityName: string): Promise<number | null> {
  if (!cityName?.trim()) return null;
  const key = cityName.toLowerCase().trim();
  if (cityCodeCache.has(key)) {
    return cityCodeCache.get(key) ?? null;
  }
  try {
    const city = await findCityByName(cityName.trim());
    const code = city?.code ?? null;
    cityCodeCache.set(key, code);
    return code;
  } catch (err) {
    console.error(`❌ Ошибка получения кода города "${cityName}":`, err);
    cityCodeCache.set(key, null);
    return null;
  }
}

export function clearCityCodeCache(): void {
  cityCodeCache.clear();
}
