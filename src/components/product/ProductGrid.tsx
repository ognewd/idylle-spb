'use client';

import { useState } from 'react';
import { ProductCard } from './ProductCard';
import { QuickView } from './QuickView';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  images: Array<{
    url: string;
    alt?: string;
    isPrimary: boolean;
  }> | string[];
  brand: {
    name: string;
    slug: string;
  };
  volume?: string;
  aromaFamily?: string;
  gender?: string;
  stock: number;
  isFeatured?: boolean;
  rating?: number;
  reviewCount?: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ProductGridProps {
  products: Product[];
  pagination: PaginationInfo;
  searchParams: Record<string, string | string[] | undefined>;
  className?: string;
  loadingMore?: boolean;
  hasMore?: boolean;
}

export function ProductGrid({
  products,
  pagination,
  searchParams,
  className,
  loadingMore,
  hasMore,
}: ProductGridProps) {
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const handleAddToWishlist = (productId: string) => {
    // TODO: Implement wishlist functionality
    console.log('Add to wishlist:', productId);
  };

  const handleAddToCart = (productId: string) => {
    // TODO: Implement cart functionality
    console.log('Add to cart:', productId);
  };

  const handleQuickView = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setQuickViewProduct(product);
      setIsQuickViewOpen(true);
    }
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          Товары не найдены
        </h3>
        <p className="text-muted-foreground">
          Попробуйте изменить параметры поиска или фильтры
        </p>
      </div>
    );
  }

  return (
    <>
      <QuickView
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        onAddToCart={() => {
          console.log('Added to cart from quick view');
        }}
      />
      <div className={cn("space-y-6", className)}>
        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToWishlist={handleAddToWishlist}
            onAddToCart={handleAddToCart}
            onQuickView={handleQuickView}
            priority={index < 8}
          />
        ))}
      </div>

      {/* Scroll Sentinel for Infinite Scroll */}
      {hasMore && (
        <div id="scroll-sentinel" className="h-10 flex items-center justify-center">
          {loadingMore && (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          )}
        </div>
      )}

      {/* Show message when all products loaded */}
      {!hasMore && products.length > 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Все товары загружены</p>
        </div>
      )}
      </div>
    </>
  );
}
