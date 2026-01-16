/**
 * Модуль работы с заказами СДЕК
 */

import { cdekPost, cdekGet } from './client';
import { CdekCreateOrderRequest, CdekOrderResponse } from './types';

/**
 * Создать заказ в СДЕК
 */
export async function createCdekOrder(request: CdekCreateOrderRequest): Promise<CdekOrderResponse> {
  try {
    const response = await cdekPost<CdekOrderResponse>('/orders', request);
    return response;
  } catch (error: any) {
    console.error('❌ Ошибка создания заказа в СДЕК:', error);
    throw error;
  }
}

/**
 * Получить информацию о заказе по UUID
 */
export async function getCdekOrder(uuid: string): Promise<CdekOrderResponse> {
  try {
    const response = await cdekGet<CdekOrderResponse>(`/orders/${uuid}`);
    return response;
  } catch (error: any) {
    console.error('❌ Ошибка получения заказа СДЕК:', error);
    throw error;
  }
}
