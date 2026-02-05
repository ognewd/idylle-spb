import { NextRequest, NextResponse } from 'next/server';
import { getCdekApi } from '@/lib/cdek/sdek-client';
import { calculateDelivery } from '@/lib/cdek/calculator';
import { getPvzByCity } from '@/lib/cdek/pvz';

/**
 * Тестовый endpoint для проверки работы СДЕК API (sdek-api-lib).
 * GET /api/delivery/cdek/test
 */
export async function GET(request: NextRequest) {
  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    tests: {},
  };

  try {
    // Тест 1: Авторизация (клиент sdek-api-lib)
    console.log('🧪 Тест 1: Авторизация...');
    try {
      const cdek = await getCdekApi();
      await cdek.getRegions('RU', 1, 0);
      results.tests.auth = {
        success: true,
        message: 'Токен получен успешно (sdek-api-lib)',
      };
    } catch (error: unknown) {
      results.tests.auth = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }

    // Тест 2: Расчет стоимости
    console.log('🧪 Тест 2: Расчет стоимости...');
    try {
      const calcResult = await calculateDelivery({
        fromCity: 'Санкт-Петербург',
        toCity: 'Москва',
        weight: 1000, // 1 кг
        length: 20,
        width: 15,
        height: 10,
      });
      results.tests.calculation = {
        success: true,
        tariffsCount: calcResult.tariff_codes?.length ?? 0,
        tariffs: calcResult.tariff_codes ?? [],
      };
    } catch (error: unknown) {
      results.tests.calculation = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }

    // Тест 3: Получение ПВЗ
    console.log('🧪 Тест 3: Получение ПВЗ...');
    try {
      const pvzList = await getPvzByCity('Москва');
      results.tests.pvz = {
        success: true,
        pvzCount: pvzList.length,
        samplePvz: pvzList.slice(0, 2).map(p => ({
          code: p.code,
          name: p.name,
          address: p.location?.address,
        })),
      };
    } catch (error: unknown) {
      results.tests.pvz = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }

    const allSuccess = Object.values(results.tests).every(
      (test: unknown) => (test as { success?: boolean })?.success === true
    );

    return NextResponse.json({
      ...results,
      overall: allSuccess ? 'SUCCESS' : 'PARTIAL_FAILURE',
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        ...results,
        overall: 'FAILURE',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
