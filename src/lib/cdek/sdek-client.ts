/**
 * Фабрика клиента СДЭК на базе sdek-api-lib.
 * Учётные данные берутся из настроек админки или env (getCdekCredentials).
 * @see https://www.npmjs.com/package/sdek-api-lib
 */

import { CdekApi } from 'sdek-api-lib';
import { getCdekCredentials } from './credentials';

let cachedClient: CdekApi | null = null;

/** sdek-api-lib сам добавляет /v2 к baseUrl, поэтому baseUrl без /v2 */
function normalizeCdekBaseUrl(url: string): string {
  return url.replace(/\/v2\/?$/, '') || url;
}

/**
 * Возвращает экземпляр CdekApi с учётными данными из админки/env.
 * Режим тестовый, если CDEK_TEST_MODE=true (тестовая среда api.edu.cdek.ru).
 */
export async function getCdekApi(): Promise<CdekApi> {
  const { clientId, clientSecret } = await getCdekCredentials();
  const rawUrl =
    process.env.CDEK_TEST_MODE === 'true'
      ? process.env.CDEK_API_TEST_URL || 'https://api.edu.cdek.ru'
      : process.env.CDEK_API_URL || 'https://api.cdek.ru';
  const baseUrl = normalizeCdekBaseUrl(rawUrl);

  if (cachedClient) {
    return cachedClient;
  }

  const client = new CdekApi({
    clientId,
    clientSecret,
    baseUrl,
  });
  cachedClient = client;
  return client;
}
