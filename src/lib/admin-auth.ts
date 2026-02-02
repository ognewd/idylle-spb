import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

/** Секрет для JWT администратора. Без него админ-авторизация не работает (безопасность). */
export function getJwtSecret(): string | undefined {
  return process.env.NEXTAUTH_SECRET;
}

export async function verifyAdminToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Unauthorized', status: 401 };
  }

  const secret = getJwtSecret();
  if (!secret) {
    return { error: 'Unauthorized', status: 500 };
  }

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
}

