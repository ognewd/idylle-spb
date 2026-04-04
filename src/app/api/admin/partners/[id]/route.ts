import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/admin-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await verifyAdminToken(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  try {
    const partner = await prisma.partner.findUnique({
      where: { id: params.id },
      include: {
        brands: {
          include: { brand: { select: { id: true, name: true, slug: true } } },
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
    });

    if (!partner) {
      return NextResponse.json({ success: false, error: 'Партнёр не найден' }, { status: 404 });
    }

    return NextResponse.json({ success: true, partner });
  } catch (error: any) {
    console.error('Partner GET error:', error?.message);
    return NextResponse.json(
      { success: false, error: 'Ошибка при получении партнёра' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      isActive,
    } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (contactPerson !== undefined) updateData.contactPerson = contactPerson;
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail;
    if (contactPhone !== undefined) updateData.contactPhone = contactPhone;
    if (requisites !== undefined) updateData.requisites = requisites;
    if (officeAddress !== undefined) updateData.officeAddress = officeAddress;
    if (warehouseSameAsOffice !== undefined) updateData.warehouseSameAsOffice = warehouseSameAsOffice;
    if (warehouseAddress !== undefined) {
      updateData.warehouseAddress = warehouseSameAsOffice ? (officeAddress ?? updateData.officeAddress) : warehouseAddress;
    }
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    const createdNewBrandIds: string[] = [];
    if (newBrands && Array.isArray(newBrands)) {
      for (const brandName of newBrands) {
        if (!brandName.trim()) continue;
        const slug = brandName.trim().toLowerCase().replace(/[^a-zа-яё0-9\s-]/gi, '').replace(/\s+/g, '-');
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

    if (brandIds !== undefined || createdNewBrandIds.length > 0) {
      const allBrandIds = [...(brandIds || []), ...createdNewBrandIds];
      await prisma.partnerBrand.deleteMany({ where: { partnerId: params.id } });
      if (allBrandIds.length > 0) {
        await prisma.partnerBrand.createMany({
          data: allBrandIds.map((brandId: string) => ({ partnerId: params.id, brandId })),
        });
      }
    }

    const partner = await prisma.partner.update({
      where: { id: params.id },
      data: updateData,
      include: {
        brands: {
          include: { brand: { select: { id: true, name: true } } },
        },
        users: {
          select: { id: true, name: true, email: true, isActive: true },
        },
      },
    });

    return NextResponse.json({ success: true, partner });
  } catch (error: any) {
    console.error('Partner PATCH error:', error?.message);
    return NextResponse.json(
      { success: false, error: 'Ошибка при обновлении партнёра' },
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
    await prisma.user.updateMany({
      where: { partnerId: params.id },
      data: { partnerId: null, role: 'user', isActive: false },
    });

    await prisma.partner.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true, message: 'Партнёр удалён' });
  } catch (error: any) {
    console.error('Partner DELETE error:', error?.message);
    return NextResponse.json(
      { success: false, error: 'Ошибка при удалении партнёра' },
      { status: 500 }
    );
  }
}
