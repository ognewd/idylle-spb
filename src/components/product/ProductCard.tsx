'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, ShoppingCart, Star, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { getImageUrl } from '@/lib/image-url';
import { galleryIndexFromClientX } from '@/lib/gallery-index-from-pointer';
import { useFinePointerHover } from '@/hooks/use-fine-pointer-hover';

interface ProductVariant {
  id: string;
  name: string;
  value: string;
  price: number;
  comparePrice?: number;
  stock: number;
  sku?: string;
  isDefault?: boolean;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  originalPrice?: number;
  seasonalDiscount?: {
    id: string;
    name: string;
    discount: number;
  };
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
  weight?: number;
  isFeatured?: boolean;
  rating?: number;
  reviewCount?: number;
  variants?: ProductVariant[];
}

interface ProductCardProps {
  product: Product;
  onAddToWishlist?: (productId: string) => void;
  onAddToCart?: (productId: string, variantId?: string) => void;
  onQuickView?: (productId: string) => void;
  className?: string;
  priority?: boolean;
}

export function ProductCard({
  product,
  onAddToWishlist,
  onAddToCart,
  onQuickView,
  className,
  priority = false,
}: ProductCardProps) {
  const { addItem } = useCart();
  const { isInWishlist: wishlistHas, toggle } = useWishlist();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchCurrentX = useRef(0);
  const didSwipeRef = useRef(false);
  const imageAreaRef = useRef<HTMLDivElement>(null);
  const hasMultipleImages = !!(product.images && product.images.length > 1);
  const finePointerHover = useFinePointerHover();
  
  // Handle variants
  const hasVariants = product.variants && product.variants.length > 0;
  
  // Find the variant with the smallest price (smallest volume)
  const getDefaultVariant = () => {
    if (!hasVariants) return null;
    const sorted = [...product.variants!].sort((a, b) => a.price - b.price);
    return sorted[0];
  };
  
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(getDefaultVariant());

  // Calculate current price based on selection
  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentComparePrice = selectedVariant ? selectedVariant.comparePrice : product.comparePrice;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;

  // Calculate discount percentage - prefer seasonal discount over comparePrice
  const discountPercentage = product.seasonalDiscount
    ? product.seasonalDiscount.discount
    : currentComparePrice
    ? Math.round(((currentComparePrice - currentPrice) / currentComparePrice) * 100)
    : 0;

  const isOutOfStock = currentStock === 0;

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle({
      id: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images && product.images.length > 0
        ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url || '/placeholder-product.jpg')
        : '/placeholder-product.jpg',
      price: currentPrice,
    });
    onAddToWishlist?.(product.id);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const imageUrl = product.images && product.images.length > 0
      ? (typeof product.images[0] === 'string' 
        ? product.images[0] 
        : product.images[0]?.url || '/placeholder-product.jpg')
      : '/placeholder-product.jpg';
      
    const weightGrams = product.weight != null ? Math.round(Number(product.weight)) : undefined;
    addItem({
      id: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id,
      productId: product.id,
      name: product.name,
      price: currentPrice,
      image: imageUrl,
      weight: weightGrams,
      variant: selectedVariant ? {
        id: selectedVariant.id,
        volume: selectedVariant.value,
      } : undefined,
    });
    
    if (hasVariants && selectedVariant) {
      onAddToCart?.(product.id, selectedVariant.id);
    } else {
      onAddToCart?.(product.id);
    }
  };

  const handleVariantChange = (variantId: string) => {
    const variant = product.variants?.find(v => v.id === variantId);
    if (variant) {
      setSelectedVariant(variant);
    }
  };

  const primaryImage = product.images && product.images.length > 0
    ? (typeof product.images[currentImageIndex] === 'string' 
      ? product.images[currentImageIndex] as string
      : product.images[currentImageIndex]?.url)
    : null;

  const goToPrevImage = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault();
    if (!product.images || product.images.length <= 1) return;
    setCurrentImageIndex((i) => (i - 1 + product.images!.length) % product.images!.length);
  }, [product.images]);

  const goToNextImage = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault();
    if (!product.images || product.images.length <= 1) return;
    setCurrentImageIndex((i) => (i + 1) % product.images!.length);
  }, [product.images]);

  const onImageMouseMoveScrub = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!finePointerHover || !hasMultipleImages || !product.images?.length) return;
      const el = imageAreaRef.current;
      if (!el) return;
      const idx = galleryIndexFromClientX(e.clientX, el.getBoundingClientRect(), product.images.length);
      setCurrentImageIndex((prev) => (prev === idx ? prev : idx));
    },
    [finePointerHover, hasMultipleImages, product.images]
  );

  const onImageTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
    didSwipeRef.current = false;
  }, []);

  const onImageTouchEnd = useCallback(() => {
    const deltaX = touchCurrentX.current - touchStartX.current;
    if (Math.abs(deltaX) > 50 && hasMultipleImages) {
      didSwipeRef.current = true;
      if (deltaX > 0) goToPrevImage();
      else goToNextImage();
      setTimeout(() => { didSwipeRef.current = false; }, 300);
    }
  }, [hasMultipleImages, goToPrevImage, goToNextImage]);

  useEffect(() => {
    const el = imageAreaRef.current;
    if (!el || !hasMultipleImages) return;
    const onMove = (e: TouchEvent) => {
      touchCurrentX.current = e.touches[0].clientX;
      if (Math.abs(touchCurrentX.current - touchStartX.current) > 10) e.preventDefault();
    };
    el.addEventListener('touchmove', onMove, { passive: false });
    return () => el.removeEventListener('touchmove', onMove);
  }, [hasMultipleImages]);

  return (
    <div className={cn(
      "group bg-white border border-neutral-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300",
      className
    )}>
      {/* Image — на мобильном свайп листает фото, тап открывает товар */}
      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        {primaryImage ? (
          <Link
            href={`/catalog/${product.slug}`}
            className="block w-full h-full"
            onClick={(e) => { if (didSwipeRef.current) e.preventDefault(); }}
          >
            <div
              ref={imageAreaRef}
              className={cn(
                'block w-full h-full',
                finePointerHover && hasMultipleImages && 'cursor-ew-resize'
              )}
              style={{ touchAction: hasMultipleImages ? 'pan-y' : undefined }}
              onMouseMove={onImageMouseMoveScrub}
              onTouchStart={onImageTouchStart}
              onTouchEnd={onImageTouchEnd}
            >
              <img
                src={getImageUrl(primaryImage)}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.onerror = null;
                  target.src = '/placeholder-product.jpg';
                }}
              />
            </div>
          </Link>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <ImageIcon className="h-16 w-16 opacity-50" />
            <p className="text-sm text-center px-4 mt-2">Нет изображения</p>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isFeatured && (
            <Badge className="bg-orange-500 hover:bg-orange-600">
              Хит продаж
            </Badge>
          )}
          {discountPercentage > 0 && (
            <Badge variant="destructive">
              -{discountPercentage}%
            </Badge>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="icon"
            variant="secondary"
            className="size-9 rounded-full shadow-lg"
            onClick={handleAddToWishlist}
          >
            <Heart className={cn(
              "size-4",
              wishlistHas(product.id) ? "fill-red-500 text-red-500" : ""
            )} />
          </Button>
        </div>

        {/* Stock Status */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="secondary" className="text-base">
              Нет в наличии
            </Badge>
          </div>
        )}

        {/* Стрелки листания фото — на мобильном видны всегда, на десктопе по hover */}
        {hasMultipleImages && (
          <>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute left-1 top-1/2 -translate-y-1/2 size-8 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10 shadow-md"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); goToPrevImage(e); }}
              aria-label="Предыдущее фото"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 size-8 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10 shadow-md"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); goToNextImage(e); }}
              aria-label="Следующее фото"
            >
              <ChevronRight className="size-4" />
            </Button>
          </>
        )}

        {/* Image Navigation Dots */}
        {product.images && product.images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
            {product.images.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  index === currentImageIndex
                    ? "bg-white"
                    : "bg-white/50 hover:bg-white/75"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                aria-label={`Показать изображение ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Brand */}
        <Link
          href={`/catalog?brand=${product.brand.slug}`}
          className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          {product.brand.name}
        </Link>

        {/* Name */}
        <Link href={`/catalog/${product.slug}`}>
          <h3 className="font-medium text-sm mt-1 mb-2 line-clamp-2 min-h-[2.5rem] hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Details: объём и нота аромата в стиле блоков нот на странице товара */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {product.volume && (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-neutral-100 text-neutral-700">
              {product.volume}
            </span>
          )}
          {product.aromaFamily && (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-900">
              {product.aromaFamily}
            </span>
          )}
        </div>

        {/* Rating */}
        {product.rating !== undefined && product.reviewCount !== undefined && product.reviewCount > 0 && (
          <div className="flex items-center gap-1 mb-3">
            <div className="flex items-center gap-0.5">
              <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
            </div>
            <span className="text-xs text-neutral-500">
              ({product.reviewCount} отзывов)
            </span>
          </div>
        )}

        {/* Variant Selector */}
        {hasVariants && (
          <div className="mb-3">
            <Select
              value={selectedVariant?.id}
              onValueChange={handleVariantChange}
            >
              <SelectTrigger className="w-full h-9 text-sm">
                <SelectValue placeholder="Выберите объем" />
              </SelectTrigger>
              <SelectContent>
                {product.variants!.map((variant) => (
                  <SelectItem key={variant.id} value={variant.id}>
                    {variant.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Price & Action */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">{currentPrice.toLocaleString('ru-RU')} ₽</span>
              {(currentComparePrice || product.originalPrice) && (
                <span className="text-sm text-neutral-400 line-through">
                  {(product.originalPrice || currentComparePrice)!.toLocaleString('ru-RU')} ₽
                </span>
              )}
            </div>
            {/* Stock warning */}
            {currentStock > 0 && currentStock < 10 && (
              <p className="text-xs text-orange-600 mt-0.5">
                Осталось {currentStock} шт.
              </p>
            )}
            {/* Seasonal Discount Info */}
            {product.seasonalDiscount && (
              <p className="text-xs text-green-600 font-medium mt-0.5">
                🎉 {product.seasonalDiscount.name}
              </p>
            )}
          </div>
          <Button
            size="icon"
            className="size-9 rounded-full flex-shrink-0"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
