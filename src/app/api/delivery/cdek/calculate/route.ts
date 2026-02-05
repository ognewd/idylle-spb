import { NextRequest, NextResponse } from 'next/server';
import { calculateDelivery } from '@/lib/cdek/calculator';
import { CdekApiError } from '@/lib/cdek/client';
import { DELIVERY_CONFIG } from '@/lib/delivery-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fromCity, toCity, weight, address: toAddress, length, width, height, deliveryType } = body;

    // Валидация
    if (!fromCity || !toCity || !weight) {
      return NextResponse.json(
        { error: 'Необходимо указать fromCity, toCity и weight' },
        { status: 400 }
      );
    }

    const weightGrams = parseInt(weight) || 1000;
    const { length: defaultL, width: defaultW, height: defaultH } = DELIVERY_CONFIG.DEFAULT_PACKAGE;

    // Рассчитываем стоимость (адрес toAddress — для уточнённой цены «до двери»; габариты — для объёмного веса)
    const result = await calculateDelivery({
      fromCity,
      toCity,
      weight: weightGrams,
      toAddress: typeof toAddress === 'string' && toAddress.trim() ? toAddress.trim() : undefined,
      length: length != null ? parseInt(length) : defaultL,
      width: width != null ? parseInt(width) : defaultW,
      height: height != null ? parseInt(height) : defaultH,
      deliveryType: deliveryType || 'door',
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('❌ Ошибка расчета стоимости СДЕК:', error);
    
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
      { error: error.message || 'Ошибка расчета стоимости доставки' },
      { status: 500 }
    );
  }
}
