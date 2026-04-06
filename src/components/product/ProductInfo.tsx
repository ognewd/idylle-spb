'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Heart,
  ShoppingCart,
  Star,
  Truck,
  Shield,
  RotateCcw,
  MessageCircle,
  Copy,
  Check,
} from 'lucide-react';
import { cn, getReviewWord } from '@/lib/utils';
import { sanitizeHtml } from '@/lib/sanitize';
import { useCart } from '@/contexts/CartContext';
import { ReviewForm } from './ReviewForm';
import { ProductWantAsGift } from './ProductWantAsGift';
import { ContactRequestForm } from '@/components/contact/ContactRequestForm';

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

function SpecRow({
  label,
  children,
  valueClassName,
}: {
  label: string;
  children: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 py-3.5 transition-colors hover:bg-neutral-50/80 sm:flex-row sm:items-start sm:gap-8">
      <span className="shrink-0 text-sm font-medium text-neutral-500 sm:w-52">{label}</span>
      <div
        className={cn(
          'min-w-0 flex-1 break-words text-sm font-semibold text-neutral-900',
          valueClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function ProductInfo({ product, className }: ProductInfoProps) {
  const searchParams = useSearchParams();
  const isDealerShowcase = searchParams.get('dealer') === '1';
  const { addItem } = useCart();
  
  // Find default variant or use first one
  const defaultVariant = product.variants?.find(v => v.isDefault) || product.variants?.[0] || null;
  
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(defaultVariant);
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [copiedImo, setCopiedImo] = useState(false);

  const handleCopyImoNumber = async () => {
    try {
      await navigator.clipboard.writeText('+7-921-789-27-77');
      setCopiedImo(true);
      setTimeout(() => setCopiedImo(false), 1800);
    } catch {
      // ignore clipboard errors silently
    }
  };

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

  const hasStructuredNotesInTable =
    !!product.topNotes &&
    !!product.topNotes.match(
      /Верхние ноты:|Сердце аромата:|Средние ноты:|Ноты сердца:|Ноты шлейфа:|Базовые ноты:/i
    );

  const showTopNotesInTable =
    !!product.topNotes &&
    product.topNotes.trim() !== '' &&
    product.topNotes.trim() !== '-' &&
    !hasStructuredNotesInTable;

  const hasExtendedSpecs =
    (product.productCategories && product.productCategories.length > 0) ||
    (product.productType && product.productType.trim() && product.productType.trim() !== '-') ||
    !!showTopNotesInTable ||
    (product.volume && product.volume.trim() && product.volume.trim() !== '-') ||
    (product.weight && product.weight > 0) ||
    (product.dimensions && product.dimensions.trim() && product.dimensions.trim() !== '-') ||
    (product.purpose && product.purpose.trim() && product.purpose.trim() !== '-') ||
    (product.brandCountry && product.brandCountry.trim() && product.brandCountry.trim() !== '-') ||
    (product.manufactureCountry && product.manufactureCountry.trim() && product.manufactureCountry.trim() !== '-') ||
    (product.barcode && product.barcode.trim() && product.barcode.trim() !== '-');

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

  const handleDealerContentLinkGuard = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDealerShowcase) return;
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');
    if (!anchor) return;
    const href = anchor.getAttribute('href') || '';
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

    try {
      const url = new URL(href, window.location.origin);
      const isInternal = url.origin === window.location.origin;
      if (!isInternal) return;

      const allowedPrefixes = ['/catalog', '/cart', '/checkout', '/admin'];
      const allowed = allowedPrefixes.some((prefix) => url.pathname.startsWith(prefix));
      if (!allowed) {
        e.preventDefault();
        e.stopPropagation();
      }
    } catch {
      // ignore parsing errors
    }
  };

  return (
    <div className={cn('space-y-5', className)}>
      {/* Brand */}
      {isDealerShowcase ? (
        <span className="text-sm font-normal text-neutral-400">{product.brand.name}</span>
      ) : (
        <Link
          href={`/catalog?brand=${product.brand.slug}`}
          className="text-sm font-normal text-neutral-400 transition-colors hover:text-neutral-600"
        >
          {product.brand.name}
        </Link>
      )}

      {/* Product Name - используем shortName если есть, иначе name */}
      <h1 className="text-2xl font-semibold leading-snug tracking-tight text-neutral-900 lg:text-[1.65rem]">
        {product.shortName || product.name}
      </h1>

      {/* Rating and Reviews */}
      {reviewCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'h-5 w-5',
                  i < Math.floor(averageRating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-neutral-300'
                )}
              />
            ))}
          </div>
          <span className="text-sm text-neutral-600">
            <span className="font-medium text-neutral-900">{averageRating.toFixed(1)}</span>
            {' '}
            ({reviewCount} {getReviewWord(reviewCount)})
          </span>
        </div>
      )}

      {/* Price */}
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="text-2xl font-normal tracking-tight text-neutral-900 lg:text-[1.75rem] tabular-nums">
          {finalPrice.toLocaleString('ru-RU')} ₽
        </span>
        {finalComparePrice && (
          <span className="text-lg text-neutral-400 line-through">
            {finalComparePrice.toLocaleString('ru-RU')} ₽
          </span>
        )}
        {discountPercentage > 0 && (
          <span className="inline-flex items-center rounded-md bg-neutral-900 px-2 py-0.5 text-xs font-semibold text-white">
            −{discountPercentage}%
          </span>
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

        const blocks: { header: string; content: string }[] = [];
        if (topNotesMatch) blocks.push({ header: topNotesMatch[1], content: trimNotes(topNotesMatch[2]) });
        if (heartNotesMatch) blocks.push({ header: heartNotesMatch[1], content: trimNotes(heartNotesMatch[2]) });
        if (baseNotesMatch) blocks.push({ header: baseNotesMatch[1], content: trimNotes(baseNotesMatch[2]) });

        const noteBars = [
          { bg: 'bg-[#FEF9C7]', label: 'text-amber-900', body: 'text-amber-900/90' },
          { bg: 'bg-[#FCE7F3]', label: 'text-pink-900', body: 'text-pink-900/90' },
          { bg: 'bg-[#FFEDD5]', label: 'text-orange-950', body: 'text-orange-900/90' },
        ] as const;

        return (
          <div className="flex flex-col gap-2">
            {blocks.map((b, i) => {
              const t = noteBars[i % noteBars.length];
              return (
                <div key={i} className={cn('rounded-lg px-3.5 py-2.5', t.bg)}>
                  <p className={cn('text-[13px] leading-snug', t.body)}>
                    <span className={cn('font-semibold', t.label)}>{b.header} </span>
                    {b.content}
                  </p>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* Variants */}
      {product.variants && product.variants.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-base font-semibold tracking-tight text-neutral-900">
            {product.variants[0]?.name || 'Варианты'}:
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {product.variants.map((variant) => {
              const isSelected = selectedVariant?.id === variant.id;
              const variantDiscount = variant.comparePrice
                ? Math.round(((variant.comparePrice - variant.price) / variant.comparePrice) * 100)
                : 0;
              
              return (
                <div
                  key={variant.id}
                  className={cn(
                    'relative rounded-xl border bg-white p-5 transition-shadow duration-200',
                    'hover:border-neutral-300 hover:shadow-sm',
                    isSelected
                      ? 'border-neutral-900 shadow-sm ring-1 ring-neutral-900'
                      : 'border-neutral-200'
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
                    className="w-full rounded-xl bg-neutral-900 font-semibold text-white shadow-none transition-colors hover:bg-neutral-800 disabled:opacity-50"
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
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-neutral-700">Количество:</span>
              <div className="flex h-9 items-center overflow-hidden rounded-lg border border-neutral-300 bg-white">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 rounded-none px-2.5 text-neutral-700 hover:bg-neutral-50"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  −
                </Button>
                <span className="min-w-[2.25rem] px-1.5 text-center text-sm font-medium tabular-nums text-neutral-900">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 rounded-none px-2.5 text-neutral-700 hover:bg-neutral-50"
                  onClick={() => setQuantity(Math.min(finalStock, quantity + 1))}
                  disabled={quantity >= finalStock}
                >
                  +
                </Button>
              </div>
            </div>
            {finalStock > 0 && finalStock < 10 && (
              <span className="text-sm text-orange-600">Осталось {finalStock} шт.</span>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              className="h-10 flex-1 rounded-xl bg-neutral-900 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
              size="lg"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {isOutOfStock ? 'Нет в наличии' : 'В корзину'}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-10 w-10 shrink-0 rounded-xl border-neutral-300 bg-white p-0 text-neutral-900 hover:bg-neutral-50"
              onClick={handleAddToWishlist}
              aria-label={isInWishlist ? 'Убрать из избранного' : 'В избранное'}
            >
              <Heart
                className={cn('mx-auto h-5 w-5', isInWishlist ? 'fill-red-500 text-red-500' : 'text-neutral-900')}
              />
            </Button>
          </div>
        </div>
      )}
      
      {/* Wishlist button for products with variants */}
      {product.variants && product.variants.length > 0 && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="lg"
            onClick={handleAddToWishlist}
            className="h-11 rounded-xl border-neutral-300 bg-white px-5 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
          >
            <Heart
              className={cn(
                'mr-2 h-4 w-4',
                isInWishlist ? 'fill-red-500 text-red-500' : 'text-neutral-900'
              )}
            />
            {isInWishlist ? 'В избранном' : 'В избранное'}
          </Button>
        </div>
      )}

      <ProductWantAsGift
        productName={product.shortName || product.name}
        productSlug={product.slug}
        className="h-10 w-full justify-center sm:justify-center"
      />

      {/* Product Details Tabs */}
      <Tabs defaultValue="description" className="w-full">
        <TabsList className="mb-0 flex h-auto w-full flex-wrap justify-center gap-6 rounded-none border-0 border-b border-neutral-200 bg-transparent p-0 pb-0 shadow-none sm:gap-10">
          <TabsTrigger
            value="description"
            className="-mb-px rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 py-3 text-sm font-medium text-neutral-500 shadow-none ring-offset-0 transition-colors hover:text-neutral-800 data-[state=active]:!bg-transparent data-[state=active]:border-neutral-900 data-[state=active]:text-neutral-900 data-[state=active]:shadow-none"
          >
            Описание
          </TabsTrigger>
          <TabsTrigger
            value="specs"
            className="-mb-px rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 py-3 text-sm font-medium text-neutral-500 shadow-none ring-offset-0 transition-colors hover:text-neutral-800 data-[state=active]:!bg-transparent data-[state=active]:border-neutral-900 data-[state=active]:text-neutral-900 data-[state=active]:shadow-none"
          >
            Характеристики
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="-mb-px rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 py-3 text-sm font-medium text-neutral-500 shadow-none ring-offset-0 transition-colors hover:text-neutral-800 data-[state=active]:!bg-transparent data-[state=active]:border-neutral-900 data-[state=active]:text-neutral-900 data-[state=active]:shadow-none"
          >
            Отзывы ({reviewCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-8 space-y-6">
          <div
            className="prose prose-sm max-w-none text-neutral-800"
            onClickCapture={handleDealerContentLinkGuard}
          >
            {product.description ? (
              <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.description) }} />
            ) : (
              <p className="text-muted-foreground">Описание товара отсутствует</p>
            )}
          </div>

          {product.usageInstructions && (
            <div className="rounded-xl bg-neutral-100 p-6">
              <h3 className="mb-3 text-lg font-semibold text-neutral-900">Способ применения</h3>
              <div className="whitespace-pre-line text-sm leading-relaxed text-neutral-700">
                {product.usageInstructions}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="specs" className="mt-8">
          <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-6">
            <div className="divide-y divide-neutral-200">
              <SpecRow label="Бренд:">{product.brand.name}</SpecRow>
              {hasExtendedSpecs && (
                <>
                  {product.productCategories && product.productCategories.length > 0 && (
                    <SpecRow label="Категория:">{product.productCategories[0]?.category.name}</SpecRow>
                  )}

                  {product.productType && product.productType.trim() && product.productType.trim() !== '-' && (
                    <SpecRow label="Вид товара:">{product.productType}</SpecRow>
                  )}

                  {showTopNotesInTable && (
                    <SpecRow label="Основные ноты:">{product.topNotes}</SpecRow>
                  )}

                  {product.volume && product.volume.trim() && product.volume.trim() !== '-' && (
                    <SpecRow label="Объем:">{product.volume}</SpecRow>
                  )}

                  {product.weight && product.weight > 0 && (
                    <SpecRow label="Вес:">{product.weight} г</SpecRow>
                  )}

                  {product.dimensions && product.dimensions.trim() && product.dimensions.trim() !== '-' && (
                    <SpecRow label="Размеры:">{product.dimensions}</SpecRow>
                  )}

                  {product.purpose && product.purpose.trim() && product.purpose.trim() !== '-' && (
                    <SpecRow label="Назначение:">{product.purpose}</SpecRow>
                  )}

                  {product.brandCountry && product.brandCountry.trim() && product.brandCountry.trim() !== '-' && (
                    <SpecRow label="Страна происхождения бренда:">{product.brandCountry}</SpecRow>
                  )}

                  {product.manufactureCountry && product.manufactureCountry.trim() && product.manufactureCountry.trim() !== '-' && (
                    <SpecRow label="Страна производства:">{product.manufactureCountry}</SpecRow>
                  )}

                  {product.barcode && product.barcode.trim() && product.barcode.trim() !== '-' && (
                    <SpecRow label="Штрихкод:" valueClassName="font-mono font-normal tracking-wide">
                      {product.barcode}
                    </SpecRow>
                  )}
                </>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-8">
          <div className="space-y-6">
            {/* Список отзывов */}
            <div className="space-y-3">
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

      {/* Features */}
      <div className="mt-1.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-2.5">
        <div className="flex gap-2.5 rounded-xl border border-blue-100 bg-blue-50/60 p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <Truck className="h-4 w-4" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-neutral-900">Бесплатная доставка</p>
            <p className="mt-0.5 text-xs leading-relaxed text-neutral-600">
              От 15&nbsp;000&nbsp;₽ по Санкт-Петербургу
            </p>
          </div>
        </div>

        <div className="flex gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
            <Shield className="h-4 w-4" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-neutral-900">Гарантия качества</p>
            <p className="mt-0.5 text-xs leading-relaxed text-neutral-600">
              Только оригинальная продукция
            </p>
          </div>
        </div>

        <div className="flex gap-2.5 rounded-xl border border-amber-100 bg-amber-50/60 p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
            <RotateCcw className="h-4 w-4" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-neutral-900">Возврат 14 дней</p>
            <p className="mt-0.5 text-xs leading-relaxed text-neutral-600">Без лишних вопросов</p>
          </div>
        </div>
      </div>

      {/* Помощь с заказом */}
      <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
            <MessageCircle className="h-4 w-4" aria-hidden />
          </div>
          <div className="flex-1">
            <h3 className="mb-1 font-semibold text-neutral-900">Нужна помощь с заказом?</h3>
            <p className="mb-2 text-xs text-neutral-500">
              Оставьте обращение — ответим удобным для вас способом.
            </p>
            <a href="tel:88005008729" className="block text-sm font-medium text-neutral-900 hover:underline">
              8-800-500-87-29
            </a>
            <a href="tel:+79215990090" className="mb-2 block text-sm font-medium text-neutral-900 hover:underline">
              +7-921-599-00-90
            </a>
            <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="mb-2 rounded-md border-neutral-300 bg-white text-xs font-medium text-neutral-900 hover:bg-neutral-50"
                >
                  Задать вопрос
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[640px]">
                <DialogHeader>
                  <DialogTitle>Задать вопрос по товару</DialogTitle>
                </DialogHeader>
                <ContactRequestForm
                  productName={product.shortName || product.name}
                  productUrl={typeof window !== 'undefined' ? window.location.href : ''}
                  submitText="Отправить заявку"
                  compact
                />
              </DialogContent>
            </Dialog>
            <div className="flex gap-1.5">
              <Link
                href="https://vk.me/idylle_spb"
                target="_blank"
                className="flex items-center gap-1.5 rounded-md bg-[#0077FF] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:opacity-90"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12.785 16.24s.287-.032.434-.193c.135-.148.131-.428.131-.428s-.019-1.307.592-1.5c.602-.19 1.375 1.263 2.195 1.82.62.422 1.091.33 1.091.33l2.19-.03s1.145-.071.602-.97c-.044-.074-.313-.66-1.612-1.86-1.36-1.256-1.178-1.052.46-3.236.998-1.33 1.396-2.141 1.271-2.49-.12-.333-.86-.245-.86-.245l-2.467.016s-.183-.025-.318.056c-.132.08-.216.266-.216.266s-.39 1.034-.909 1.915c-1.096 1.86-1.534 1.958-1.713 1.843-.416-.268-.312-1.075-.312-1.648 0-1.793.272-2.54-.529-2.733-.266-.064-.463-.107-1.145-.113-.876-.009-1.617.003-2.035.207-.278.136-.492.44-.361.458.162.021.528.099.722.364.25.342.242 1.11.242 1.11s.146 2.111-.34 2.374c-.334.18-.793-.188-1.778-1.876-.504-.865-.885-1.822-.885-1.822s-.073-.178-.202-.273c-.157-.115-.377-.153-.377-.153l-2.346.016s-.352.01-.48.166c-.114.138-.009.423-.009.423s1.837 4.298 3.915 6.466c1.905 1.987 4.07 1.856 4.07 1.856Z" />
                </svg>
                <span>VK</span>
              </Link>
              <Link 
                href="https://wa.me/79217892777" 
                target="_blank"
                className="flex items-center gap-1.5 rounded-md bg-green-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-600"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                WhatsApp
              </Link>
              <Link 
                href="https://t.me/+79217892777" 
                target="_blank"
                className="flex items-center gap-1.5 rounded-md bg-blue-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-600"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                Telegram
              </Link>
              <button
                type="button"
                onClick={handleCopyImoNumber}
                className="flex items-center gap-1.5 rounded-md bg-neutral-100 px-2.5 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-200"
                title="Скопировать номер IMO"
              >
                {copiedImo ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedImo ? 'Скопировано' : 'IMO: +7-921-789-27-77'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
