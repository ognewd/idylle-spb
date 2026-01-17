import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/cdek/cities?query=...
 * Простой прокси для автокомплита городов CDEK
 * Использует точно указанные URL:
 * - https://api.edu.cdek.ru/v2/oauth/token?grant_type=client_credentials&client_id=...&client_secret=...
 * - https://api.edu.cdek.ru/v2/location/suggest/cities?name=...&country_code=RU&size=10
 */

// Кэш токена
let tokenCache: { token: string; expiresAt: number } | null = null;

async function getCdekToken(): Promise<string> {
  const CDEK_CLIENT_ID = process.env.CDEK_CLIENT_ID || 'wqGwiQx0gg8mLtiEKsUinjVSICCjtTEP';
  const CDEK_CLIENT_SECRET = process.env.CDEK_CLIENT_SECRET || 'RmAmgvSgSl1yirlz9QupbzOJVqhCxcP5';

  // Проверяем кэш
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60000) {
    return tokenCache.token;
  }

  // Получаем токен используя ТОЧНО указанный URL
  const tokenUrl = `https://api.edu.cdek.ru/v2/oauth/token?grant_type=client_credentials&client_id=${CDEK_CLIENT_ID}&client_secret=${CDEK_CLIENT_SECRET}`;

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  if (!response.ok) {
    throw new Error(`CDEK auth failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in * 1000),
  };

  return tokenCache.token;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');

    if (!query || query.trim().length < 1) {
      return NextResponse.json({ cities: [] });
    }

    const trimmedQuery = query.trim();

    // Получаем токен
    const token = await getCdekToken();

    // Запрашиваем города используя ТОЧНО указанный URL
    const citiesUrl = `https://api.edu.cdek.ru/v2/location/suggest/cities?name=${encodeURIComponent(trimmedQuery)}&country_code=RU&size=10`;

    const response = await fetch(citiesUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`CDEK cities API failed: ${response.status} ${response.statusText}`);
    }

    const cities: any[] = await response.json();

    // Фильтруем ТОЛЬКО российские города (RU)
    const russianCities = cities.filter(city => {
      const code = city.country_code?.toUpperCase();
      return code === 'RU';
    });

    // Форматируем ответ в нужном формате
    const formattedCities = russianCities.map(city => {
      // Парсим full_name: "Санкт-Петербург, Россия" или "Самара, городской округ Самара, Самарская область, Россия"
      const fullName = city.full_name || '';
      const parts = fullName.split(',').map((p: string) => p.trim());
      const cityName = parts[0] || '';
      const region = parts.length > 2 ? parts.slice(1, -1).join(', ') : (parts[1] || '');
      
      // Формируем отображаемое значение
      const postalCode = city.postal_codes && city.postal_codes.length > 0 ? city.postal_codes[0] : '';
      const cityType = 'г'; // по умолчанию город
      
      const displayParts: string[] = [];
      if (postalCode) displayParts.push(postalCode);
      displayParts.push(cityType);
      displayParts.push(cityName);
      
      const displayValue = displayParts.join(', ');

      return {
        value: displayValue,
        data: {
          code: city.code,
          city: cityName,
          region: region,
          postal_code: postalCode,
          country_code: city.country_code,
          fias_city_guid: city.fias_city_guid,
          kladr_code: city.kladr_code,
        },
      };
    });

    return NextResponse.json({ cities: formattedCities });
  } catch (error: any) {
    console.error('❌ [API /api/cdek/cities] Ошибка:', error);
    return NextResponse.json(
      { 
        error: 'Не удалось загрузить города',
        cities: [],
      },
      { status: 500 }
    );
  }
}
