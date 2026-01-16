import { NextRequest, NextResponse } from 'next/server';
import { getCdekCitiesList, findCityByName } from '@/lib/cdek/cities';
import { getCdekPvzList } from '@/lib/cdek/pvz';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, city } = body;

    if (!query || typeof query !== 'string' || query.trim().length < 3) {
      return NextResponse.json({ suggestions: [] });
    }

    const trimmedQuery = query.trim();
    const suggestions: Array<{ value: string; data: any }> = [];

    // Если указан город, ищем адреса через ПВЗ (пункты выдачи)
    if (city && city.trim()) {
      try {
        // Находим код города
        const cityInfo = await findCityByName(city.trim());

        if (cityInfo && cityInfo.code) {
          const cityCode = cityInfo.code;
          
          // Ищем ПВЗ в этом городе, которые содержат запрос
          try {
            const pvzList = await getCdekPvzList({
              city_code: cityCode,
              type: 'PVZ',
              lang: 'rus',
            });

            // Фильтруем ПВЗ по адресу, содержащему запрос
            const filteredPvz = pvzList
              .filter(pvz => {
                const addressFull = pvz.location?.address_full?.toLowerCase() || '';
                const address = pvz.location?.address?.toLowerCase() || '';
                const name = pvz.name?.toLowerCase() || '';
                const queryLower = trimmedQuery.toLowerCase();
                return addressFull.includes(queryLower) || address.includes(queryLower) || name.includes(queryLower);
              })
              .slice(0, 5);

            // Добавляем ПВЗ в подсказки
            filteredPvz.forEach(pvz => {
              if (pvz.location?.address_full) {
                suggestions.push({
                  value: pvz.location.address_full,
                  data: {
                    type: 'pvz',
                    code: pvz.code,
                    name: pvz.name,
                    address: pvz.location.address_full,
                    city: pvz.location.city_name,
                  },
                });
              }
            });
          } catch (pvzError) {
            console.error('❌ CDEK PVZ search error:', pvzError);
          }
        }
      } catch (error) {
        console.error('❌ CDEK city search error:', error);
      }
    }

    // Также ищем города, если запрос похож на название города
    try {
      const cities = await getCdekCitiesList({
        city: trimmedQuery,
        size: 5,
        lang: 'rus',
        country_code: 'RU',
      });

      cities.forEach(cityItem => {
        // Добавляем город только если он еще не добавлен
        const cityValue = cityItem.city ? `${cityItem.city}, ${cityItem.region || ''}` : '';
        if (cityValue && !suggestions.some(s => s.value === cityValue)) {
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
    } catch (error) {
      console.error('❌ CDEK city search error:', error);
    }
    
    return NextResponse.json({
      suggestions: suggestions.slice(0, 5), // Максимум 5 подсказок
    });
  } catch (error) {
    console.error('❌ Address autocomplete error:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении подсказок адреса' },
      { status: 500 }
    );
  }
}
