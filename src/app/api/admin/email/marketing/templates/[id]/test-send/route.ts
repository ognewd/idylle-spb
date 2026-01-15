import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { sendTestMarketingEmail } from '@/lib/email-marketing-renderer';

// Helper to verify admin token
const verifyAdminToken = async (request: NextRequest) => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Unauthorized', status: 401 };
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return { error: 'Unauthorized', status: 401 };
    }
    return { user };
  } catch (jwtError) {
    return { error: 'Invalid token', status: 401 };
  }
};

// POST /api/admin/email/marketing/templates/[id]/test-send - Отправить тестовое письмо
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAdminToken(request);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const body = await request.json();
    const { email, subject, designJson } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const template = await prisma.emailTemplate.findUnique({
      where: {
        id: params.id,
        type: 'MARKETING',
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Используем переданный designJson или из шаблона
    const design = designJson || template.designJson;

    if (!design) {
      return NextResponse.json(
        { error: 'No design data provided' },
        { status: 400 }
      );
    }

    // Отправляем тестовое письмо
    await sendTestMarketingEmail({
      to: email,
      subject: subject || template.subjectDefault || 'Тестовое письмо',
      designJson: design,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
