import { notFound, redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { ProductImageCarousel } from '@/components/product/ProductImageCarousel';
import { ProductInfo } from '@/components/product/ProductInfo';
import { ProductDocuments } from '@/components/product/ProductDocuments';
import { RelatedProducts } from '@/components/product/RelatedProducts';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StickyImageContainer } from '@/components/product/StickyImageContainer';
import { SetAdminEditProductId } from '@/components/admin/SetAdminEditProductId';

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
  documents?: Array<{
    id: string;
    type: string;
    title: string;
    fileUrl: string;
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
  params: Promise<{
    slug: string;
  }> | {
    slug: string;
  };
  searchParams?: Promise<{ dealer?: string }> | { dealer?: string };
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

export default async function ProductPage({ params, searchParams }: ProductPageProps) {
  // Поддержка как синхронных, так и асинхронных params (Next.js 14/15)
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearch = await Promise.resolve(searchParams ?? {});
  const isDealerShowcase = resolvedSearch?.dealer === '1';
  const slug = resolvedParams.slug;
  
  const headersList = headers();
  const host = headersList.get('x-forwarded-host') || headersList.get('host') || 'aromarussia.ru';
  // Определяем протокол: для localhost используем http, иначе берем из заголовка или используем https
  const protocol = host.includes('localhost') || host.includes('127.0.0.1')
    ? 'http'
    : (headersList.get('x-forwarded-proto') || 'https');
  const baseUrl = `${protocol}://${host}`;
  const data = await getProduct(slug, baseUrl);

  if (!data) {
    notFound();
  }

  const { product, relatedProducts, canonicalSlug } = data;
  if (canonicalSlug && canonicalSlug !== slug) {
    redirect(`/catalog/${canonicalSlug}${isDealerShowcase ? '?dealer=1' : ''}`);
  }

  // Логируем количество изображений для отладки
  console.log(`[ProductPage] Product "${product.name}": Received ${product.images.length} images from API:`, 
    product.images.map(img => ({ url: img.url, isPrimary: img.isPrimary }))
  );

  // API уже возвращает полные URL изображений, дополнительная обработка не нужна

  const breadcrumbItems = [
    ...(isDealerShowcase
      ? [{ label: 'Кабинет дилера', href: '/admin' }, { label: 'Витрина', href: '/catalog?dealer=1' }]
      : [{ label: 'Главная', href: '/' }, { label: 'Каталог', href: '/catalog' }]),
    { 
      label: product.productCategories[0]?.category.name || 'Товары', 
      href: `/catalog?category=${product.productCategories[0]?.category.slug}${isDealerShowcase ? '&dealer=1' : ''}` 
    },
    { label: product.shortName || product.name, href: `/catalog/${product.slug}${isDealerShowcase ? '?dealer=1' : ''}` },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SetAdminEditProductId productId={product.id} />
      <div className="container mx-auto px-4 py-8 sm:py-10 lg:py-12">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-10">
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
          {product.documents && product.documents.length > 0 && (
            <ProductDocuments documents={product.documents} />
          )}
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