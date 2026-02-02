import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { getJwtSecret } from '@/lib/admin-auth';

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

// GET /api/admin/email/marketing/templates/[id] - Получить шаблон
export async function GET(
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
        type: 'MARKETING', // Только маркетинговые шаблоны
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(template);
  } catch (error: any) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/email/marketing/templates/[id] - Обновить шаблон
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAdminToken(request);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const body = await request.json();
    const { name, subjectDefault, designJson, html, status } = body;

    const template = await prisma.emailTemplate.update({
      where: {
        id: params.id,
        type: 'MARKETING',
      },
      data: {
        ...(name !== undefined && { name }),
        ...(subjectDefault !== undefined && { subjectDefault }),
        ...(designJson !== undefined && { designJson }),
        ...(html !== undefined && { html }),
        ...(status !== undefined && { status }),
      },
    });

    return NextResponse.json(template);
  } catch (error: any) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/email/marketing/templates/[id] - Удалить шаблон
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAdminToken(request);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    // Проверяем, используется ли шаблон в кампаниях
    const campaignsCount = await prisma.emailCampaign.count({
      where: { templateId: params.id },
    });

    if (campaignsCount > 0) {
      // Вместо удаления архивируем
      const template = await prisma.emailTemplate.update({
        where: {
          id: params.id,
          type: 'MARKETING',
        },
        data: { status: 'archived' },
      });
      return NextResponse.json(template);
    }

    await prisma.emailTemplate.delete({
      where: {
        id: params.id,
        type: 'MARKETING',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
