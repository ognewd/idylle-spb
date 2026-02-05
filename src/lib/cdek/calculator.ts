/**
 * Расчёт стоимости доставки СДЭК через sdek-api-lib.
 *
 * Вызов СДЭК: POST /v2/calculator/tarifflist
 *
 * Тело запроса (для обоих типов доставки — «до двери» и «до ПВЗ» — один и тот же):
 * - from_location: { code: number } — код города отправителя (обязательно)
 * - to_location: { code: number } — код города получателя (обязательно)
 * - packages: [{ weight (г), length?, width?, height? (см) }] — минимум weight
 *
 * Опционально в location: postal_code, city, country_code, address (уточняют расчёт).
 * Опционально в запросе: date (дата отправления), currency, lang, tariff_codes (фильтр тарифов).
 *
 * Ответ: массив тарифов (tariff_codes). У каждого: tariff_code, delivery_mode (1 — дверь, 2 — ПВЗ),
 * delivery_sum, period_min, period_max. Один вызов возвращает и тариф «до двери», и «до ПВЗ».
 */

import { getCdekApi } from './sdek-client';
import type { CdekCalculateRequest, CdekCalculateResponse, CdekTariff } from './types';
import { getCityCode } from './cities';

/**
 * Рассчитать стоимость доставки (формат API СДЭК: from_location, to_location, packages).
 */
export async function calculateCdekDelivery(
  request: CdekCalculateRequest
): Promise<CdekCalculateResponse> {
  const cdek = await getCdekApi();
  const list = await cdek.calculateTariffList({
    from_location: request.from_location,
    to_location: request.to_location,
    packages: request.packages.map((p) => ({
      weight: p.weight,
      length: p.length,
      width: p.width,
      height: p.height,
    })),
  });
  const tariffs: CdekTariff[] = list.map((t) => ({
    tariff_code: t.tariff_code,
    tariff_name: t.tariff_name,
    tariff_description: t.tariff_description,
    delivery_mode: t.delivery_mode as number | undefined,
    delivery_sum: t.delivery_sum,
    period_min: t.period_min,
    period_max: t.period_max,
  }));
  return { tariff_codes: tariffs, tariffs };
}

export interface SimpleCalculateParams {
  fromCity: string;
  toCity: string;
  weight: number;
  /** Полный адрес доставки (улица, дом, кв.) — для уточнённого расчёта «до двери» */
  toAddress?: string;
  length?: number;
  width?: number;
  height?: number;
  deliveryType?: 'door' | 'pvz';
  fromCityCode?: number;
  toCityCode?: number;
}

const KNOWN_CITY_CODES: Record<string, number> = {
  'Санкт-Петербург': 137,
  Москва: 44,
  МСК: 44,
  СПБ: 137,
  СПб: 137,
};

/**
 * Упрощённый расчёт: по названиям городов и весу.
 */
export async function calculateDelivery(
  params: SimpleCalculateParams
): Promise<CdekCalculateResponse> {
  let fromCode = params.fromCityCode;
  let toCode = params.toCityCode;

  if (!fromCode) {
    const normalizedFrom = params.fromCity.trim();
    fromCode =
      KNOWN_CITY_CODES[normalizedFrom] ??
      (await getCityCode(params.fromCity)) ??
      undefined;
    if (!fromCode && /Санкт-Петербург|СПб|СПБ/i.test(normalizedFrom)) {
      fromCode = 137;
    }
    if (!fromCode) {
      throw new Error(`Не удалось определить код города отправителя: "${params.fromCity}"`);
    }
  }

  if (!toCode) {
    const normalizedTo = params.toCity.trim();
    toCode = KNOWN_CITY_CODES[normalizedTo] ?? (await getCityCode(params.toCity)) ?? undefined;
    if (!toCode) {
      if (params.toCity.trim().length < 3) {
        throw new Error('Укажите полное название города (минимум 3 символа)');
      }
      throw new Error(
        `Не удалось найти код города получателя: "${params.toCity}". Проверьте правильность написания.`
      );
    }
  }

  return calculateCdekDelivery({
    from_location: { code: fromCode },
    to_location: {
      code: toCode,
      ...(params.toAddress?.trim() && { address: params.toAddress.trim() }),
    },
    packages: [
      {
        weight: params.weight,
        ...(params.length != null &&
          params.width != null &&
          params.height != null && {
            length: params.length,
            width: params.width,
            height: params.height,
          }),
      },
    ],
  });
}
