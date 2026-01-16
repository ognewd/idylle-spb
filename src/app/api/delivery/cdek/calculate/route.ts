import { NextRequest, NextResponse } from 'next/server';
import { calculateDelivery } from '@/lib/cdek/calculator';
import { CdekApiError } from '@/lib/cdek/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fromCity, toCity, weight, length, width, height, deliveryType } = body;

    // Валидация
    if (!fromCity || !toCity || !weight) {
      return NextResponse.json(
        { error: 'Необходимо указать fromCity, toCity и weight' },
        { status: 400 }
      );
    }

    // Рассчитываем стоимость
    const result = await calculateDelivery({
      fromCity,
      toCity,
      weight: parseInt(weight) || 1000, // по умолчанию 1 кг
      length: length ? parseInt(length) : undefined,
      width: width ? parseInt(width) : undefined,
      height: height ? parseInt(height) : undefined,
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
