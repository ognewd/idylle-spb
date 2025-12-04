'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, ShoppingCart, Star, Truck, Shield, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';

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

interface ProductReview {
  id: string;
  rating: number;
  title?: string;
  comment?: string;
  user: {
    name?: string;
  };
  createdAt: string;
}

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
  category?: {
    name: string;
    slug: string;
  };
  productCategories?: Array<{
    category: {
      name: string;
      slug: string;
    };
  }>;
  images?: Array<{
    url: string;
    alt?: string;
    isPrimary: boolean;
  }>;
  variants?: ProductVariant[];
  reviews?: ProductReview[];
  reviewCount?: number;
  averageRating?: number;
  _count?: {
    reviews: number;
  };
}

interface ProductInfoProps {
  product: Product;
  className?: string;
}

export function ProductInfo({ product, className }: ProductInfoProps) {
  const { addItem } = useCart();
  const { isInWishlist, toggle } = useWishlist();
  
  // Find default variant or use first one
  const defaultVariant = product.variants?.find(v => v.isDefault) || product.variants?.[0] || null;
  
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(defaultVariant);
  const [quantity, setQuantity] = useState(1);

  // Calculate price and discount based on selected variant or product
  const finalPrice = selectedVariant?.price || product.price;
  const finalComparePrice = selectedVariant?.comparePrice || product.comparePrice;
  const discountPercentage = finalComparePrice
    ? Math.round(((finalComparePrice - finalPrice) / finalComparePrice) * 100)
    : 0;

  const finalStock = selectedVariant?.stock || product.stock;
  
  // Calculate average rating from reviews
  const reviews = product.reviews || [];
  const reviewCount = product.reviewCount || product._count?.reviews || reviews.length;
  const averageRating = product.averageRating || 
    (reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
      : 0);
  const isOutOfStock = finalStock === 0;

  const handleAddToWishlist = () => {
    toggle({
      id: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images && product.images.length > 0
        ? (product.images[0]?.url || '/placeholder-product.jpg')
        : '/placeholder-product.jpg',
      price: finalPrice,
    });
  };

  const handleAddToCart = () => {
    // Add product or variant to cart
    const cartItem = {
      id: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id,
      productId: product.id,
      name: `${product.name}${selectedVariant ? ` - ${selectedVariant.value}` : ''}`,
      price: finalPrice,
      image: product.images?.[0]?.url || '/placeholder-product.jpg',
      variant: selectedVariant ? {
        id: selectedVariant.id,
        size: selectedVariant.value,
      } : undefined,
    };

    // Add item to cart with quantity
    for (let i = 0; i < quantity; i++) {
      addItem(cartItem);
    }
    
    console.log('Added to cart:', cartItem);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Brand */}
      <Link
        href={`/catalog?brand=${product.brand.slug}`}
        className="text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        {product.brand.name}
      </Link>

      {/* Product Name */}
      <h1 className="text-3xl font-bold">{product.name}</h1>

      {/* Rating and Reviews */}
      {reviewCount > 0 && (
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-4 w-4",
                  i < Math.floor(averageRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                )}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {averageRating.toFixed(1)} ({reviewCount} отзывов)
          </span>
        </div>
      )}

      {/* Price */}
      <div className="flex items-center space-x-3">
        <span className="text-3xl font-bold">
          {finalPrice.toLocaleString('ru-RU')} ₽
        </span>
        {finalComparePrice && (
          <span className="text-lg text-muted-foreground line-through">
            {finalComparePrice.toLocaleString('ru-RU')} ₽
          </span>
        )}
        {discountPercentage > 0 && (
          <Badge variant="destructive" className="text-sm">
            -{discountPercentage}%
          </Badge>
        )}
      </div>
      
      {selectedVariant && (
        <div className="text-sm text-muted-foreground">
          Бонус: {Math.round(finalPrice * 0.011)} баллов
        </div>
      )}

      {/* Product Details */}
      <div className="space-y-2 text-sm">
        {product.volume && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Объем:</span>
            <span>{product.volume}</span>
          </div>
        )}
        {product.aromaFamily && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ароматическая семья:</span>
            <span>{product.aromaFamily}</span>
          </div>
        )}
        {product.gender && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Пол:</span>
            <span>
              {product.gender === 'men' ? 'Мужской' : 
               product.gender === 'women' ? 'Женский' : 'Унисекс'}
            </span>
          </div>
        )}
        {product.sku && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Артикул:</span>
            <span className="font-mono">{product.sku}</span>
          </div>
        )}
      </div>

      {/* Variants */}
      {product.variants && product.variants.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium">{product.variants[0]?.name || 'Варианты'}:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {product.variants.map((variant) => {
              const isSelected = selectedVariant?.id === variant.id;
              const variantDiscount = variant.comparePrice
                ? Math.round(((variant.comparePrice - variant.price) / variant.comparePrice) * 100)
                : 0;
              
              return (
                <div
                  key={variant.id}
                  className={cn(
                    "relative p-4 border-2 rounded-lg transition-all",
                    "hover:border-primary",
                    isSelected 
                      ? "border-primary bg-primary/5" 
                      : "border-gray-200"
                  )}
                >
                  {/* Discount Badge */}
                  {variantDiscount > 0 && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                        -{variantDiscount}%
                      </Badge>
                    </div>
                  )}
                  
                  {/* Volume */}
                  <div className="font-medium text-lg mb-1">
                    {variant.value}
                  </div>
                  
                  {/* Price */}
                  <div className="space-y-0.5 mb-3">
                    <div className="text-sm font-semibold">
                      {variant.price.toLocaleString('ru-RU')} ₽
                    </div>
                    {variant.comparePrice && (
                      <div className="text-xs text-muted-foreground line-through">
                        {variant.comparePrice.toLocaleString('ru-RU')} ₽
                      </div>
                    )}
                  </div>
                  
                  {/* Stock Status */}
                  {variant.stock === 0 ? (
                    <div className="text-xs text-red-600 mb-2">
                      Нет в наличии
                    </div>
                  ) : variant.stock < 5 ? (
                    <div className="text-xs text-orange-600 mb-2">
                      Осталось {variant.stock} шт.
                    </div>
                  ) : (
                    <div className="mb-2 h-4"></div>
                  )}
                  
                  {/* Add to Cart Button */}
                  <Button
                    size="sm"
                    className="w-full"
                    disabled={variant.stock === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedVariant(variant);
                      
                      // Add variant to cart
                      const cartItem = {
                        id: `${product.id}-${variant.id}`,
                        productId: product.id,
                        name: `${product.name} - ${variant.value}`,
                        price: variant.price,
                        image: product.images?.[0]?.url || '/placeholder-product.jpg',
                        variant: {
                          id: variant.id,
                          size: variant.value,
                        },
                      };
                      
                      addItem(cartItem);
                      console.log('Added variant to cart:', cartItem);
                    }}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    В корзину
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions for products without variants */}
      {(!product.variants || product.variants.length === 0) && (
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Количество:</span>
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <span className="px-3 py-1 min-w-[3rem] text-center">{quantity}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.min(finalStock, quantity + 1))}
                  disabled={quantity >= finalStock}
                >
                  +
                </Button>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              className="flex-1"
              size="lg"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {isOutOfStock ? 'Нет в наличии' : 'В корзину'}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleAddToWishlist}
            >
              <Heart className={cn("h-4 w-4", isInWishlist(product.id) && "fill-red-500 text-red-500")} />
            </Button>
          </div>

          {/* Stock Status */}
          {finalStock > 0 && finalStock < 10 && (
            <p className="text-sm text-orange-600">
              Осталось {finalStock} шт.
            </p>
          )}
        </div>
      )}
      
      {/* Wishlist button for products with variants */}
      {product.variants && product.variants.length > 0 && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="lg"
            onClick={handleAddToWishlist}
            className="min-w-[200px]"
          >
            <Heart
              className={cn(
                "h-4 w-4 mr-2",
                isInWishlist(product.id) ? "fill-red-500 text-red-500" : ""
              )}
            />
            {isInWishlist(product.id) ? 'В избранном' : 'В избранное'}
          </Button>
        </div>
      )}

      <Separator />

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <Truck className="h-4 w-4 text-muted-foreground" />
          <span>Бесплатная доставка от 5000₽</span>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <span>Гарантия качества</span>
        </div>
        <div className="flex items-center space-x-2">
          <RotateCcw className="h-4 w-4 text-muted-foreground" />
          <span>Возврат в течение 14 дней</span>
        </div>
      </div>

      <Separator />

      {/* Product Details Tabs */}
      <Tabs defaultValue="description" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="description">Описание</TabsTrigger>
          <TabsTrigger value="ingredients">Состав</TabsTrigger>
          <TabsTrigger value="reviews">Отзывы ({reviewCount})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="description" className="mt-4">
          <div className="prose prose-sm max-w-none">
            {product.description ? (
              <div dangerouslySetInnerHTML={{ __html: product.description }} />
            ) : (
              <p className="text-muted-foreground">Описание товара отсутствует</p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="ingredients" className="mt-4">
          <div className="prose prose-sm max-w-none">
            {product.ingredients ? (
              <div dangerouslySetInnerHTML={{ __html: product.ingredients }} />
            ) : (
              <p className="text-muted-foreground">Состав не указан</p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="reviews" className="mt-4">
          <div className="space-y-4">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{review.user.name}</span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-3 w-3",
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  {review.title && (
                    <h4 className="font-medium mb-1">{review.title}</h4>
                  )}
                  {review.comment && (
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">Отзывов пока нет</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
