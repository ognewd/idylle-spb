/**
 * Заказы СДЭК через sdek-api-lib (createOrder, getOrder).
 */

import { getCdekApi } from './sdek-client';
import type { CdekCreateOrderRequest, CdekOrderResponse } from './types';

/**
 * Создать заказ в СДЭК.
 */
export async function createCdekOrder(
  request: CdekCreateOrderRequest
): Promise<CdekOrderResponse> {
  const cdek = await getCdekApi();
  const sdekRequest = {
    number: request.number,
    tariff_code: request.tariff_code,
    comment: request.comment,
    from_location: request.from_location,
    to_location: request.to_location,
    sender: {
      name: request.sender.name,
      company: request.sender.company,
      email: request.sender.email,
      phones: request.sender.phones.map((p) => ({ number: p.number })),
    },
    recipient: {
      name: request.recipient.name,
      company: request.recipient.company,
      email: request.recipient.email,
      phones: request.recipient.phones.map((p) => ({ number: p.number })),
    },
    packages: request.packages.map((pkg, idx) => ({
      number: pkg.number ?? String(idx + 1),
      weight: pkg.weight,
      length: pkg.length,
      width: pkg.width,
      height: pkg.height,
      items: (pkg.items ?? []).map((item) => ({
        name: item.name,
        ware_key: item.ware_key ?? item.name,
        cost: item.cost,
        amount: item.amount,
        weight: item.weight,
        payment: item.payment?.value != null ? { value: item.payment.value, vat_sum: item.payment.vat_sum } : undefined,
      })),
    })),
    services: request.services,
  };
  const res = await cdek.createOrder(sdekRequest as Parameters<typeof cdek.createOrder>[0]);
  return {
    request_uuid: res.requests?.[0]?.request_uuid,
    type: 'CREATE',
    entity: res.entity ? { uuid: res.entity.uuid } : undefined,
    warnings: res.requests?.[0]?.warnings,
    errors: res.requests?.[0]?.errors,
  };
}

/**
 * Получить заказ по UUID.
 */
export async function getCdekOrder(uuid: string): Promise<CdekOrderResponse> {
  const cdek = await getCdekApi();
  const info = await cdek.getOrder(uuid);
  return {
    type: 'INFO',
    number: info.number,
    cdek_number: info.cdek_number,
    tariff_code: info.tariff_code,
    statuses: info.statuses?.map((s) => ({
      code: s.code,
      name: s.name ?? s.code,
      datetime: s.date_time ?? '',
    })),
    entity: { uuid: info.uuid, cdek_number: info.cdek_number },
  };
}
