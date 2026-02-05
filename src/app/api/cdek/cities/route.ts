import { NextRequest, NextResponse } from 'next/server';
import { getCdekAccessToken, getCdekApiBaseUrl } from '@/lib/cdek/auth';

/**
 * GET /api/cdek/cities?query=...
 * Автокомплит городов СДЭК через эндпоинт suggest (поддерживает частичный ввод, например «Санкт-Пете»).
 * Только Россия (country_code: RU).
 */

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get('query')?.trim();
    if (!query || query.length < 1) {
      return NextResponse.json({ cities: [] });
    }

    const baseUrl = getCdekApiBaseUrl();
    const token = await getCdekAccessToken();
    const url = `${baseUrl}/location/suggest/cities?name=${encodeURIComponent(query)}&country_code=RU&size=10`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`CDEK cities API: ${response.status} ${response.statusText}`);
    }

    const cities: Array<Record<string, unknown>> = await response.json();
    const arr = Array.isArray(cities) ? cities : [];

    const formattedCities = arr
      .filter((city) => (city.country_code as string)?.toUpperCase() === 'RU')
      .map((city) => {
        const fullName = String(city.full_name ?? '');
        const parts = fullName.split(',').map((p: string) => p.trim());
        const cityName = parts[0] ?? '';
        const region = parts.length > 2 ? parts.slice(1, -1).join(', ') : (parts[1] ?? '');
        const postalCode = Array.isArray(city.postal_codes)?.[0] ?? '';
        const displayParts: string[] = [];
        if (postalCode) displayParts.push(String(postalCode));
        displayParts.push('г', cityName);
        const displayValue = displayParts.join(', ');

        return {
          value: displayValue,
          data: {
            code: Number(city.code ?? 0),
            city: cityName,
            region,
            postal_code: postalCode,
            country_code: String(city.country_code ?? 'RU'),
            fias_city_guid: city.fias_city_guid,
            kladr_code: city.kladr_code,
          },
        };
      });

    return NextResponse.json({ cities: formattedCities });
  } catch (err) {
    console.error('❌ [API /api/cdek/cities]', err);
    return NextResponse.json(
      { error: 'Не удалось загрузить города', cities: [] },
      { status: 500 }
    );
  }
}
