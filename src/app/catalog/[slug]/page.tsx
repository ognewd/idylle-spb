import { notFound } from 'next/navigation';
import { ProductImageCarousel } from '@/components/product/ProductImageCarousel';
import { ProductInfo } from '@/components/product/ProductInfo';
import { RelatedProducts } from '@/components/product/RelatedProducts';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

interface Product {
  id: string;
  name: string;
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

async function getProduct(slug: string): Promise<{ product: Product; relatedProducts: Product[] } | null> {
  try {
    const response = await fetch(`http://localhost:3000/api/products/${slug}`, {
      cache: 'no-store',
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
  const data = await getProduct(params.slug);
  
  if (!data) {
    notFound();
  }

  const { product, relatedProducts } = data;

  const breadcrumbItems = [
    { label: 'Главная', href: '/' },
    { label: 'Каталог', href: '/catalog' },
    { 
      label: product.productCategories[0]?.category.name || 'Товары', 
      href: `/catalog?category=${product.productCategories[0]?.category.slug}` 
    },
    { label: product.name, href: `/catalog/${product.slug}` },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
        {/* Product Images */}
        <div className="space-y-4">
          <ProductImageCarousel 
            images={product.images.map(img => img.url)} 
            name={product.name} 
          />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
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
  );
}