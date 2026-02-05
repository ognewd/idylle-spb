/**
 * Учётные данные DaData: чтение из БД (настройки админки) или из переменных окружения.
 */

import { prisma } from '@/lib/prisma';

const DADATA_API_KEY_KEY = 'DADATA_API_KEY';
const DADATA_SECRET_KEY = 'DADATA_SECRET';

export interface DadataCredentials {
  apiKey: string;
  secret: string;
}

/**
 * Возвращает учётные данные DaData: сначала из таблицы Settings, при отсутствии — из process.env.
 * Если ни там, ни там нет — возвращает пустые строки (подсказки адресов перейдут на fallback по СДЭК).
 */
export async function getDadataCredentials(): Promise<DadataCredentials> {
  const fromDb = await prisma.settings.findMany({
    where: {
      key: { in: [DADATA_API_KEY_KEY, DADATA_SECRET_KEY] },
    },
  });

  const map = new Map(fromDb.map((s) => [s.key, s.value]));
  let apiKey = map.get(DADATA_API_KEY_KEY)?.trim() ?? process.env.DADATA_API_KEY?.trim() ?? '';
  let secret = map.get(DADATA_SECRET_KEY)?.trim() ?? process.env.DADATA_SECRET?.trim() ?? '';

  return { apiKey: apiKey || '', secret: secret || '' };
}
