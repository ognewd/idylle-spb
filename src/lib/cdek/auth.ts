/**
 * Модуль авторизации в API СДЕК
 * Использует OAuth2 client_credentials flow
 */

import { CdekAuthResponse, CdekError } from './types';

interface TokenCache {
  token: string;
  expiresAt: number;
}

let tokenCache: TokenCache | null = null;

/**
 * Получить access token для API СДЕК
 * Токен кэшируется и автоматически обновляется при истечении
 */
export async function getCdekAccessToken(): Promise<string> {
  const CDEK_CLIENT_ID = process.env.CDEK_CLIENT_ID;
  const CDEK_CLIENT_SECRET = process.env.CDEK_CLIENT_SECRET;
  const CDEK_API_URL = process.env.CDEK_TEST_MODE === 'true' 
    ? process.env.CDEK_API_TEST_URL || 'https://api.edu.cdek.ru/v2'
    : process.env.CDEK_API_URL || 'https://api.cdek.ru/v2';

  if (!CDEK_CLIENT_ID || !CDEK_CLIENT_SECRET) {
    throw new Error('CDEK_CLIENT_ID и CDEK_CLIENT_SECRET должны быть установлены в переменных окружения');
  }

  // Проверяем кэш токена
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60000) {
    // Токен еще действителен (с запасом 1 минута)
    return tokenCache.token;
  }

  try {
    // Формируем Basic Auth заголовок
    const credentials = Buffer.from(`${CDEK_CLIENT_ID}:${CDEK_CLIENT_SECRET}`).toString('base64');

    const response = await fetch(`${CDEK_API_URL}/oauth/token?grant_type=client_credentials`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!response.ok) {
      const errorData: CdekError = await response.json().catch(() => ({
        error: 'Unknown error',
        error_description: `HTTP ${response.status}: ${response.statusText}`,
      }));

      throw new Error(
        `CDEK auth error: ${errorData.error} - ${errorData.error_description || 'Неизвестная ошибка'}`
      );
    }

    const data: CdekAuthResponse = await response.json();

    // Кэшируем токен (expires_in в секундах, конвертируем в миллисекунды)
    tokenCache = {
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in * 1000),
    };

    console.log('✅ CDEK token получен, истекает через', data.expires_in, 'секунд');
    return tokenCache.token;
  } catch (error: any) {
    console.error('❌ Ошибка получения токена СДЕК:', error);
    throw error;
  }
}

/**
 * Очистить кэш токена (для тестирования или принудительного обновления)
 */
export function clearCdekTokenCache(): void {
  tokenCache = null;
}
