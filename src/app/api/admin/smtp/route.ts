import { NextRequest, NextResponse } from 'next/server';
import { testSMTPConnection, sendMail } from '@/lib/mail';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

function verifyAdminToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any;
    if (decoded.role !== 'admin' && decoded.role !== 'super_admin') {
      return null;
    }
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const admin = verifyAdminToken(request);

    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Try to get settings from database
    const smtpSettings = await prisma.settings.findMany({
      where: {
        key: {
          startsWith: 'SMTP_',
        },
      },
    });

    // Convert to object
    const settings: any = {};
    smtpSettings.forEach(setting => {
      const key = setting.key.replace('SMTP_', '').toLowerCase();
      settings[key] = setting.value;
    });

    // If no database settings, fall back to env
    if (Object.keys(settings).length === 0) {
      settings.host = process.env.SMTP_HOST || '';
      settings.port = process.env.SMTP_PORT || '';
      settings.user = process.env.SMTP_USER || '';
      settings.pass = process.env.SMTP_PASS ? '******' : '';
      settings.from = process.env.SMTP_FROM || '';
    } else {
      // Mask password if it exists
      if (settings.pass) {
        settings.pass = '******';
      }
    }

    return NextResponse.json({ success: true, settings, isFromEnv: Object.keys(smtpSettings).length === 0 });
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
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, to, settings } = body;

    if (action === 'save-settings') {
      // Save SMTP settings to database
      if (!settings) {
        return NextResponse.json(
          { success: false, error: 'Settings are required' },
          { status: 400 }
        );
      }

      // Save each setting
      const settingsToSave = [
        { key: 'SMTP_HOST', value: settings.host || '' },
        { key: 'SMTP_PORT', value: settings.port || '' },
        { key: 'SMTP_USER', value: settings.user || '' },
        { key: 'SMTP_PASS', value: settings.pass || '' },
        { key: 'SMTP_FROM', value: settings.from || '' },
      ];

      for (const setting of settingsToSave) {
        await prisma.settings.upsert({
          where: { key: setting.key },
          update: { value: setting.value },
          create: setting,
        });
      }

      return NextResponse.json({ success: true, message: 'Settings saved successfully' });
    }

    if (action === 'test') {
      // Test SMTP connection
      const result = await testSMTPConnection();
      return NextResponse.json(result);
    }

    if (action === 'send-test') {
      // Send test email
      const result = await sendMail({
        to: to || process.env.SMTP_USER || '',
        subject: 'Test Email from Idylle',
        html: `
          <h1>Test Email</h1>
          <p>This is a test email from Idylle SMTP configuration.</p>
          <p>If you received this email, SMTP is working correctly!</p>
        `,
      });
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error with SMTP action:', error);
    return NextResponse.json(
      { success: false, error: 'Error executing SMTP action' },
      { status: 500 }
    );
  }
}
