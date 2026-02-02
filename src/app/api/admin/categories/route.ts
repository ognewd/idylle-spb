import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { getJwtSecret } from '@/lib/admin-auth';

// GET all categories
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, getJwtSecret()) as any;
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    } catch (jwtError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    try {
      const categories = await prisma.category.findMany({
        include: {
          _count: {
            select: {
              productCategories: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });

      // Если поле pageContent не существует в БД, добавляем null для всех категорий
      const categoriesWithPageContent = categories.map(cat => ({
        ...cat,
        pageContent: (cat as any).pageContent || null,
      }));

      return NextResponse.json(categoriesWithPageContent);
    } catch (dbError: any) {
      // Если ошибка связана с отсутствующим полем pageContent, пробуем загрузить без него
      if (dbError.message?.includes('pageContent') || dbError.code === 'P2009') {
        console.warn('pageContent field not found in database, loading without it');
        const categories = await prisma.$queryRaw`
          SELECT 
            id, name, slug, description, "parentId", image, "sortOrder", "isActive", 
            "createdAt", "updatedAt"
          FROM categories
          ORDER BY name ASC
        ` as any[];
        
        // Добавляем _count и pageContent: null
        const categoriesWithCount = await Promise.all(
          categories.map(async (cat) => {
            const count = await prisma.productCategory.count({
              where: { categoryId: cat.id },
            });
            return {
              ...cat,
              pageContent: null,
              _count: {
                productCategories: count,
              },
            };
          })
        );
        
        return NextResponse.json(categoriesWithCount);
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Categories API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Error details:', { errorMessage, errorStack });
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const secret = getJwtSecret();
    if (!secret) return NextResponse.json({ error: 'Unauthorized' }, { status: 500 });
    try {
      const decoded = jwt.verify(token, secret) as any;

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    } catch (jwtError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, description, pageContent, isActive } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this slug already exists' },
        { status: 400 }
      );
    }

    // Prepare data object
    const createData: any = {
      name,
      slug,
      description: description ? description.trim() : null,
      isActive: isActive ?? true,
    };

    // Handle pageContent - treat empty string as null
    if (pageContent !== undefined && pageContent !== null) {
      const trimmedContent = typeof pageContent === 'string' ? pageContent.trim() : '';
      createData.pageContent = trimmedContent || null;
    } else {
      createData.pageContent = null;
    }

    const category = await prisma.category.create({
      data: createData,
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
