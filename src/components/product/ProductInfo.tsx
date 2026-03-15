'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, ShoppingCart, Star, Truck, Shield, RotateCcw, MessageCircle } from 'lucide-react';
import { cn, getReviewWord } from '@/lib/utils';
import { sanitizeHtml } from '@/lib/sanitize';
import { useCart } from '@/contexts/CartContext';
import { ReviewForm } from './ReviewForm';
import { ProductWantAsGift } from './ProductWantAsGift';

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
  name: string; // Полное название
  shortName?: string; // Краткое название (для H1)
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
  productType?: string; // Вид товара
  topNotes?: string; // Основные ноты
  purpose?: string; // Назначение (Для какого помещения)
  usageInstructions?: string; // Способ применения
  brandCountry?: string; // Страна происхождения бренда
  manufactureCountry?: string; // Страна производства
  barcode?: string; // Штрихкод
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
  
  // Find default variant or use first one
  const defaultVariant = product.variants?.find(v => v.isDefault) || product.variants?.[0] || null;
  
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(defaultVariant);
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);

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
    setIsInWishlist(!isInWishlist);
    // TODO: Implement wishlist API call
  };

  const handleAddToCart = () => {
    const weightGrams = product.weight != null ? Math.round(Number(product.weight)) : undefined;
    
    // Нормализуем изображение - всегда сохраняем как строку
    let imageUrl = '/placeholder-product.jpg';
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      if (typeof firstImage === 'string') {
        imageUrl = firstImage;
      } else if (firstImage?.url) {
        imageUrl = firstImage.url;
      }
    }
    
    const cartItem = {
      id: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id,
      productId: product.id,
      name: `${product.name}${selectedVariant ? ` - ${selectedVariant.value}` : ''}`,
      price: finalPrice,
      image: imageUrl,
      weight: weightGrams,
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

      {/* Product Name - используем shortName если есть, иначе name */}
      <h1 className="text-3xl font-bold">{product.shortName || product.name}</h1>

      <ProductWantAsGift
        productName={product.shortName || product.name}
        productSlug={product.slug}
      />

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
            {averageRating.toFixed(1)} ({reviewCount} {getReviewWord(reviewCount)})
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

      {/* Парсинг нот аромата */}
      {(() => {
        if (!product.topNotes || !product.topNotes.trim() || product.topNotes.trim() === '-') {
          return null;
        }

        const notesText = product.topNotes;
        const anyHeader = /Верхние ноты:|Сердце аромата:|Средние ноты:|Ноты сердца:|Ноты шлейфа:|Базовые ноты:/i;
        const nextHeader = /(?=\s*(?:Верхние ноты:|Сердце аромата:|Средние ноты:|Ноты сердца:|Ноты шлейфа:|Базовые ноты:)|$)/i;

        // Захватываем заголовок (как в файле) и контент. «Ноты сердца» разбираем так же, как «Сердце аромата» — отдельный блок
        const topNotesMatch = notesText.match(new RegExp('(Верхние ноты:)\\s*([^]*?)' + nextHeader.source, 'i'));
        const heartNotesMatch = notesText.match(new RegExp('(Сердце аромата:|Средние ноты:|Ноты сердца:)\\s*([^]*?)' + nextHeader.source, 'i'));
        const baseNotesMatch = notesText.match(new RegExp('(Ноты шлейфа:|Базовые ноты:)\\s*([^]*?)' + nextHeader.source, 'i'));

        const hasStructuredNotes = notesText.match(anyHeader);
        if (!hasStructuredNotes) return null;

        const trimNotes = (s: string) => s.trim().replace(/\s+/g, ' ');

        const blocks: { header: string; content: string; bg: string; headerCl: string; contentCl: string; maxW: string }[] = [];
        if (topNotesMatch) blocks.push({ header: topNotesMatch[1], content: trimNotes(topNotesMatch[2]), bg: '#FEF3C7', headerCl: 'text-amber-900', contentCl: 'text-amber-800', maxW: 'max-w-md' });
        if (heartNotesMatch) blocks.push({ header: heartNotesMatch[1], content: trimNotes(heartNotesMatch[2]), bg: '#FCE7F3', headerCl: 'text-rose-900', contentCl: 'text-rose-800', maxW: 'max-w-lg' });
        if (baseNotesMatch) blocks.push({ header: baseNotesMatch[1], content: trimNotes(baseNotesMatch[2]), bg: '#FED7AA', headerCl: 'text-orange-900', contentCl: 'text-orange-800', maxW: 'max-w-xl' });

        return (
          <div className="space-y-2 flex flex-col items-start">
            {blocks.map((b, i) => (
              <div key={i} className={cn('py-2 px-4 rounded-md', b.maxW)} style={{ backgroundColor: b.bg }}>
                <span className={cn(b.headerCl)}>{b.header} </span>
                <span className={cn('text-sm', b.contentCl)}>{b.content}</span>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Характеристики товара */}
      {(() => {
        // Проверяем, есть ли структурированные ноты (если да, не показываем topNotes в таблице)
        const hasStructuredNotes = product.topNotes &&
          product.topNotes.match(/Верхние ноты:|Сердце аромата:|Средние ноты:|Ноты сердца:|Ноты шлейфа:|Базовые ноты:/i);
        
        const showTopNotesInTable = product.topNotes && 
          product.topNotes.trim() && 
          product.topNotes.trim() !== '-' && 
          !hasStructuredNotes;
        
        return (product.productCategories && product.productCategories.length > 0) ||
         (product.productType && product.productType.trim() && product.productType.trim() !== '-') ||
         showTopNotesInTable ||
         (product.volume && product.volume.trim() && product.volume.trim() !== '-') ||
         (product.weight && product.weight > 0) ||
         (product.dimensions && product.dimensions.trim() && product.dimensions.trim() !== '-') ||
         (product.purpose && product.purpose.trim() && product.purpose.trim() !== '-') ||
         (product.brandCountry && product.brandCountry.trim() && product.brandCountry.trim() !== '-') ||
         (product.manufactureCountry && product.manufactureCountry.trim() && product.manufactureCountry.trim() !== '-') ||
         (product.barcode && product.barcode.trim() && product.barcode.trim() !== '-');
      })() ? (
        <div className="border rounded-lg p-4 bg-gray-50">
          <h2 className="text-lg font-semibold mb-4">Характеристики</h2>
          <div className="grid gap-x-4 text-sm" style={{ gridTemplateColumns: 'minmax(11rem, max-content) 1fr' }}>
            <span className="py-2 pr-2 border-b border-gray-200 text-muted-foreground font-medium whitespace-nowrap">Бренд:</span>
            <span className="py-2 border-b border-gray-200 min-w-0 break-words">{product.brand.name}</span>

            {product.productCategories && product.productCategories.length > 0 && (
              <>
                <span className="py-2 pr-2 border-b border-gray-200 text-muted-foreground font-medium whitespace-nowrap">Категория:</span>
                <span className="py-2 border-b border-gray-200 min-w-0 break-words">{product.productCategories[0]?.category.name}</span>
              </>
            )}

            {product.productType && product.productType.trim() && product.productType.trim() !== '-' && (
              <>
                <span className="py-2 pr-2 border-b border-gray-200 text-muted-foreground font-medium whitespace-nowrap">Вид товара:</span>
                <span className="py-2 border-b border-gray-200 min-w-0 break-words">{product.productType}</span>
              </>
            )}
            
            {(() => {
              const hasStructuredNotes = product.topNotes &&
                product.topNotes.match(/Верхние ноты:|Сердце аромата:|Средние ноты:|Ноты сердца:|Ноты шлейфа:|Базовые ноты:/i);
              if (!product.topNotes || !product.topNotes.trim() || product.topNotes.trim() === '-' || hasStructuredNotes) return null;
              return (
                <>
                  <span className="py-2 pr-2 border-b border-gray-200 text-muted-foreground font-medium whitespace-nowrap">Основные ноты:</span>
                  <span className="py-2 border-b border-gray-200 min-w-0 break-words">{product.topNotes}</span>
                </>
              );
            })()}

            {product.volume && product.volume.trim() && product.volume.trim() !== '-' && (
              <>
                <span className="py-2 pr-2 border-b border-gray-200 text-muted-foreground font-medium whitespace-nowrap">Объем:</span>
                <span className="py-2 border-b border-gray-200 min-w-0 break-words">{product.volume}</span>
              </>
            )}

            {product.weight && product.weight > 0 && (
              <>
                <span className="py-2 pr-2 border-b border-gray-200 text-muted-foreground font-medium whitespace-nowrap">Вес:</span>
                <span className="py-2 border-b border-gray-200 min-w-0 break-words">{product.weight} г</span>
              </>
            )}

            {product.dimensions && product.dimensions.trim() && product.dimensions.trim() !== '-' && (
              <>
                <span className="py-2 pr-2 border-b border-gray-200 text-muted-foreground font-medium whitespace-nowrap">Размеры:</span>
                <span className="py-2 border-b border-gray-200 min-w-0 break-words">{product.dimensions}</span>
              </>
            )}

            {product.purpose && product.purpose.trim() && product.purpose.trim() !== '-' && (
              <>
                <span className="py-2 pr-2 border-b border-gray-200 text-muted-foreground font-medium whitespace-nowrap">Назначение:</span>
                <span className="py-2 border-b border-gray-200 min-w-0 break-words">{product.purpose}</span>
              </>
            )}

            {product.brandCountry && product.brandCountry.trim() && product.brandCountry.trim() !== '-' && (
              <>
                <span className="py-2 pr-2 border-b border-gray-200 text-muted-foreground font-medium whitespace-nowrap">Страна происхождения бренда:</span>
                <span className="py-2 border-b border-gray-200 min-w-0 break-words">{product.brandCountry}</span>
              </>
            )}

            {product.manufactureCountry && product.manufactureCountry.trim() && product.manufactureCountry.trim() !== '-' && (
              <>
                <span className="py-2 pr-2 border-b border-gray-200 text-muted-foreground font-medium whitespace-nowrap">Страна производства:</span>
                <span className="py-2 border-b border-gray-200 min-w-0 break-words">{product.manufactureCountry}</span>
              </>
            )}

            {product.barcode && product.barcode.trim() && product.barcode.trim() !== '-' && (
              <>
                <span className="py-2 pr-2 border-b border-gray-200 text-muted-foreground font-medium whitespace-nowrap">Штрихкод:</span>
                <span className={cn('py-2 border-b border-gray-200 min-w-0 break-words font-mono')}>{product.barcode}</span>
              </>
            )}
          </div>
        </div>
      ) : (
        // Если нет характеристик, показываем только бренд
        <div className="border rounded-lg p-4 bg-gray-50">
          <h2 className="text-lg font-semibold mb-4">Характеристики</h2>
          <div className="grid gap-x-4 text-sm" style={{ gridTemplateColumns: 'minmax(11rem, max-content) 1fr' }}>
            <span className="py-2 pr-2 border-b border-gray-200 text-muted-foreground font-medium whitespace-nowrap">Бренд:</span>
            <span className="py-2 border-b border-gray-200 min-w-0 break-words">{product.brand.name}</span>
          </div>
        </div>
      )}

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
                      const weightGrams = product.weight != null ? Math.round(Number(product.weight)) : undefined;
                      const cartItem = {
                        id: `${product.id}-${variant.id}`,
                        productId: product.id,
                        name: `${product.name} - ${variant.value}`,
                        price: variant.price,
                        image: (() => {
                          if (product.images && product.images.length > 0) {
                            const firstImage = product.images[0];
                            if (typeof firstImage === 'string') {
                              return firstImage;
                            } else if (firstImage?.url) {
                              return firstImage.url;
                            }
                          }
                          return '/placeholder-product.jpg';
                        })(),
                        weight: weightGrams,
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
              <Heart className={cn("h-4 w-4", isInWishlist && "fill-red-500 text-red-500")} />
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
                isInWishlist ? "fill-red-500 text-red-500" : ""
              )}
            />
            {isInWishlist ? 'В избранном' : 'В избранное'}
          </Button>
        </div>
      )}

      {/* Features - Modern Design */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-4 border border-blue-100 hover:border-blue-200 transition-all hover:shadow-md">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
              <Truck className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Доставка</div>
              <div className="text-sm font-medium text-gray-900 leading-tight">Бесплатная от 15000₽ по СПБ</div>
            </div>
          </div>
        </div>
        
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 p-4 border border-emerald-100 hover:border-emerald-200 transition-all hover:shadow-md">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center transition-colors">
              <Shield className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">Гарантия</div>
              <div className="text-sm font-medium text-gray-900 leading-tight">Качество гарантировано</div>
            </div>
          </div>
        </div>
        
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 p-4 border border-amber-100 hover:border-amber-200 transition-all hover:shadow-md">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-100 group-hover:bg-amber-200 flex items-center justify-center transition-colors">
              <RotateCcw className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Возврат</div>
              <div className="text-sm font-medium text-gray-900 leading-tight">В течение 14 дней</div>
            </div>
          </div>
        </div>
      </div>

      {/* Помощь с заказом */}
      <div className="mt-6 p-4 bg-white rounded-xl border-2 border-primary/20 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <MessageCircle className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-2">Нужна помощь с заказом?</h3>
            <a href="tel:89215990090" className="text-primary hover:underline font-medium block mb-3">
              тел. 8-921-599-00-90
            </a>
            <div className="flex gap-2">
              <Link 
                href="https://wa.me/79217892777" 
                target="_blank"
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                WhatsApp
              </Link>
              <Link 
                href="https://t.me/+79217892777" 
                target="_blank"
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                Telegram
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <Tabs defaultValue="description" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="description">Описание</TabsTrigger>
          <TabsTrigger value="reviews">Отзывы ({reviewCount})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="description" className="mt-4 space-y-6">
          <div className="prose prose-sm max-w-none">
            {product.description ? (
              <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.description) }} />
            ) : (
              <p className="text-muted-foreground">Описание товара отсутствует</p>
            )}
          </div>
          
          {/* Способ применения */}
          {product.usageInstructions && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold text-lg mb-3">Способ применения</h3>
              <div className="text-sm text-muted-foreground whitespace-pre-line">
                {product.usageInstructions}
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="reviews" className="mt-4">
          <div className="space-y-6">
            {/* Список отзывов */}
            <div className="space-y-4">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{review.user?.name || 'Анонимный пользователь'}</span>
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

            {/* Форма для добавления отзыва */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Оставить отзыв</h3>
              <ReviewForm 
                productId={product.id} 
                onSuccess={() => {
                  // Перезагрузить страницу для обновления отзывов
                  window.location.reload();
                }}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
