import { NextRequest, NextResponse } from 'next/server';
import { getPvzByCity, getPvzByCityCode } from '@/lib/cdek/pvz';
import { CdekApiError } from '@/lib/cdek/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const cityCode = searchParams.get('city_code');

    if (!city && !cityCode) {
      return NextResponse.json(
        { error: 'Необходимо указать city или city_code' },
        { status: 400 }
      );
    }

    let pvzList;
    
    if (cityCode) {
      pvzList = await getPvzByCityCode(parseInt(cityCode));
    } else {
      pvzList = await getPvzByCity(city!);
    }

    return NextResponse.json({ pvz: pvzList });
  } catch (error: any) {
    console.error('❌ Ошибка получения ПВЗ СДЕК:', error);
    
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
      { error: error.message || 'Ошибка получения списка ПВЗ' },
      { status: 500 }
    );
  }
}
