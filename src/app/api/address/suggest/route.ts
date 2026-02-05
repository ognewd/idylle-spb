import { NextRequest, NextResponse } from 'next/server';
import { getDadataCredentials } from '@/lib/dadata/credentials';

const DADATA_URL = 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address';

/** Нормализованный адрес для фронта (без ключей DaData) */
export interface AddressSuggestionItem {
  display: string;
  full: string;
  postalCode: string | null;
  city: string | null;
  street: string | null;
  house: string | null;
  flat: string | null;
  geo: { lat: string | null; lon: string | null };
}

/**
 * Подсказки адресов.
 * Если заданы DADATA_API_KEY и DADATA_SECRET — запрос к DaData (ограничение по городу, от улицы к дому).
 * Иначе — fallback по ПВЗ СДЭК в выбранном городе.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { city, query, count = 10 } = body;

    if (!query || typeof query !== 'string' || query.trim().length < 3) {
      return NextResponse.json({ suggestions: [] });
    }

    const trimmedQuery = query.trim();
    const { apiKey, secret } = await getDadataCredentials();

    if (apiKey && secret) {
      const dadataBody: Record<string, unknown> = {
        query: trimmedQuery,
        count: Math.min(Number(count) || 10, 20),
        from_bound: { value: 'street' },
        to_bound: { value: 'house' },
        restrict_value: true,
      };
      if (city && String(city).trim()) {
        dadataBody.locations = [{ city: String(city).trim() }];
      }

      const res = await fetch(DADATA_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Token ${apiKey}`,
          'X-Secret': secret,
        },
        body: JSON.stringify(dadataBody),
      });

      if (!res.ok) {
        console.error('❌ DaData address suggest:', res.status, await res.text());
        return NextResponse.json({ suggestions: [] });
      }

      const data = await res.json();
      const list = Array.isArray(data.suggestions) ? data.suggestions : [];
      const suggestions: AddressSuggestionItem[] = list.map((s: any) => ({
        display: s.value || '',
        full: s.unrestricted_value || s.value || '',
        postalCode: s.data?.postal_code ?? null,
        city: s.data?.city ?? null,
        street: (s.data?.street_with_type || s.data?.street) ?? null,
        house: s.data?.house ?? null,
        flat: s.data?.flat ?? null,
        geo: {
          lat: s.data?.geo_lat ?? null,
          lon: s.data?.geo_lon ?? null,
        },
      }));

      return NextResponse.json({ suggestions });
    }

    // Fallback: подсказки по адресам ПВЗ СДЭК в городе
    const { getCdekCitiesList, findCityByName } = await import('@/lib/cdek/cities');
    const { getCdekPvzList } = await import('@/lib/cdek/pvz');
    const suggestions: Array<{ value: string; data: any }> = [];

    if (city && city.trim()) {
      try {
        const cityInfo = await findCityByName(city.trim());
        if (cityInfo?.code) {
          try {
            const pvzList = await getCdekPvzList({
              city_code: cityInfo.code,
              type: 'PVZ',
              lang: 'rus',
            });
            const filteredPvz = pvzList
              .filter((pvz) => {
                const address = pvz.location?.address || '';
                const name = pvz.name?.toLowerCase() || '';
                return (
                  address.toLowerCase().includes(trimmedQuery.toLowerCase()) ||
                  name.includes(trimmedQuery.toLowerCase())
                );
              })
              .slice(0, 10);
            filteredPvz.forEach((pvz) => {
              if (pvz.location?.address) {
                const cityName = pvz.location.city || '';
                const address = pvz.location.address || '';
                suggestions.push({
                  value: `${cityName}, ${address}`,
                  data: {
                    type: 'pvz',
                    code: pvz.code,
                    name: pvz.name,
                    address,
                    city: cityName,
                  },
                });
              }
            });
          } catch (e) {
            console.error('❌ CDEK PVZ search error:', e);
          }
        }
      } catch (e) {
        console.error('❌ CDEK city search error:', e);
      }
    }

    // Города по запросу (fallback)
    try {
      const cities = await getCdekCitiesList({
        city: trimmedQuery,
        size: 5,
        lang: 'rus',
        country_code: 'RU',
      });
      cities.forEach((cityItem) => {
        const cityValue = cityItem.city ? `${cityItem.city}, ${cityItem.region || ''}` : '';
        if (cityValue && !suggestions.some((s: any) => s.value === cityValue)) {
          suggestions.push({
            value: cityValue,
            data: {
              type: 'city',
              code: cityItem.code,
              city: cityItem.city,
              region: cityItem.region,
            },
          });
        }
      });
    } catch (e) {
      console.error('❌ CDEK cities error:', e);
    }

    return NextResponse.json({
      suggestions: suggestions.slice(0, 10),
    });
  } catch (error) {
    console.error('❌ Address suggest error:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении подсказок адреса', suggestions: [] },
      { status: 500 }
    );
  }
}
