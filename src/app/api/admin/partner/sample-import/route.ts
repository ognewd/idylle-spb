import { NextRequest, NextResponse } from 'next/server';
import { verifyPanelToken } from '@/lib/admin-auth';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  const authResult = await verifyPanelToken(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const sampleData = [
      {
        'Название': 'Пример товара',
        'Бренд': 'Название бренда',
        'Артикул': 'ART-001',
        'Цена': 1500,
        'Цена до скидки': 2000,
        'Остаток': 10,
        'Описание': 'Описание товара',
        'Краткое описание': 'Краткое описание',
        'Объём': '100 мл',
        'Вес (г)': 200,
        'Штрихкод': '4600000000001',
        'Категория': 'Категория товара',
        'Фото URL': 'https://example.com/image.jpg',
        'Дополнительное изображение':
          'https://example.com/extra1.jpg, https://example.com/extra2.jpg',
        'Описание аромата': 'Свежий, цветочный',
        'Основные ноты': 'Роза, жасмин',
        'Страна бренда': 'Франция',
        'Страна производства': 'Франция',
      },
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sampleData);

    // Порядок совпадает с ключами объекта строки (18 колонок)
    const colWidths = [
      { wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 10 },
      { wch: 15 }, { wch: 10 }, { wch: 40 }, { wch: 30 },
      { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 20 },
      { wch: 40 }, { wch: 55 }, { wch: 40 }, { wch: 30 }, { wch: 20 }, { wch: 15 },
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Товары');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="import_sample.xlsx"',
      },
    });
  } catch (error: any) {
    console.error('Sample import error:', error?.message);
    return NextResponse.json(
      { error: 'Ошибка при создании файла' },
      { status: 500 }
    );
  }
}
