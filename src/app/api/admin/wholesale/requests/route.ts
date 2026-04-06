import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const authResult = await verifyAdminToken(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const requests = await prisma.dealerRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, requests });
  } catch (error) {
    console.error('Wholesale requests GET error:', error);
    return NextResponse.json({ success: false, error: 'Не удалось получить заявки дилеров' }, { status: 500 });
  }
}

