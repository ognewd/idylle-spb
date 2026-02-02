import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { getJwtSecret } from '@/lib/admin-auth';
import { renderMarketingEmail } from '@/lib/email-marketing-renderer';

// Helper to verify admin token
const verifyAdminToken = async (request: NextRequest) => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Unauthorized', status: 401 };
  }

  const secret = getJwtSecret();
  if (!secret) return { error: 'Unauthorized', status: 500 };
  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, secret) as any;
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

// POST /api/admin/email/marketing/templates/[id]/preview - Предпросмотр шаблона
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAdminToken(request);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
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

    const body = await request.json();
    const { designJson } = body;

    // Используем переданный designJson или из шаблона
    const design = designJson || template.designJson;

    if (!design) {
      return NextResponse.json(
        { error: 'No design data provided' },
        { status: 400 }
      );
    }

    // Рендерим HTML
    const html = await renderMarketingEmail(design);

    return NextResponse.json({ html });
  } catch (error: any) {
    console.error('Error rendering preview:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
