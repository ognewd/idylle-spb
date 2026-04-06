import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { normalizeRoles } from '@/lib/panel-roles';

export function getJwtSecret(): string | undefined {
  return process.env.NEXTAUTH_SECRET;
}

const ADMIN_ROLES = ['admin', 'super_admin'];
const ALL_PANEL_ROLES = ['admin', 'super_admin', 'partner', 'dealer'];

export async function verifyAdminToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Unauthorized' as const, status: 401 };
  }

  const secret = getJwtSecret();
  if (!secret) {
    return { error: 'Unauthorized' as const, status: 500 };
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, secret) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    const userRoles = normalizeRoles(user?.role, user?.roles);
    if (!user || !userRoles.some((r) => ADMIN_ROLES.includes(r))) {
      return { error: 'Unauthorized' as const, status: 401 };
    }
    return { user };
  } catch {
    return { error: 'Invalid token' as const, status: 401 };
  }
}

/**
 * Verifies token for any panel user (admin, super_admin, or partner).
 * Returns user with partnerId and allowed brand IDs for partners.
 */
export async function verifyPanelToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Unauthorized' as const, status: 401 };
  }

  const secret = getJwtSecret();
  if (!secret) {
    return { error: 'Unauthorized' as const, status: 500 };
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, secret) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        dealerProfile: true,
        partner: {
          include: {
            brands: {
              include: {
                brand: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });

    const userRoles = normalizeRoles(user?.role, user?.roles);
    if (!user || !userRoles.some((r) => ALL_PANEL_ROLES.includes(r))) {
      return { error: 'Unauthorized' as const, status: 401 };
    }

    const allowedBrandIds = user.partner?.brands.map((b) => b.brandId) ?? null;

    const decodedAny = decoded as any;
    const activeMode: 'admin' | 'partner' | 'dealer' | null = decodedAny.activeMode || null;

    return {
      user,
      roles: userRoles,
      activeMode,
      isPartner: activeMode ? activeMode === 'partner' : userRoles.includes('partner'),
      isDealer: activeMode ? activeMode === 'dealer' : userRoles.includes('dealer'),
      allowedBrandIds,
      dealerProfileId: user.dealerProfile?.id || null,
    };
  } catch {
    return { error: 'Invalid token' as const, status: 401 };
  }
}
