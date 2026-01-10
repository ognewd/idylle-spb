'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, ShoppingCart, Eye, Star, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { getImageUrl } from '@/lib/image-url';

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
  const [isHovered, setIsHovered] = useState(false);
  
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

  const handleImageHover = (index: number) => {
    setCurrentImageIndex(index);
  };

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
    
    // Add to cart using context
    const imageUrl = product.images && product.images.length > 0
      ? (typeof product.images[0] === 'string' 
        ? product.images[0] 
        : product.images[0]?.url || '/placeholder-product.jpg')
      : '/placeholder-product.jpg';
      
    addItem({
      id: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id,
      productId: product.id,
      name: product.name,
      price: currentPrice,
      image: imageUrl,
      variant: selectedVariant ? {
        id: selectedVariant.id,
        volume: selectedVariant.value,
      } : undefined,
    });
    
    // Also call the callback if provided
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

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product.id);
  };

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-lg",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Section */}
      <div className={cn("relative overflow-hidden bg-white flex items-center justify-center", {
        "bg-muted p-2": !(product.images && product.images.length > 0)
      })} style={{ aspectRatio: '5/6', minHeight: '350px', maxHeight: '450px' }}>
        {product.images && product.images.length > 0 ? (
          <Link href={`/catalog/${product.slug}`} className="relative block w-full h-full p-4">
            <div className="relative w-full h-full">
              <Image
                src={getImageUrl(
                  typeof product.images[currentImageIndex] === 'string' 
                    ? product.images[currentImageIndex] as string
                    : product.images[currentImageIndex]?.url
                )}
                alt={product.name}
                fill
                className="object-contain transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={priority}
                loading={priority ? undefined : "lazy"}
              />
            </div>
          </Link>
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground space-y-3 p-2 h-full">
            <ImageIcon className="h-16 w-16 opacity-50" />
            <p className="text-sm text-center px-4">Изображение еще не добавлено</p>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none">
          {product.isFeatured && (
            <Badge variant="default" className="text-xs">
              Хит
            </Badge>
          )}
          {discountPercentage > 0 && (
            <Badge 
              variant="destructive" 
              className="text-xs"
              title={product.seasonalDiscount ? product.seasonalDiscount.name : undefined}
            >
              -{discountPercentage}%
              {product.seasonalDiscount && ' 🎉'}
            </Badge>
          )}
          {isOutOfStock && (
            <Badge variant="secondary" className="text-xs">
              Нет в наличии
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div
          className={cn(
            "absolute top-2 right-2 flex flex-col gap-2 transition-opacity duration-300",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        >
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 shadow-md"
            onClick={handleAddToWishlist}
          >
            <Heart
              className={cn(
                "h-4 w-4",
                wishlistHas(product.id) ? "fill-red-500 text-red-500" : ""
              )}
            />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 shadow-md"
            onClick={handleQuickView}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>

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

      {/* Product Info Section */}
      <CardContent className="p-4">
        {/* Brand */}
        <Link
          href={`/catalog?brand=${product.brand.slug}`}
          className="text-xs text-muted-foreground hover:text-primary transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          {product.brand.name}
        </Link>

        {/* Product Name */}
        <Link href={`/catalog/${product.slug}`}>
          <h3 className="font-medium text-sm mt-1 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Product Details */}
        <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
          {product.volume && (
            <span>{product.volume}</span>
          )}
          {product.aromaFamily && (
            <span>• {product.aromaFamily}</span>
          )}
          {product.gender && (
            <span>• {product.gender === 'men' ? 'Мужской' : product.gender === 'women' ? 'Женский' : 'Унисекс'}</span>
          )}
        </div>

        {/* Rating */}
        {product.rating && product.reviewCount && (
          <div className="flex items-center gap-1 mt-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3 w-3",
                    i < Math.floor(product.rating!)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              ({product.reviewCount})
            </span>
          </div>
        )}

        {/* Variant Selector - only if product has variants */}
        {hasVariants && (
          <div className="mt-3">
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

        {/* Price */}
        <div className="flex items-center gap-2 mt-3">
          <span className="font-semibold text-lg">
            {currentPrice.toLocaleString('ru-RU')} ₽
          </span>
          {(currentComparePrice || product.originalPrice) && (
            <span className="text-sm text-muted-foreground line-through">
              {(product.originalPrice || currentComparePrice)!.toLocaleString('ru-RU')} ₽
            </span>
          )}
        </div>
        
        {/* Seasonal Discount Info */}
        {product.seasonalDiscount && (
          <p className="text-xs text-green-600 mt-1 font-medium">
            🎉 {product.seasonalDiscount.name}
          </p>
        )}

        {/* Stock Status */}
        {currentStock > 0 && currentStock < 10 && (
          <p className="text-xs text-orange-600 mt-1">
            Осталось {currentStock} шт.
          </p>
        )}

        {/* Add to Cart Button - Always Visible */}
        <Button
          className="w-full mt-3"
          disabled={isOutOfStock}
          onClick={handleAddToCart}
          size="sm"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {isOutOfStock ? 'Нет в наличии' : 'В корзину'}
        </Button>
      </CardContent>
    </Card>
  );
}
