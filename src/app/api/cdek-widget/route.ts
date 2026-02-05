/**
 * Прокси для виджета СДЭК 3.0 (servicePath).
 * Виджет обращается сюда для расчёта стоимости доставки.
 * Учётные данные берутся из настроек админки (Доставка СДЕК) или из env.
 *
 * @see https://github.com/cdek-it/widget/wiki/Установка-3.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculateDelivery, calculateCdekDelivery } from '@/lib/cdek/calculator';
import type { CdekCalculateRequest } from '@/lib/cdek/types';
import { CdekApiError } from '@/lib/cdek/client';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let body: Record<string, unknown>;

    if (contentType.includes('application/json')) {
      body = await request.json();
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const form = await request.formData();
      body = Object.fromEntries(form.entries()) as Record<string, unknown>;
      // числа из формы приходят строками
      if (typeof body.weight === 'string') body.weight = parseInt(body.weight as string, 10) || 0;
      if (typeof body.length === 'string') body.length = parseInt(body.length as string, 10) || undefined;
      if (typeof body.width === 'string') body.width = parseInt(body.width as string, 10) || undefined;
      if (typeof body.height === 'string') body.height = parseInt(body.height as string, 10) || undefined;
    } else {
      body = await request.json().catch(() => ({}));
    }

    // Формат виджета или наш: from_location / to_location / packages (API СДЭК)
    const fromLocation = body.from_location as CdekCalculateRequest['from_location'] | undefined;
    const toLocation = body.to_location as CdekCalculateRequest['to_location'] | undefined;
    const packages = body.packages as CdekCalculateRequest['packages'] | undefined;

    if (fromLocation && toLocation && Array.isArray(packages) && packages.length > 0) {
      const apiRequest: CdekCalculateRequest = {
        from_location: fromLocation,
        to_location: toLocation,
        packages,
      };
      const result = await calculateCdekDelivery(apiRequest);
      return NextResponse.json(result);
    }

    // Упрощённый формат: fromCity, toCity, weight (как в нашей форме)
    const fromCity = (body.fromCity ?? body.from_city ?? body.cityFrom) as string | undefined;
    const toCity = (body.toCity ?? body.to_city ?? body.cityTo) as string | undefined;
    const weight = Number(body.weight ?? body.weight_gram ?? 1000);
    const length = body.length != null ? Number(body.length) : undefined;
    const width = body.width != null ? Number(body.width) : undefined;
    const height = body.height != null ? Number(body.height) : undefined;

    if (!fromCity || !toCity) {
      return NextResponse.json(
        { error: 'Необходимо указать город отправления и получения (fromCity, toCity или from_location, to_location)' },
        { status: 400 }
      );
    }

    const result = await calculateDelivery({
      fromCity: String(fromCity).trim(),
      toCity: String(toCity).trim(),
      weight: Number.isFinite(weight) ? Math.round(weight) : 1000,
      length,
      width,
      height,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('❌ [cdek-widget] Ошибка расчёта:', error);

    if (error instanceof CdekApiError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          requestUuid: error.requestUuid,
        },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Ошибка расчёта доставки СДЭК' },
      { status: 500 }
    );
  }
}
