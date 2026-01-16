/**
 * Базовый клиент для работы с API СДЕК
 */

import { getCdekAccessToken } from './auth';
import { CdekError } from './types';

export class CdekApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode?: number,
    public requestUuid?: string
  ) {
    super(message);
    this.name = 'CdekApiError';
  }
}

/**
 * Выполнить запрос к API СДЕК с автоматической авторизацией
 */
export async function cdekApiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const CDEK_API_URL = process.env.CDEK_TEST_MODE === 'true'
    ? process.env.CDEK_API_TEST_URL || 'https://api.edu.cdek.ru/v2'
    : process.env.CDEK_API_URL || 'https://api.cdek.ru/v2';

  // Получаем токен
  const token = await getCdekAccessToken();

  // Формируем URL
  const url = endpoint.startsWith('http') ? endpoint : `${CDEK_API_URL}${endpoint}`;

  // Выполняем запрос
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  // Парсим ответ
  let data: any;
  const contentType = response.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    throw new CdekApiError(
      'INVALID_RESPONSE',
      `Неожиданный формат ответа: ${text}`,
      response.status
    );
  }

  // Проверяем на ошибки
  if (!response.ok) {
    const error: CdekError = data;
    throw new CdekApiError(
      error.error || 'UNKNOWN_ERROR',
      error.error_description || 'Неизвестная ошибка API СДЕК',
      response.status,
      error.request_uuid
    );
  }

  // Проверяем на ошибки в теле ответа (иногда СДЕК возвращает 200 с ошибками)
  if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
    const firstError = data.errors[0];
    throw new CdekApiError(
      firstError.code || 'API_ERROR',
      firstError.message || 'Ошибка API СДЕК',
      response.status,
      data.request_uuid
    );
  }

  return data as T;
}

/**
 * GET запрос к API СДЕК
 */
export async function cdekGet<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
  let url = endpoint;
  
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  return cdekApiRequest<T>(url, {
    method: 'GET',
  });
}

/**
 * POST запрос к API СДЕК
 */
export async function cdekPost<T>(endpoint: string, body: any): Promise<T> {
  return cdekApiRequest<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
