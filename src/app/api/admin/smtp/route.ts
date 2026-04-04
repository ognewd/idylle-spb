import { NextRequest, NextResponse } from 'next/server';
import {
  testSMTPConnection,
  testPartnerSMTPConnection,
  sendMail,
  sendPartnerMail,
} from '@/lib/mail';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '@/lib/admin-auth';

const ORDER_KEYS = ['HOST', 'PORT', 'USER', 'PASS', 'FROM'] as const;
const ORDER_PREFIX = 'SMTP_';
const PARTNER_PREFIX = 'PARTNER_SMTP_';

function verifyAdminToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return null;
  }
  const secret = getJwtSecret();
  if (!secret) return null;
  try {
    const decoded = jwt.verify(token, secret) as any;
    if (decoded.role !== 'admin' && decoded.role !== 'super_admin') {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

async function loadSmtpSection(prefix: string) {
  const rows = await prisma.settings.findMany({
    where: { key: { startsWith: prefix } },
  });
  const settings: Record<string, string> = {};
  for (const row of rows) {
    const k = row.key.slice(prefix.length).toLowerCase();
    settings[k] = row.value;
  }
  return { settings, rowCount: rows.length };
}

function applyEnvFallbackOrder(s: Record<string, string>) {
  if (Object.keys(s).length === 0) {
    return {
      host: process.env.SMTP_HOST || '',
      port: process.env.SMTP_PORT || '',
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS ? '******' : '',
      from: process.env.SMTP_FROM || '',
    };
  }
  return {
    host: s.host || '',
    port: s.port || '',
    user: s.user || '',
    pass: s.pass ? '******' : '',
    from: s.from || '',
  };
}

function applyEnvFallbackPartner(s: Record<string, string>) {
  if (Object.keys(s).length === 0) {
    return {
      host: process.env.PARTNER_SMTP_HOST || '',
      port: process.env.PARTNER_SMTP_PORT || '',
      user: process.env.PARTNER_SMTP_USER || '',
      pass: process.env.PARTNER_SMTP_PASS ? '******' : '',
      from: process.env.PARTNER_SMTP_FROM || '',
    };
  }
  return {
    host: s.host || '',
    port: s.port || '',
    user: s.user || '',
    pass: s.pass ? '******' : '',
    from: s.from || '',
  };
}

export async function GET(request: NextRequest) {
  try {
    const admin = verifyAdminToken(request);

    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const orderData = await loadSmtpSection(ORDER_PREFIX);
    const partnerData = await loadSmtpSection(PARTNER_PREFIX);

    const order = applyEnvFallbackOrder(orderData.settings);
    const partner = applyEnvFallbackPartner(partnerData.settings);

    return NextResponse.json({
      success: true,
      order,
      partner,
      // обратная совместимость со старой страницей
      settings: order,
      isFromEnv: orderData.rowCount === 0,
      partnerIsFromEnv: partnerData.rowCount === 0,
    });
  } catch (error) {
    console.error('Error getting SMTP settings:', error);
    return NextResponse.json(
      { success: false, error: 'Error getting SMTP settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = verifyAdminToken(request);

    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, to, settings, channel } = body as {
      action: string;
      to?: string;
      settings?: Record<string, string>;
      channel?: 'order' | 'partner';
    };

    const smtpChannel = channel === 'partner' ? 'partner' : 'order';
    const prefix = smtpChannel === 'partner' ? PARTNER_PREFIX : ORDER_PREFIX;

    if (action === 'save-settings') {
      if (!settings) {
        return NextResponse.json({ success: false, error: 'Settings are required' }, { status: 400 });
      }

      const passVal = settings.pass ?? '';
      const skipPassUpdate = passVal === '******' || passVal === '';

      for (const field of ORDER_KEYS) {
        const key = `${prefix}${field}`;
        if (field === 'PASS' && skipPassUpdate) {
          continue;
        }
        const value =
          field === 'HOST'
            ? settings.host || ''
            : field === 'PORT'
              ? settings.port || ''
              : field === 'USER'
                ? settings.user || ''
                : field === 'PASS'
                  ? settings.pass || ''
                  : settings.from || '';

        await prisma.settings.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        });
      }

      return NextResponse.json({ success: true, message: 'Settings saved successfully' });
    }

    if (action === 'test') {
      const result =
        smtpChannel === 'partner' ? await testPartnerSMTPConnection() : await testSMTPConnection();
      return NextResponse.json(result);
    }

    if (action === 'send-test') {
      const html =
        smtpChannel === 'partner'
          ? `<h1>Тест: партнёрский SMTP</h1><p>Если письмо пришло, настройки «Коммуникация с партнёрами» работают.</p>`
          : `<h1>Test Email</h1><p>This is a test email from Idylle SMTP configuration.</p><p>If you received this email, SMTP is working correctly!</p>`;

      const result =
        smtpChannel === 'partner'
          ? await sendPartnerMail({
              to: to || '',
              subject: 'Тест: SMTP для партнёров',
              html,
            })
          : await sendMail({
              to: to || process.env.SMTP_USER || '',
              subject: 'Test Email from Idylle',
              html,
            });
      return NextResponse.json(result);
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error with SMTP action:', error);
    return NextResponse.json(
      { success: false, error: 'Error executing SMTP action' },
      { status: 500 }
    );
  }
}
