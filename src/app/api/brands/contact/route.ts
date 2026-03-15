import { NextRequest, NextResponse } from 'next/server';
import { sendMail } from '@/lib/mail';
import { prisma } from '@/lib/prisma';

const TO_EMAIL = 'Office@aromarussia.ru';

const DEFAULT_SUBJECT = 'Заявка на сотрудничество: {{email}}';
const DEFAULT_HTML = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a;">
  <h2 style="margin-bottom: 20px;">Новая заявка на сотрудничество</h2>
  <p style="color: #666; font-size: 14px; margin-bottom: 20px;">Заполнена форма «Свяжитесь с нами для обсуждения сотрудничества» (страница «Бренды»).</p>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666; width: 180px;">Электронная почта</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #eee;">{{email}}</td>
    </tr>
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Телефон</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #eee;">{{phone}}</td>
    </tr>
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666; vertical-align: top;">Сообщение</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #eee; white-space: pre-wrap;">{{message}}</td>
    </tr>
  </table>
  <p style="margin-top: 24px; color: #666; font-size: 13px;">Согласие на обработку персональных данных получено. Ответьте на указанный email или позвоните по телефону.</p>
</body>
</html>`;

function applyTemplate(tpl: string, vars: Record<string, string>): string {
  let out = tpl;
  for (const [key, value] of Object.entries(vars)) {
    out = out.split(`{{${key}}}`).join(value);
  }
  return out;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const message = typeof body.message === 'string' ? body.message.trim() : '';

    if (!email || !phone) {
      return NextResponse.json(
        { error: 'Укажите email и телефон' },
        { status: 400 }
      );
    }

    const [subjectRow, htmlRow] = await Promise.all([
      prisma.settings.findUnique({ where: { key: 'EMAIL_TEMPLATE_brand_cooperation_subject' } }),
      prisma.settings.findUnique({ where: { key: 'EMAIL_TEMPLATE_brand_cooperation_html' } }),
    ]);

    const subjectTpl = subjectRow?.value || DEFAULT_SUBJECT;
    const htmlTpl = htmlRow?.value || DEFAULT_HTML;

    const vars: Record<string, string> = {
      email: escapeHtml(email),
      phone: escapeHtml(phone),
      message: escapeHtml(message) || '— не указано',
    };

    const subject = applyTemplate(subjectTpl, { email, phone, message });
    const html = applyTemplate(htmlTpl, vars);

    const result = await sendMail({
      to: TO_EMAIL,
      subject,
      html,
      text: `Email: ${email}\nТелефон: ${phone}\n\nЗапрос:\n${message || '— не указано'}`,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Не удалось отправить письмо' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Brand contact API error:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
