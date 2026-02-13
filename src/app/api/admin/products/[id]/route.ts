import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '@/lib/admin-auth';

// GET /api/admin/products/[id] - Получить товар по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Поддержка как синхронных, так и асинхронных params (Next.js 15+)
    const resolvedParams = await Promise.resolve(params);
    const productId = resolvedParams.id;

    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const secret = getJwtSecret();
    if (!secret) return NextResponse.json({ error: 'Unauthorized' }, { status: 500 });
    try {
      const decoded = jwt.verify(token, secret) as any;

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        return NextResponse.json({ error: 'Unauthorized: User not found' }, { status: 401 });
      }

      if (user.role !== 'admin' && user.role !== 'super_admin') {
        return NextResponse.json({ error: 'Unauthorized: Insufficient permissions' }, { status: 401 });
      }
    } catch (jwtError: any) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        brand: true,
        productCategories: {
          include: {
            category: true,
          },
        },
        images: {
          orderBy: [
            { isPrimary: 'desc' },
            { sortOrder: 'asc' },
          ],
        },
        variants: {
          orderBy: [
            { isDefault: 'desc' },
            { sortOrder: 'asc' },
          ],
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error: any) {
    console.error('Product GET error:', error?.message ?? 'Unknown');
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/admin/products/[id] - Обновить товар
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Поддержка как синхронных, так и асинхронных params (Next.js 15+)
    const resolvedParams = await Promise.resolve(params);
    const productId = resolvedParams.id;
    
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
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
    const {
      name,
      shortName,
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
      topNotes,
      purpose,
      usageInstructions,
      brandCountry,
      manufactureCountry,
      warehouseLocation,
      barcode,
      isActive,
      isFeatured,
      categoryIds,
      brandId,
      images,
      variants,
    } = body;

    // Проверяем, изменился ли slug и уникален ли он
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      select: { slug: true },
    });

    let finalSlug = slug;
    if (existingProduct && slug !== existingProduct.slug) {
      // Slug изменился - проверяем уникальность
      const slugExists = await prisma.product.findUnique({
        where: { slug },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: 'Товар с таким slug уже существует' },
          { status: 400 }
        );
      }
    } else if (slug && slug !== existingProduct?.slug) {
      // Slug не был в существующем товаре, но новый передан - проверяем уникальность
      const slugExists = await prisma.product.findUnique({
        where: { slug },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: 'Товар с таким slug уже существует' },
          { status: 400 }
        );
      }
    }

    // Обновляем товар
    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        shortName: shortName || null,
        slug: finalSlug || existingProduct?.slug, // Используем существующий slug, если новый не передан
        description: description || null,
        shortDescription: shortDescription || null,
        price: parseFloat(price) || 0,
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        sku: sku || null,
        volume: volume || null,
        gender: gender || null,
        aromaFamily: aromaFamily || null,
        ingredients: ingredients || null,
        stock: parseInt(stock) || 0,
        weight: weight ? parseFloat(weight) : null,
        dimensions: dimensions || null,
        myWarehouseCode: myWarehouseCode || null,
        manufacturerSku: manufacturerSku || null,
        productType: productType || null,
        topNotes: topNotes || null,
        purpose: purpose || null,
        usageInstructions: usageInstructions || null,
        brandCountry: brandCountry || null,
        manufactureCountry: manufactureCountry || null,
        warehouseLocation: warehouseLocation || null,
        barcode: barcode || null,
        isActive: isActive ?? true,
        isFeatured: isFeatured ?? false,
        brandId,
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

    // Обновляем категории
    if (categoryIds && Array.isArray(categoryIds)) {
      await prisma.productCategory.deleteMany({
        where: { productId: productId },
      });
      
      await prisma.productCategory.createMany({
        data: categoryIds.map((categoryId: string, index: number) => ({
          productId: productId,
          categoryId,
          isPrimary: index === 0,
        })),
      });
    }

    // Обновляем изображения
    if (images && Array.isArray(images)) {
      // Проверяем, есть ли хотя бы одно изображение с isPrimary: true
      const hasPrimary = images.some((img: any) => img.isPrimary === true);
      
      await prisma.productImage.deleteMany({
        where: { productId: productId },
      });
      
      await prisma.productImage.createMany({
        data: images.map((img: any, index: number) => ({
          productId: productId,
          url: img.url,
          alt: img.alt || name,
          sortOrder: index,
          // Если ни одно изображение не помечено как основное, делаем первое основным
          // Иначе используем значение из img.isPrimary (строго boolean)
          isPrimary: hasPrimary ? (img.isPrimary === true) : (index === 0),
        })),
      });
    }

    // Обновляем варианты
    if (variants && Array.isArray(variants)) {
      await prisma.productVariant.deleteMany({
        where: { productId: productId },
      });
      
      await prisma.productVariant.createMany({
        data: variants.map((variant: any, index: number) => ({
          productId: productId,
          name: variant.name || 'Объём',
          value: variant.value,
          price: parseFloat(variant.price),
          comparePrice: variant.comparePrice ? parseFloat(variant.comparePrice) : null,
          stock: parseInt(variant.stock) || 0,
          sku: variant.sku || null,
          isDefault: variant.isDefault || index === 0,
          sortOrder: index,
        })),
      });
    }

    return NextResponse.json(product);
  } catch (error: any) {
    console.error('Product PATCH error:', error instanceof Error ? error.message : 'Unknown');
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
