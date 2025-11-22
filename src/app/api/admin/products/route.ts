import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any;
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    } catch (jwtError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get pagination parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    const search = searchParams.get('search') || '';

    // Build where clause for search
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
        { manufacturerSku: { contains: search, mode: 'insensitive' } },
        { myWarehouseCode: { contains: search, mode: 'insensitive' } },
        { aromaDescription: { contains: search, mode: 'insensitive' } },
        { topNotes: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
        { brand: { name: { contains: search, mode: 'insensitive' } } },
        { productCategories: { some: { category: { name: { contains: search, mode: 'insensitive' } } } } },
      ];
    }

    // Get total count with search
    const total = await prisma.product.count({ where });

    const products = await prisma.product.findMany({
      where,
      skip,
      take: limit,
      include: {
        brand: true,
        productCategories: {
          include: {
            category: true,
          },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        variants: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin products error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any;
      
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
    const {
      name,
      slug,
      description,
      shortDescription,
      price,
      comparePrice,
      sku,
      volume,
      gender,
      aromaFamily,
      ingredients,
      stock,
      weight,
      dimensions,
      myWarehouseCode,
      manufacturerSku,
      productType,
      purpose,
      country,
      barcode,
      isActive,
      isFeatured,
      categoryIds,
      brandId,
      images,
      variants,
    } = body;

    // Validate required fields
    const hasVariants = variants && variants.length > 0;
    if (!name || !slug || !categoryIds || categoryIds.length === 0 || !brandId) {
      return NextResponse.json(
        { error: 'Обязательные поля: название, slug, хотя бы одна категория, бренд' },
        { status: 400 }
      );
    }

    // Validate that either variants or price is provided
    if (!hasVariants && !price) {
      return NextResponse.json(
        { error: 'Укажите цену товара или добавьте хотя бы один вариант' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: 'Товар с таким slug уже существует' },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        shortDescription,
        price: hasVariants ? 0 : parseFloat(price),
        comparePrice: hasVariants ? null : (comparePrice ? parseFloat(comparePrice) : null),
        sku: hasVariants ? null : sku,
        volume: hasVariants ? null : volume,
        gender,
        aromaFamily,
        ingredients,
        stock: hasVariants ? 0 : (parseInt(stock) || 0),
        weight: weight ? parseFloat(weight) : null,
        dimensions,
        myWarehouseCode: myWarehouseCode || null,
        manufacturerSku: manufacturerSku || null,
        productType: productType || null,
        purpose: purpose || null,
        country: country || null,
        barcode: barcode || null,
        isActive: isActive ?? true,
        isFeatured: isFeatured ?? false,
        brandId,
        productCategories: {
          create: categoryIds.map((categoryId: string, index: number) => ({
            categoryId,
            isPrimary: index === 0, // First category is primary
          })),
        },
        images: images && images.length > 0 ? {
          create: images.map((img: any, index: number) => ({
            url: img.url,
            alt: img.alt || name,
            sortOrder: index,
            isPrimary: img.isPrimary || index === 0,
          })),
        } : undefined,
        variants: hasVariants ? {
          create: variants.map((variant: any, index: number) => ({
            name: variant.name || 'Объём',
            value: variant.value,
            price: parseFloat(variant.price),
            comparePrice: variant.comparePrice ? parseFloat(variant.comparePrice) : null,
            stock: parseInt(variant.stock) || 0,
            sku: variant.sku || null,
            isDefault: variant.isDefault || index === 0,
            sortOrder: index,
          })),
        } : undefined,
      },
      include: {
        brand: true,
        productCategories: {
          include: {
            category: true,
          },
        },
        images: true,
        variants: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
