import { NextRequest, NextResponse } from 'next/server';
import { sendMail } from '@/lib/mail';

const TO_EMAIL = 'zakaz@aromarussia.ru';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const question = typeof body.question === 'string' ? body.question.trim() : '';
    const productName = typeof body.productName === 'string' ? body.productName.trim() : '';
    const productUrl = typeof body.productUrl === 'string' ? body.productUrl.trim() : '';
    const consent = body.consent === true;

    if (!fullName || !phone || !email || !question) {
      return NextResponse.json({ error: 'Заполните обязательные поля' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Некорректный email' }, { status: 400 });
    }

    if (!isValidPhone(phone)) {
      return NextResponse.json({ error: 'Некорректный формат телефона' }, { status: 400 });
    }

    if (!consent) {
      return NextResponse.json({ error: 'Необходимо согласие на обработку персональных данных' }, { status: 400 });
    }

    const subject = productName
      ? `Вопрос по товару: ${productName}`
      : `Обращение с формы обратной связи: ${fullName}`;

    const html = `<!DOCTYPE html>
<html>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #111;">
    <h2 style="margin-bottom: 16px;">Новое обращение с формы обратной связи</h2>
    <table style="width:100%; border-collapse:collapse;">
      <tr>
        <td style="padding:10px 0; border-bottom:1px solid #eee; width:220px; color:#666;">ФИО</td>
        <td style="padding:10px 0; border-bottom:1px solid #eee;">${escapeHtml(fullName)}</td>
      </tr>
      <tr>
        <td style="padding:10px 0; border-bottom:1px solid #eee; color:#666;">Телефон</td>
        <td style="padding:10px 0; border-bottom:1px solid #eee;">${escapeHtml(phone)}</td>
      </tr>
      <tr>
        <td style="padding:10px 0; border-bottom:1px solid #eee; color:#666;">Email</td>
        <td style="padding:10px 0; border-bottom:1px solid #eee;">${escapeHtml(email)}</td>
      </tr>
      <tr>
        <td style="padding:10px 0; border-bottom:1px solid #eee; color:#666; vertical-align:top;">Вопрос</td>
        <td style="padding:10px 0; border-bottom:1px solid #eee; white-space:pre-wrap;">${escapeHtml(question)}</td>
      </tr>
      <tr>
        <td style="padding:10px 0; border-bottom:1px solid #eee; color:#666;">Название товара</td>
        <td style="padding:10px 0; border-bottom:1px solid #eee;">${productName ? escapeHtml(productName) : '—'}</td>
      </tr>
      <tr>
        <td style="padding:10px 0; border-bottom:1px solid #eee; color:#666;">Ссылка на товар</td>
        <td style="padding:10px 0; border-bottom:1px solid #eee;">
          ${productUrl ? `<a href="${escapeHtml(productUrl)}">${escapeHtml(productUrl)}</a>` : '—'}
        </td>
      </tr>
    </table>
    <p style="margin-top: 20px; color: #666;">Согласие на обработку персональных данных: получено.</p>
  </body>
</html>`;

    const text = [
      'Новое обращение с формы обратной связи',
      '',
      `ФИО: ${fullName}`,
      `Телефон: ${phone}`,
      `Email: ${email}`,
      '',
      'Вопрос:',
      question,
      '',
      `Название товара: ${productName || '—'}`,
      `Ссылка на товар: ${productUrl || '—'}`,
      '',
      'Согласие на обработку персональных данных: получено.',
    ].join('\n');

    const result = await sendMail({
      to: TO_EMAIL,
      subject,
      html,
      text,
    });

    if (!result.success) {
      return NextResponse.json({ error: 'Не удалось отправить письмо' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form API error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

