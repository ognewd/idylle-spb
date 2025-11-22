import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        brand: true,
        productCategories: {
          include: {
            category: true,
          },
        },
        images: true,
        variants: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Get product error:', error);
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
    if (!name || !slug || !brandId || !categoryIds || categoryIds.length === 0) {
      return NextResponse.json(
        { error: 'Name, slug, brand, and at least one category are required' },
        { status: 400 }
      );
    }

    const hasVariants = variants && variants.length > 0;

    // If no variants, price and stock are required
    if (!hasVariants && (!price || stock === undefined || stock === null)) {
      return NextResponse.json(
        { error: 'Price and stock are required when no variants are provided' },
        { status: 400 }
      );
    }

    // Delete existing variants and categories
    await prisma.productVariant.deleteMany({
      where: { productId: params.id },
    });

    await prisma.productCategory.deleteMany({
      where: { productId: params.id },
    });

    await prisma.productImage.deleteMany({
      where: { productId: params.id },
    });

    // Update product
    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        name,
        slug,
        description: description || null,
        shortDescription: shortDescription || null,
        price: hasVariants ? 0 : parseFloat(price),
        comparePrice: hasVariants || !comparePrice ? null : parseFloat(comparePrice),
        sku: hasVariants || !sku ? null : sku,
        volume: hasVariants || !volume ? null : volume,
        gender: gender || null,
        aromaFamily: aromaFamily || null,
        ingredients: ingredients || null,
        stock: hasVariants ? 0 : parseInt(stock),
        weight: weight ? parseFloat(weight) : null,
        dimensions: dimensions || null,
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
          create: categoryIds.map((categoryId: string) => ({
            categoryId,
          })),
        },
        images: images && images.length > 0 ? {
          create: images.map((img: any, index: number) => ({
            url: img.url,
            alt: img.alt || '',
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
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { isActive } = body;

    const product = await prisma.product.update({
      where: { id: params.id },
      data: { isActive },
      include: {
        brand: true,
        productCategories: {
          include: {
            category: true,
          },
        },
        images: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Update product error:', error);
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

    await prisma.product.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
