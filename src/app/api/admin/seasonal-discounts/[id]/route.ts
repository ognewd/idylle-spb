import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

// Helper to verify admin token
const verifyAdminToken = async (request: NextRequest) => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Unauthorized', status: 401 };
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any;
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await verifyAdminToken(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const discount = await prisma.seasonalDiscount.findUnique({
      where: { id: params.id },
      include: {
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
              },
            },
          },
        },
      },
    });

    if (!discount) {
      return NextResponse.json({ error: 'Seasonal discount not found' }, { status: 404 });
    }

    return NextResponse.json(discount);
  } catch (error) {
    console.error('Get seasonal discount error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await verifyAdminToken(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const body = await request.json();
    const { name, applyTo, categoryIds, productIds, discount, startDate, endDate, isActive } = body;

    // Validation
    if (!name || !applyTo || !discount || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (applyTo !== 'categories' && applyTo !== 'products') {
      return NextResponse.json({ error: 'applyTo must be either "categories" or "products"' }, { status: 400 });
    }

    if (applyTo === 'categories' && (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0)) {
      return NextResponse.json({ error: 'categoryIds must be a non-empty array when applyTo is "categories"' }, { status: 400 });
    }

    if (applyTo === 'products' && (!productIds || !Array.isArray(productIds) || productIds.length === 0)) {
      return NextResponse.json({ error: 'productIds must be a non-empty array when applyTo is "products"' }, { status: 400 });
    }

    if (discount < 1 || discount > 100) {
      return NextResponse.json({ error: 'Discount must be between 1 and 100' }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 });
    }

    // Verify that all categories or products exist
    if (applyTo === 'categories') {
      const categories = await prisma.category.findMany({
        where: { id: { in: categoryIds } },
      });

      if (categories.length !== categoryIds.length) {
        return NextResponse.json({ error: 'One or more categories not found' }, { status: 404 });
      }

      // Check for overlapping discounts (excluding current discount)
      const overlapping = await prisma.seasonalDiscount.findFirst({
        where: {
          id: { not: params.id },
          isActive: true,
          applyTo: 'categories',
          categories: {
            some: {
              categoryId: { in: categoryIds },
            },
          },
          OR: [
            {
              AND: [
                { startDate: { lte: start } },
                { endDate: { gte: start } },
              ],
            },
            {
              AND: [
                { startDate: { lte: end } },
                { endDate: { gte: end } },
              ],
            },
            {
              AND: [
                { startDate: { gte: start } },
                { endDate: { lte: end } },
              ],
            },
          ],
        },
        include: {
          categories: {
            include: {
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      if (overlapping) {
        const overlappingCategoryNames = overlapping.categories
          .filter(c => categoryIds.includes(c.categoryId))
          .map(c => c.category.name)
          .join(', ');
        
        return NextResponse.json(
          { error: `There is already an active discount for categories (${overlappingCategoryNames}) in the selected period` },
          { status: 409 }
        );
      }
    } else {
      // Verify products exist
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
      });

      if (products.length !== productIds.length) {
        return NextResponse.json({ error: 'One or more products not found' }, { status: 404 });
      }

      // Check for overlapping discounts (excluding current discount)
      const overlapping = await prisma.seasonalDiscount.findFirst({
        where: {
          id: { not: params.id },
          isActive: true,
          applyTo: 'products',
          products: {
            some: {
              productId: { in: productIds },
            },
          },
          OR: [
            {
              AND: [
                { startDate: { lte: start } },
                { endDate: { gte: start } },
              ],
            },
            {
              AND: [
                { startDate: { lte: end } },
                { endDate: { gte: end } },
              ],
            },
            {
              AND: [
                { startDate: { gte: start } },
                { endDate: { lte: end } },
              ],
            },
          ],
        },
        include: {
          products: {
            include: {
              product: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      if (overlapping) {
        const overlappingProductNames = overlapping.products
          .filter(p => productIds.includes(p.productId))
          .map(p => p.product.name)
          .slice(0, 3)
          .join(', ');
        
        return NextResponse.json(
          { error: `There is already an active discount for products (${overlappingProductNames}${overlapping.products.length > 3 ? '...' : ''}) in the selected period` },
          { status: 409 }
        );
      }
    }

    // Update discount - delete old relations and create new ones
    const updatedDiscount = await prisma.seasonalDiscount.update({
      where: { id: params.id },
      data: {
        name,
        discount: parseInt(discount),
        startDate: start,
        endDate: end,
        isActive: isActive ?? true,
        applyTo,
        categories: {
          deleteMany: {},
          ...(applyTo === 'categories' && {
            create: categoryIds.map((categoryId: string) => ({
              categoryId,
            })),
          }),
        },
        products: {
          deleteMany: {},
          ...(applyTo === 'products' && {
            create: productIds.map((productId: string) => ({
              productId,
            })),
          }),
        },
      },
      include: {
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedDiscount);
  } catch (error) {
    console.error('Update seasonal discount error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await verifyAdminToken(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    await prisma.seasonalDiscount.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Seasonal discount deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete seasonal discount error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
