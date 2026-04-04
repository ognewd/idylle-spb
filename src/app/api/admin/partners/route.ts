import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const authResult = await verifyAdminToken(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const partners = await prisma.partner.findMany({
      include: {
        brands: {
          include: { brand: { select: { id: true, name: true, slug: true } } },
        },
        _count: { select: { users: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, partners });
  } catch (error: any) {
    console.error('Partners GET error:', error?.message);
    return NextResponse.json(
      { success: false, error: 'Ошибка при получении списка партнёров' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authResult = await verifyAdminToken(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const body = await request.json();
    const {
      name,
      contactPerson,
      contactEmail,
      contactPhone,
      requisites,
      officeAddress,
      warehouseAddress,
      warehouseSameAsOffice,
      brandIds,
      newBrands,
    } = body;

    if (!name || !contactPerson || !contactEmail) {
      return NextResponse.json(
        { success: false, error: 'Название, ФИО и email обязательны' },
        { status: 400 }
      );
    }

    const createdNewBrandIds: string[] = [];
    if (newBrands && Array.isArray(newBrands)) {
      for (const brandName of newBrands) {
        if (!brandName.trim()) continue;
        const slug = brandName
          .trim()
          .toLowerCase()
          .replace(/[^a-zа-яё0-9\s-]/gi, '')
          .replace(/\s+/g, '-');

        const existing = await prisma.brand.findUnique({ where: { slug } });
        if (existing) {
          createdNewBrandIds.push(existing.id);
        } else {
          const brand = await prisma.brand.create({
            data: { name: brandName.trim(), slug, isActive: true },
          });
          createdNewBrandIds.push(brand.id);
        }
      }
    }

    const allBrandIds = [...(brandIds || []), ...createdNewBrandIds];

    const partner = await prisma.partner.create({
      data: {
        name,
        contactPerson,
        contactEmail,
        contactPhone: contactPhone || null,
        requisites: requisites || null,
        officeAddress: officeAddress || null,
        warehouseAddress: warehouseSameAsOffice ? officeAddress || null : warehouseAddress || null,
        warehouseSameAsOffice: !!warehouseSameAsOffice,
        brands: {
          create: allBrandIds.map((brandId: string) => ({ brandId })),
        },
      },
      include: {
        brands: {
          include: { brand: { select: { id: true, name: true } } },
        },
      },
    });

    return NextResponse.json({ success: true, partner });
  } catch (error: any) {
    console.error('Partners POST error:', error?.message);
    return NextResponse.json(
      { success: false, error: 'Ошибка при создании партнёра' },
      { status: 500 }
    );
  }
}
