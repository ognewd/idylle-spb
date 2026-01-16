import { NextRequest, NextResponse } from 'next/server';
import { getCdekAccessToken } from '@/lib/cdek/auth';
import { calculateDelivery } from '@/lib/cdek/calculator';
import { getPvzByCity } from '@/lib/cdek/pvz';

/**
 * Тестовый endpoint для проверки работы СДЕК API
 * GET /api/delivery/cdek/test
 */
export async function GET(request: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    tests: {},
  };

  try {
    // Тест 1: Авторизация
    console.log('🧪 Тест 1: Авторизация...');
    try {
      const token = await getCdekAccessToken();
      results.tests.auth = {
        success: true,
        tokenLength: token.length,
        message: 'Токен получен успешно',
      };
    } catch (error: any) {
      results.tests.auth = {
        success: false,
        error: error.message,
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
        tariffsCount: calcResult.tariffs?.length || 0,
        tariffs: calcResult.tariffs || [],
      };
    } catch (error: any) {
      results.tests.calculation = {
        success: false,
        error: error.message,
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
    } catch (error: any) {
      results.tests.pvz = {
        success: false,
        error: error.message,
      };
    }

    const allSuccess = Object.values(results.tests).every((test: any) => test.success);

    return NextResponse.json({
      ...results,
      overall: allSuccess ? 'SUCCESS' : 'PARTIAL_FAILURE',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ...results,
        overall: 'FAILURE',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
