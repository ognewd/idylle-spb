import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

function verifyAdminToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any;
    return decoded;
  } catch {
    return null;
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: admin.userId },
    });

    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Подсчитываем количество товаров перед удалением
    const totalProducts = await prisma.product.count();

    // Удаляем все товары (каскадное удаление удалит связанные записи)
    // Сначала удаляем связи, чтобы избежать проблем с foreign key
    await prisma.productCategory.deleteMany({});
    await prisma.productImage.deleteMany({});
    await prisma.productVariant.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.wishlistItem.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.seasonalDiscountProduct.deleteMany({});
    
    // Затем удаляем сами товары
    await prisma.product.deleteMany({});

    return NextResponse.json({
      success: true,
      deleted: totalProducts,
      message: `Удалено товаров: ${totalProducts}`,
    });
  } catch (error: any) {
    console.error('Delete all products error:', error);
    return NextResponse.json(
      { error: error.message || 'Ошибка при удалении товаров' },
      { status: 500 }
    );
  }
}


