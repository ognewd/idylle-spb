import { HeroSection } from '@/components/home/HeroSection';
import { getImageUrl } from '@/lib/image-url';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import type { CategoryItem } from '@/components/home/CategoriesSection';
import { ProductGallery } from '@/components/home/ProductGallery';
import type { GalleryProduct } from '@/components/home/ProductGallery';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// Дефолтные фото для секции категорий, если в БД у категории нет image
const DEFAULT_CATEGORY_IMAGES = [
  'https://images.unsplash.com/photo-1617351165959-471f874b60a9?w=800&q=80', // ароматы/дом
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80', // ванная
  'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&q=80', // подарки
];

async function getFeaturedProducts(limit: number) {
  try {
    const res = await fetch(`${BASE_URL}/api/products?sort=featured&limit=${limit}`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    const products = data.products || [];
    return products.map((p: any) => ({
      id: p.id,
      name: p.name,
      shortName: p.shortName,
      slug: p.slug,
      price: p.price,
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
    const res = await fetch(`${BASE_URL}/api/categories`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    const list = Array.isArray(data) ? data : data.categories || [];
    return list
      .filter((c: any) => !c.parentId)
      .slice(0, limit)
      .map((c: any) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        image: c.image,
      }));
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

  const categoryItems: CategoryItem[] = categories.map((c: { id: string; name: string; slug: string; description?: string | null; image?: string | null }, index: number) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    image: c.image ? getImageUrl(c.image) : DEFAULT_CATEGORY_IMAGES[index % DEFAULT_CATEGORY_IMAGES.length],
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
