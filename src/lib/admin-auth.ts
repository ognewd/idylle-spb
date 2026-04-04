import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export function getJwtSecret(): string | undefined {
  return process.env.NEXTAUTH_SECRET;
}

const ADMIN_ROLES = ['admin', 'super_admin'];
const ALL_PANEL_ROLES = ['admin', 'super_admin', 'partner'];

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

    if (!user || !ADMIN_ROLES.includes(user.role)) {
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

    if (!user || !ALL_PANEL_ROLES.includes(user.role)) {
      return { error: 'Unauthorized' as const, status: 401 };
    }

    const allowedBrandIds = user.partner?.brands.map((b) => b.brandId) ?? null;

    return { user, isPartner: user.role === 'partner', allowedBrandIds };
  } catch {
    return { error: 'Invalid token' as const, status: 401 };
  }
}
