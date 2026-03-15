import { NextRequest, NextResponse } from 'next/server';
import { sendMail } from '@/lib/mail';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const toEmail = typeof body.toEmail === 'string' ? body.toEmail.trim() : '';
    const toName = typeof body.toName === 'string' ? body.toName.trim() : '';
    const fromName = typeof body.fromName === 'string' ? body.fromName.trim() : '';
    const productUrl = typeof body.productUrl === 'string' ? body.productUrl.trim() : '';
    const productName = typeof body.productName === 'string' ? body.productName.trim() : '';

    if (!toEmail) {
      return NextResponse.json(
        { error: 'Укажите email получателя' },
        { status: 400 }
      );
    }
    if (!fromName) {
      return NextResponse.json(
        { error: 'Укажите, от кого письмо' },
        { status: 400 }
      );
    }

    const greeting = toName ? `Здравствуйте, ${escapeHtml(toName)}!` : 'Здравствуйте!';
    const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 560px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #f43f5e 0%, #f97316 100%); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
    <p style="color: #fff; font-size: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin: 0;">
      Вот бы кто-то подарил...
    </p>
    <p style="color: rgba(255,255,255,0.95); font-size: 14px; margin: 12px 0 0 0;">${escapeHtml(productName)}</p>
  </div>
  <p style="margin-bottom: 16px;">${greeting}</p>
  <p style="margin-bottom: 16px;">${escapeHtml(fromName)} намекает вам на подарок мечты.</p>
  <p style="margin-bottom: 24px;">
    <a href="${escapeHtml(productUrl)}" style="display: inline-block; background: #1a1a1a; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">Посмотреть товар</a>
  </p>
  <p style="font-size: 13px; color: #666;">С уважением,<br/>Aroma Russia</p>
</body>
</html>`;

    const text = `Вот бы кто-то подарил...\n\n${productName}\n\n${fromName} намекает вам на подарок. Ссылка: ${productUrl}`;

    const result = await sendMail({
      to: toEmail,
      subject: `Вот бы кто-то подарил: ${productName}`,
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
    console.error('Gift hint API error:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}
