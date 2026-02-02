/**
 * Учётные данные СДЕК: чтение из БД (настройки админки) или из переменных окружения.
 * Жёстко заданные fallback-значения не используются.
 */

import { prisma } from '@/lib/prisma';

const CDEK_CLIENT_ID_KEY = 'CDEK_CLIENT_ID';
const CDEK_CLIENT_SECRET_KEY = 'CDEK_CLIENT_SECRET';

export interface CdekCredentials {
  clientId: string;
  clientSecret: string;
}

/**
 * Возвращает учётные данные СДЕК: сначала из таблицы Settings, при отсутствии — из process.env.
 * Если ни там, ни там нет — бросает ошибку (без запасных значений в коде).
 */
export async function getCdekCredentials(): Promise<CdekCredentials> {
  const fromDb = await prisma.settings.findMany({
    where: {
      key: { in: [CDEK_CLIENT_ID_KEY, CDEK_CLIENT_SECRET_KEY] },
    },
  });

  const map = new Map(fromDb.map((s) => [s.key, s.value]));
  let clientId = map.get(CDEK_CLIENT_ID_KEY)?.trim();
  let clientSecret = map.get(CDEK_CLIENT_SECRET_KEY)?.trim();

  if (!clientId) clientId = process.env.CDEK_CLIENT_ID?.trim();
  if (!clientSecret) clientSecret = process.env.CDEK_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    throw new Error(
      'CDEK: учётные данные не заданы. Укажите CDEK_CLIENT_ID и CDEK_CLIENT_SECRET в настройках доставки (админка) или в переменных окружения.'
    );
  }

  return { clientId, clientSecret };
}
