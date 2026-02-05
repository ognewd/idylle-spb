/**
 * Отладочный эндпоинт: сырой ответ СДЭК по пунктам выдачи (структура location/coordinates).
 * GET /api/delivery/cdek/pvz-raw?city=Пермь
 */
import { NextRequest, NextResponse } from 'next/server';
import { getCdekApi } from '@/lib/cdek/sdek-client';
import { getCityCode } from '@/lib/cdek/cities';

export async function GET(request: NextRequest) {
  try {
    const city = request.nextUrl.searchParams.get('city');
    if (!city) {
      return NextResponse.json({ error: 'Укажите city' }, { status: 400 });
    }
    const cityCode = await getCityCode(city);
    if (!cityCode) {
      return NextResponse.json({ error: 'Город не найден', city }, { status: 404 });
    }
    const cdek = await getCdekApi();
    const rawList = await cdek.getDeliveryPoints({
      city_code: cityCode,
      type: 'PVZ',
      country_code: 'RU',
      lang: 'rus',
    });
    const first = Array.isArray(rawList) ? rawList[0] : (rawList as { points?: unknown[] })?.points?.[0];
    return NextResponse.json({
      city,
      city_code: cityCode,
      count: Array.isArray(rawList) ? rawList.length : (rawList as { points?: unknown[] })?.points?.length ?? 0,
      first_item_full: first ?? null,
      first_location: first && typeof first === 'object' && first !== null && 'location' in first
        ? (first as { location: unknown }).location
        : null,
    });
  } catch (e) {
    console.error('pvz-raw error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Ошибка запроса к СДЭК' },
      { status: 500 }
    );
  }
}
