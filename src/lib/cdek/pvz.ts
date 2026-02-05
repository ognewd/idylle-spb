/**
 * Пункты выдачи (ПВЗ) СДЭК через sdek-api-lib (getDeliveryPoints).
 */

import { getCdekApi } from './sdek-client';
import { getCityCode } from './cities';
import type { CdekPvz, CdekPvzRequest } from './types';

function mapDeliveryPointToCdekPvz(dp: {
  code?: string;
  name?: string;
  location?: Record<string, unknown>;
  work_time?: string;
  phones?: Array<{ number?: string }>;
  email?: string;
  note?: string;
  type?: string;
  owner_code?: string;
  is_handout?: boolean;
  is_reception?: boolean;
  is_dressing_room?: boolean;
  have_cashless?: boolean;
  have_cash?: boolean;
  allowed_cod?: boolean;
  nearest_station?: string;
  nearest_metro_station?: string;
}): CdekPvz {
  const loc = dp.location ?? {};
  const coords = (loc as { coordinates?: { latitude?: number; longitude?: number } }).coordinates;
  const lat = coords?.latitude ?? (loc as { latitude?: number }).latitude;
  const lng = coords?.longitude ?? (loc as { longitude?: number }).longitude;
  return {
    code: String(dp.code ?? ''),
    name: String(dp.name ?? ''),
    location: {
      code: Number((loc as { city_code?: number }).city_code ?? 0),
      city: String((loc as { city?: string }).city ?? ''),
      city_code: (loc as { city_code?: number }).city_code,
      address: String((loc as { address?: string }).address ?? ''),
      postal_code: (loc as { postal_code?: string }).postal_code,
      longitude: lng,
      latitude: lat,
    },
    work_time: dp.work_time,
    phones: dp.phones?.map((p) => ({ number: p.number ?? '' })),
    email: dp.email,
    note: dp.note,
    type: dp.type,
    owner_code: dp.owner_code,
    is_handout: dp.is_handout,
    is_reception: dp.is_reception,
    is_dressing_room: dp.is_dressing_room,
    have_cashless: dp.have_cashless,
    have_cash: dp.have_cash,
    allowed_cod: dp.allowed_cod,
    nearest_station: dp.nearest_station,
    metro_station: dp.nearest_metro_station,
  };
}

/**
 * Список ПВЗ по параметрам.
 */
export async function getCdekPvzList(params?: CdekPvzRequest): Promise<CdekPvz[]> {
  try {
    const cdek = await getCdekApi();
    const filter = {
      city_code: params?.city_code,
      type: params?.type,
      country_code: params?.country_code ?? 'RU',
      postal_code: params?.postal_code,
      code: params?.code,
      lang: params?.lang ?? 'rus',
    };
    const list = await cdek.getDeliveryPoints(filter as Parameters<typeof cdek.getDeliveryPoints>[0]);
    return (list ?? []).map((p: Record<string, unknown>) =>
      mapDeliveryPointToCdekPvz(p as Parameters<typeof mapDeliveryPointToCdekPvz>[0])
    );
  } catch (err) {
    console.error('❌ Ошибка получения списка ПВЗ СДЭК:', err);
    throw err;
  }
}

/**
 * ПВЗ по названию города (с определением кода города через getCityCode).
 */
export async function getPvzByCity(city: string): Promise<CdekPvz[]> {
  const cityCode = await getCityCode(city);
  if (!cityCode) return [];
  return getCdekPvzList({
    type: 'PVZ',
    city_code: cityCode,
    lang: 'rus',
  });
}

/**
 * ПВЗ по коду города.
 */
export async function getPvzByCityCode(cityCode: number): Promise<CdekPvz[]> {
  return getCdekPvzList({
    type: 'PVZ',
    city_code: cityCode,
    lang: 'rus',
  });
}

/**
 * Один ПВЗ по коду.
 */
export async function getPvzByCode(code: string): Promise<CdekPvz | null> {
  try {
    const list = await getCdekPvzList({ code, lang: 'rus' });
    return list.length > 0 ? list[0] : null;
  } catch (err) {
    console.error('❌ Ошибка получения ПВЗ по коду:', err);
    return null;
  }
}
