import { notFound, redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { ProductImageCarousel } from '@/components/product/ProductImageCarousel';
import { ProductInfo } from '@/components/product/ProductInfo';
import { RelatedProducts } from '@/components/product/RelatedProducts';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StickyImageContainer } from '@/components/product/StickyImageContainer';

interface Product {
  id: string;
  name: string;
  shortName?: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  sku?: string;
  volume?: string;
  gender?: string;
  aromaFamily?: string;
  ingredients?: string;
  stock: number;
  weight?: number;
  dimensions?: string;
  productType?: string;
  topNotes?: string;
  purpose?: string;
  usageInstructions?: string;
  brandCountry?: string;
  manufactureCountry?: string;
  barcode?: string;
  isActive: boolean;
  isFeatured: boolean;
  brand: {
    name: string;
    slug: string;
  };
  productCategories: Array<{
    category: {
      name: string;
      slug: string;
    };
  }>;
  images: Array<{
    url: string;
    alt?: string;
    isPrimary: boolean;
  }>;
  variants: Array<{
    id: string;
    name: string;
    value: string;
    price: number;
    comparePrice?: number;
    stock: number;
    sku?: string;
    isDefault?: boolean;
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    title?: string;
    comment?: string;
    user: {
      name?: string;
    };
    createdAt: string;
  }>;
  averageRating: number;
  reviewCount: number;
}

interface ProductPageProps {
  params: {
    slug: string;
  };
}

async function getProduct(slug: string, baseUrl: string): Promise<{ product: Product; relatedProducts: Product[]; canonicalSlug?: string } | null> {
  try {
    const response = await fetch(`${baseUrl}/api/products/${slug}`, {
      cache: 'no-store', // Ensure fresh data
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const headersList = headers();
  const protocol = headersList.get('x-forwarded-proto') || 'https';
  const host = headersList.get('x-forwarded-host') || headersList.get('host') || 'aromarussia.ru';
  const baseUrl = `${protocol}://${host}`;
  const data = await getProduct(params.slug, baseUrl);

  if (!data) {
    notFound();
  }

  const { product, relatedProducts, canonicalSlug } = data;
  if (canonicalSlug && canonicalSlug !== params.slug) {
    redirect(`/catalog/${canonicalSlug}`);
  }

  // API уже возвращает полные URL изображений, дополнительная обработка не нужна

  const breadcrumbItems = [
    { label: 'Главная', href: '/' },
    { label: 'Каталог', href: '/catalog' },
    { 
      label: product.productCategories[0]?.category.name || 'Товары', 
      href: `/catalog?category=${product.productCategories[0]?.category.slug}` 
    },
    { label: product.shortName || product.name, href: `/catalog/${product.slug}` },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6 mt-6">
        {/* Product Images - Sticky на десктопе */}
        <div className="lg:col-span-2">
          <StickyImageContainer 
            contentContainerId="product-info-container"
            headerOffset={96}
          >
            <ProductImageCarousel 
              images={product.images.map(img => img.url)} 
              name={product.shortName || product.name} 
            />
          </StickyImageContainer>
        </div>

        {/* Product Info */}
        <div id="product-info-container" className="space-y-6 lg:col-span-3">
          <ProductInfo product={product} />
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <RelatedProducts products={relatedProducts} />
        </div>
      )}
      </div>
    </div>
  );
}