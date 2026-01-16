/**
 * Прямой тест API СДЕК с подробным логированием
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testDirect() {
  console.log('🧪 Прямой тест API СДЕК...\n');

  const CDEK_API_URL = 'https://api.edu.cdek.ru/v2';
  const clientId = process.env.CDEK_CLIENT_ID!;
  const clientSecret = process.env.CDEK_CLIENT_SECRET!;

  // 1. Авторизация
  console.log('1️⃣ Авторизация...');
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const authRes = await fetch(`${CDEK_API_URL}/oauth/token?grant_type=client_credentials`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  
  const authData = await authRes.json();
  console.log('Auth response:', JSON.stringify(authData, null, 2));
  
  if (!authData.access_token) {
    console.error('❌ Не удалось получить токен');
    return;
  }

  const token = authData.access_token;
  console.log('✅ Токен получен\n');

  // 2. Поиск городов
  console.log('2️⃣ Поиск кода города "Москва"...');
  const citiesRes = await fetch(`${CDEK_API_URL}/location/cities?city=Москва&size=1`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  const citiesData = await citiesRes.json();
  console.log('Cities response:', JSON.stringify(citiesData, null, 2));
  
  const moscowCode = Array.isArray(citiesData) && citiesData[0] ? citiesData[0].code : null;
  console.log('Код Москвы:', moscowCode, '\n');

  // 3. Расчет стоимости (попробуем с кодом города)
  if (moscowCode) {
    console.log('3️⃣ Расчет стоимости с кодом города...');
    const calcRequest = {
      from_location: { code: 137 }, // СПб обычно 137 или 270
      to_location: { code: moscowCode },
      packages: [{ weight: 1000 }],
    };
    
    console.log('Request:', JSON.stringify(calcRequest, null, 2));
    
    const calcRes = await fetch(`${CDEK_API_URL}/calculator/tarifflist`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(calcRequest),
    });
    
    const calcData = await calcRes.json();
    console.log('Response status:', calcRes.status);
    console.log('Response:', JSON.stringify(calcData, null, 2));
  }

  // 4. ПВЗ
  console.log('\n4️⃣ Поиск ПВЗ в Москве...');
  const pvzRes = await fetch(`${CDEK_API_URL}/deliverypoints?city_code=${moscowCode || 44}&type=PVZ&size=5`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  const pvzData = await pvzRes.json();
  console.log('PVZ response status:', pvzRes.status);
  console.log('PVZ count:', Array.isArray(pvzData) ? pvzData.length : 'not array');
  console.log('PVZ sample:', JSON.stringify(Array.isArray(pvzData) ? pvzData.slice(0, 2) : pvzData, null, 2));
}

testDirect().catch(console.error);
