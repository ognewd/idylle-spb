import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '@/lib/admin-auth';
import { getAvailablePanelModes, normalizeRoles, PanelMode } from '@/lib/panel-roles';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const secret = getJwtSecret();
    if (!secret) {
      return NextResponse.json({ error: 'Server auth is not configured' }, { status: 500 });
    }

    const token = authHeader.substring(7);
    const payload = jwt.verify(token, secret) as any;
    const body = await request.json();
    const requestedMode = body?.mode as PanelMode | undefined;

    if (!requestedMode) {
      return NextResponse.json({ error: 'Mode is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        roles: true,
        partnerId: true,
        allowedAdminSections: true,
        dealerProfile: { select: { id: true, companyName: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roles = normalizeRoles(user.role, user.roles);
    const availableModes = getAvailablePanelModes(roles);
    if (!availableModes.includes(requestedMode)) {
      return NextResponse.json({ error: 'Mode is not available for this account' }, { status: 403 });
    }

    const nextToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        roles,
        activeMode: requestedMode,
        availableModes,
        allowedAdminSections: user.allowedAdminSections || [],
        partnerId: user.partnerId || null,
        dealerProfileId: user.dealerProfile?.id || null,
        dealerCompanyName: user.dealerProfile?.companyName || null,
      },
      secret,
      { expiresIn: '24h' }
    );

    return NextResponse.json({
      token: nextToken,
      activeMode: requestedMode,
      availableModes,
    });
  } catch (error) {
    console.error('Admin mode switch error:', error);
    return NextResponse.json({ error: 'Failed to switch mode' }, { status: 500 });
  }
}

