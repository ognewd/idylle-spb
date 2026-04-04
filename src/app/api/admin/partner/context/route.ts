import { NextRequest, NextResponse } from 'next/server';
import { verifyPanelToken } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const authResult = await verifyPanelToken(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { user, isPartner } = authResult;
  if (!user || !isPartner || !user.partnerId) {
    return NextResponse.json({ error: 'Доступ только для партнёра' }, { status: 403 });
  }

  const partner = user.partner;
  if (!partner) {
    return NextResponse.json(
      { error: 'Профиль партнёра не найден' },
      { status: 404 }
    );
  }

  const brands = partner.brands
    .map((pb) => pb.brand)
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name, 'ru'));

  return NextResponse.json({
    partnerName: partner.name,
    brands: brands.map((b) => ({ id: b.id, name: b.name })),
  });
}
