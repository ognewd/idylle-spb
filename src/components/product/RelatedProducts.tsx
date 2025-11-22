'use client';

import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useRef } from 'react';
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
  }>;
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

interface RelatedProductsProps {
  products: Product[];
  title?: string;
  className?: string;
}

export function RelatedProducts({ 
  products, 
  title = "Похожие товары",
  className 
}: RelatedProductsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const itemsPerView = 4;
  const maxIndex = Math.max(0, products.length - itemsPerView);

  const scrollToIndex = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const itemWidth = container.scrollWidth / products.length;
      container.scrollTo({
        left: index * itemWidth,
        behavior: 'smooth',
      });
    }
    setCurrentIndex(index);
  };

  const handlePrev = () => {
    const newIndex = Math.max(0, currentIndex - 1);
    scrollToIndex(newIndex);
  };

  const handleNext = () => {
    const newIndex = Math.min(maxIndex, currentIndex + 1);
    scrollToIndex(newIndex);
  };

  const handleAddToWishlist = (productId: string) => {
    // TODO: Implement wishlist functionality
    console.log('Add to wishlist:', productId);
  };

  const handleAddToCart = (productId: string) => {
    // TODO: Implement cart functionality
    console.log('Add to cart:', productId);
  };

  const handleQuickView = (productId: string) => {
    // TODO: Implement quick view functionality
    console.log('Quick view:', productId);
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        
        {products.length > itemsPerView && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrev}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              disabled={currentIndex >= maxIndex}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex space-x-6 overflow-hidden"
          style={{
            scrollBehavior: 'smooth',
          }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-64"
            >
              <ProductCard
                product={product}
                onAddToWishlist={handleAddToWishlist}
                onAddToCart={handleAddToCart}
                onQuickView={handleQuickView}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile scroll indicators */}
      {products.length > 1 && (
        <div className="flex justify-center space-x-2 lg:hidden">
          {Array.from({ length: Math.ceil(products.length / 2) }).map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                Math.floor(currentIndex / 2) === index
                  ? "bg-primary"
                  : "bg-muted-foreground/30"
              )}
              onClick={() => scrollToIndex(index * 2)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
