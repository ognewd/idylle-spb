import { NextRequest, NextResponse } from 'next/server';
import { sendMail } from '@/lib/mail';

const TO_EMAIL = 'office@aromarussia.ru';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const companyName = typeof body.companyName === 'string' ? body.companyName.trim() : '';
    const contacts = typeof body.contacts === 'string' ? body.contacts.trim() : '';
    const requisites = typeof body.requisites === 'string' ? body.requisites.trim() : '';
    const brands = typeof body.brands === 'string' ? body.brands.trim() : '';

    if (!companyName || !contacts || !requisites || !brands) {
      return NextResponse.json(
        { error: 'Заполните все поля формы' },
        { status: 400 }
      );
    }

    const subject = `Новая заявка на сотрудничество (дилеры): ${companyName}`;
    const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #111;">
  <h2 style="margin-bottom: 16px;">Новая заявка на сотрудничество</h2>
  <p style="margin-bottom: 20px; color: #555;">Форма отправлена со страницы «Сотрудничество / Дилерам».</p>
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="padding:10px 0; border-bottom:1px solid #eee; width:220px; color:#666;">Название компании</td>
      <td style="padding:10px 0; border-bottom:1px solid #eee;">${escapeHtml(companyName)}</td>
    </tr>
    <tr>
      <td style="padding:10px 0; border-bottom:1px solid #eee; color:#666; vertical-align:top;">Контакты</td>
      <td style="padding:10px 0; border-bottom:1px solid #eee; white-space:pre-wrap;">${escapeHtml(contacts)}</td>
    </tr>
    <tr>
      <td style="padding:10px 0; border-bottom:1px solid #eee; color:#666; vertical-align:top;">Реквизиты</td>
      <td style="padding:10px 0; border-bottom:1px solid #eee; white-space:pre-wrap;">${escapeHtml(requisites)}</td>
    </tr>
    <tr>
      <td style="padding:10px 0; border-bottom:1px solid #eee; color:#666; vertical-align:top;">Интересующие бренды</td>
      <td style="padding:10px 0; border-bottom:1px solid #eee; white-space:pre-wrap;">${escapeHtml(brands)}</td>
    </tr>
  </table>
</body>
</html>`;

    const text = [
      'Новая заявка на сотрудничество (дилеры)',
      '',
      `Название компании: ${companyName}`,
      '',
      'Контакты:',
      contacts,
      '',
      'Реквизиты:',
      requisites,
      '',
      'Интересующие бренды:',
      brands,
    ].join('\n');

    const result = await sendMail({
      to: TO_EMAIL,
      subject,
      html,
      text,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Не удалось отправить письмо' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Dealers contact API error:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}
