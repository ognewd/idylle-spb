import { HeroSection } from '@/components/home/HeroSection';
import { getImageUrl } from '@/lib/image-url';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import type { CategoryItem } from '@/components/home/CategoriesSection';
import { ProductGallery } from '@/components/home/ProductGallery';
import type { GalleryProduct } from '@/components/home/ProductGallery';
import { prisma } from '@/lib/prisma';

// Изображения для секции категорий по slug (подпись и картинка должны совпадать)
const CATEGORY_IMAGES_BY_SLUG: Record<string, string> = {
  'aromaty-dlya-doma': 'https://images.unsplash.com/photo-1617351165959-471f874b60a9?w=800&q=80', // диффузор, гостиная
  'vannaya-komnata': 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&q=80',   // ванная
  'podarki': 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80',             // подарки
};
const DEFAULT_CATEGORY_IMAGE = 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&q=80';

async function getFeaturedProducts(limit: number) {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      take: limit,
      include: {
        brand: true,
        productCategories: { include: { category: true } },
        images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
      },
    });
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
  } catch {
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

export default async function HomePage() {
  const [galleryProducts, categories] = await Promise.all([
    getFeaturedProducts(6),
    getCategories(3),
  ]);

  const galleryItems: GalleryProduct[] = galleryProducts.map((p: { id: string; name: string; shortName?: string | null; slug: string; price: number; image: string; category?: string; isFeatured?: boolean }) => ({
    id: p.id,
    name: p.name,
    shortName: p.shortName,
    slug: p.slug,
    price: p.price,
    image: p.image,
    category: p.category,
    isFeatured: p.isFeatured,
  }));

  const heroProduct = galleryItems[0]
    ? {
        id: galleryItems[0].id,
        name: galleryItems[0].name,
        shortName: galleryItems[0].shortName,
        slug: galleryItems[0].slug,
        price: galleryItems[0].price,
        image: galleryItems[0].image,
        brandName: galleryProducts[0]?.brandName,
        category: galleryItems[0].category,
        badge: galleryItems[0].isFeatured ? 'Хит' : undefined,
      }
    : null;

  const categoryItems: CategoryItem[] = categories.map((c: { id: string; name: string; slug: string; description?: string | null; image?: string | null }) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    image: CATEGORY_IMAGES_BY_SLUG[c.slug] ?? (c.image ? getImageUrl(c.image) : DEFAULT_CATEGORY_IMAGE),
  }));

  return (
    <div className="min-h-screen">
      <HeroSection product={heroProduct} />
      <FeaturesSection />
      <CategoriesSection categories={categoryItems} />
      <ProductGallery products={galleryItems} />
    </div>
  );
}
