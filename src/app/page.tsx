import { HeroSection } from '@/components/home/HeroSection';
import { getImageUrl } from '@/lib/image-url';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import type { CategoryItem } from '@/components/home/CategoriesSection';
import { ProductGallery } from '@/components/home/ProductGallery';
import type { GalleryProduct } from '@/components/home/ProductGallery';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

// Изображения для секции категорий по slug (подпись и картинка должны совпадать)
const CATEGORY_IMAGES_BY_SLUG: Record<string, string> = {
  'aromaty-dlya-doma': '/images/categories/aromaty-dlya-doma.jpg',
  'vannaya-komnata': '/images/categories/vannaya-komnata.jpg',
  'podarki': '/images/categories/podarki.jpg',
};
const DEFAULT_CATEGORY_IMAGE = '/images/categories/vannaya-komnata.jpg';

async function getFeaturedProducts(limit: number) {
  try {
    // Сначала пытаемся найти featured товары
    let products = await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      orderBy: [{ createdAt: 'desc' }],
      take: limit,
      include: {
        brand: true,
        productCategories: { include: { category: true } },
        images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
      },
    });
    
    // Если featured товаров недостаточно, добавляем обычные активные
    if (products.length < limit) {
      const additional = await prisma.product.findMany({
        where: { 
          isActive: true, 
          isFeatured: false,
          id: { notIn: products.map(p => p.id) },
        },
        orderBy: [{ createdAt: 'desc' }],
        take: limit - products.length,
        include: {
          brand: true,
          productCategories: { include: { category: true } },
          images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
        },
      });
      products = [...products, ...additional];
    }
    
    console.log(`[HomePage] Found ${products.length} products (${products.filter(p => p.isFeatured).length} featured)`);
    return products.map((p) => ({
      id: p.id,
      name: p.name,
      shortName: p.shortName,
      slug: p.slug,
      price: Number(p.price),
      image: p.images?.[0]?.url || '/placeholder-product.jpg',
      brandName: p.brand?.name,
      category: p.productCategories?.[0]?.category?.name,
      isFeatured: p.isFeatured,
    }));
  } catch (error) {
    console.error('[HomePage] Error fetching featured products:', error);
    return [];
  }
}

async function getCategories(limit = 6) {
  try {
    const featuredSlugs = ['aromaty-dlya-doma', 'vannaya-komnata', 'podarki'];
    const all = await prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true, slug: true, description: true, image: true },
    });
    const featured = featuredSlugs.map((slug) => all.find((c) => c.slug === slug)).filter(Boolean) as typeof all;
    const remaining = all.filter((c) => !featuredSlugs.includes(c.slug)).slice(0, limit - featured.length);
    return [...featured, ...remaining].slice(0, limit);
  } catch {
    return [];
  }
}

// Главная страница должна рендериться динамически при запросе, а не статически во время сборки
// чтобы использовать правильный DATABASE_URL из ecosystem.config.cjs (PM2)
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [galleryProducts, categories] = await Promise.all([
    getFeaturedProducts(6),
    getCategories(3),
  ]);

  // Получаем origin из headers для правильного формирования URL изображений
  const headersList = await headers();
  const host = headersList.get('x-forwarded-host') || headersList.get('host') || 'aromarussia.ru';
  // Определяем протокол: для localhost используем http, иначе берем из заголовка или используем https
  const protocol = host.includes('localhost') || host.includes('127.0.0.1')
    ? 'http'
    : (headersList.get('x-forwarded-proto') || 'https');
  const baseUrl = `${protocol}://${host}`;

  const galleryItems: GalleryProduct[] = galleryProducts.map((p: { id: string; name: string; shortName?: string | null; slug: string; price: number; image: string; category?: string; isFeatured?: boolean }) => ({
    id: p.id,
    name: p.name,
    shortName: p.shortName,
    slug: p.slug,
    price: p.price,
    image: getImageUrl(p.image, { baseUrl }),
    category: p.category,
    isFeatured: p.isFeatured,
  }));

  const heroProducts = galleryItems.map((item, index) => ({
    id: item.id,
    name: item.name,
    shortName: item.shortName,
    slug: item.slug,
    price: item.price,
    image: item.image, // уже обработано через getImageUrl выше
    brandName: galleryProducts[index]?.brandName,
    category: item.category,
    badge: item.isFeatured ? 'Хит' : undefined,
  }));

  const categoryItems: CategoryItem[] = categories.map((c: { id: string; name: string; slug: string; description?: string | null; image?: string | null }) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    image: CATEGORY_IMAGES_BY_SLUG[c.slug] ?? (c.image ? getImageUrl(c.image) : DEFAULT_CATEGORY_IMAGE),
  }));

  return (
    <div className="min-h-screen">
      <HeroSection products={heroProducts} />
      <FeaturesSection />
      <CategoriesSection categories={categoryItems} />
      <ProductGallery products={galleryItems} />
    </div>
  );
}
