/**
 * Тестовый скрипт для проверки CDEK API напрямую
 */

const CDEK_CLIENT_ID = process.env.CDEK_CLIENT_ID || 'wqGwiQx0gg8mLtiEKsUinjVSICCjtTEP';
const CDEK_CLIENT_SECRET = process.env.CDEK_CLIENT_SECRET || 'RmAmgvSgSl1yirlz9QupbzOJVqhCxcP5';
const CDEK_API_URL = 'https://api.edu.cdek.ru/v2';

async function testCdekCities() {
  try {
    // 1. Получаем токен
    console.log('🔐 Шаг 1: Получение токена...');
    const credentials = Buffer.from(`${CDEK_CLIENT_ID}:${CDEK_CLIENT_SECRET}`).toString('base64');
    
    const tokenResponse = await fetch(`${CDEK_API_URL}/oauth/token?grant_type=client_credentials`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('❌ Ошибка получения токена:', tokenResponse.status, errorText);
      return;
    }

    const tokenData = await tokenResponse.json();
    const token = tokenData.access_token;
    console.log('✅ Токен получен:', token.substring(0, 20) + '...');

    // 2. Запрос к /location/suggest/cities
    console.log('\n🔍 Шаг 2: Запрос к /location/suggest/cities...');
    const params = new URLSearchParams({
      city: 'москва',
      country_codes: 'RU',
      lang: 'rus',
      size: '10',
    });

    const citiesUrl = `${CDEK_API_URL}/location/suggest/cities?${params.toString()}`;
    console.log('   URL:', citiesUrl);

    const citiesResponse = await fetch(citiesUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('\n📥 Ответ от CDEK API:');
    console.log('   Status:', citiesResponse.status, citiesResponse.statusText);
    console.log('   Headers:', Object.fromEntries(citiesResponse.headers.entries()));

    const responseText = await citiesResponse.text();
    console.log('\n📄 Полный Response Body:');
    console.log('━'.repeat(80));
    console.log(responseText);
    console.log('━'.repeat(80));

    if (citiesResponse.ok) {
      try {
        const data = JSON.parse(responseText);
        console.log('\n✅ Parsed JSON:');
        console.log(JSON.stringify(data, null, 2));
        console.log('\n📊 Статистика:');
        console.log('   Тип:', Array.isArray(data) ? 'array' : typeof data);
        if (Array.isArray(data)) {
          console.log('   Количество городов:', data.length);
          if (data.length > 0) {
            console.log('   Первый город:', JSON.stringify(data[0], null, 2));
          }
        }
      } catch (e) {
        console.error('❌ Ошибка парсинга JSON:', e.message);
      }
    } else {
      console.error('❌ Ошибка запроса:', responseText);
    }

  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

testCdekCities();
