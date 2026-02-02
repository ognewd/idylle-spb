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

// GET /api/admin/email/marketing/templates - Список маркетинговых шаблонов
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = 'MARKETING'; // Только маркетинговые шаблоны

    const where: any = { type };
    if (status && status !== 'all') {
      where.status = status;
    }

    const templates = await prisma.emailTemplate.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(templates);
  } catch (error: any) {
    console.error('Error fetching marketing templates:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/email/marketing/templates - Создание нового шаблона
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminToken(request);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const body = await request.json();
    const { name, subjectDefault, designJson, status = 'draft' } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const template = await prisma.emailTemplate.create({
      data: {
        type: 'MARKETING',
        name,
        subjectDefault: subjectDefault || null,
        designJson: designJson || null,
        status,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error: any) {
    console.error('Error creating marketing template:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
