'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Heart, ShoppingCart, Star, X, Minus, Plus, ZoomIn } from 'lucide-react';
import { cn, getReviewWord } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { getImageUrl } from '@/lib/image-url';
import { ImageLightbox } from './ImageLightbox';

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

interface QuickViewProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  seasonalDiscount?: {
    id: string;
    name: string;
    discount: number;
  };
  images: Array<{
    url: string;
    alt?: string;
    isPrimary?: boolean;
  }> | string[];
  brand: {
    name: string;
    slug: string;
  };
  description?: string;
  volume?: string;
  aromaFamily?: string;
  gender?: string;
  ingredients?: string;
  stock: number;
  weight?: number;
  variants?: ProductVariant[];
  rating?: number;
  reviewCount?: number;
}

interface QuickViewProps {
  product: QuickViewProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: () => void;
}

export function QuickView({ product, isOpen, onClose, onAddToCart }: QuickViewProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Блокируем прокрутку только если открыт QuickView (но не lightbox)
  useEffect(() => {
    if (isOpen && !isLightboxOpen) {
      // Сохраняем текущую позицию прокрутки
      const scrollY = window.scrollY;
      
      // Блокируем прокрутку на body
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
      
      // Блокируем прокрутку на html
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.height = '100vh';
    } else if (!isOpen && !isLightboxOpen) {
      // Восстанавливаем прокрутку
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
      
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    return () => {
      if (!isLightboxOpen) {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        document.body.style.height = '';
        document.documentElement.style.overflow = '';
        document.documentElement.style.height = '';
      }
    };
  }, [isOpen, isLightboxOpen]);

  useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      const sorted = [...product.variants].sort((a, b) => a.price - b.price);
      setSelectedVariant(sorted[0]);
    }
    // Сбрасываем индекс изображения при открытии нового товара
    setCurrentImageIndex(0);
    setQuantity(1);
  }, [product]);

  if (!product) return null;

  // Нормализуем изображения: преобразуем строки в объекты с url
  const normalizedImages = product.images 
    ? product.images.map((img: any) => {
        let url: string;
        if (typeof img === 'string') {
          url = img;
        } else {
          url = img.url || img;
        }
        // Используем getImageUrl для правильной обработки путей
        return { url: getImageUrl(url), alt: (typeof img === 'object' ? img.alt : undefined) || product.name };
      })
    : [];

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentComparePrice = selectedVariant ? selectedVariant.comparePrice : product.comparePrice;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const isOutOfStock = currentStock === 0;

  const discountPercentage = product.seasonalDiscount
    ? product.seasonalDiscount.discount
    : currentComparePrice
    ? Math.round(((currentComparePrice - currentPrice) / currentComparePrice) * 100)
    : 0;

  const handleAddToCart = () => {
    const imageUrl = normalizedImages.length > 0
      ? normalizedImages[0]?.url || '/placeholder-product.jpg'
      : '/placeholder-product.jpg';

    // Add quantity times
    const weightGrams = product.weight != null ? Math.round(Number(product.weight)) : undefined;
    for (let i = 0; i < quantity; i++) {
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
    }

    onAddToCart?.();
  };

  const handleVariantChange = (variantId: string) => {
    const variant = product.variants?.find(v => v.id === variantId);
    if (variant) {
      setSelectedVariant(variant);
      setQuantity(1); // Reset quantity when variant changes
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={true}>
      <DialogContent 
        className="max-w-5xl max-h-[90vh] overflow-y-auto p-0 z-[101]"
        onInteractOutside={(e) => {
          // Закрываем при клике вне модального окна
          onClose();
        }}
        onEscapeKeyDown={onClose}
      >
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="sr-only">Быстрый просмотр</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 pb-6">
          {/* Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-muted overflow-visible flex items-center justify-center" style={{ minHeight: '300px' }}>
              {normalizedImages.length > 0 ? (
                <div className="relative w-full max-w-full group/image">
                  <img
                    src={normalizedImages[currentImageIndex]?.url || '/placeholder-product.jpg'}
                    alt={normalizedImages[currentImageIndex]?.alt || product.name}
                    className="w-full h-auto max-w-full cursor-zoom-in"
                    style={{ objectFit: 'contain' }}
                    onClick={() => setIsLightboxOpen(true)}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-product.jpg';
                    }}
                  />
                  {/* Кнопка увеличения */}
                  <button
                    onClick={() => setIsLightboxOpen(true)}
                    className="absolute top-2 right-2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover/image:opacity-100 transition-opacity"
                    aria-label="Увеличить изображение"
                  >
                    <ZoomIn className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">Нет изображения</p>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {normalizedImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {normalizedImages.map((image, index) => (
                  <button
                    key={index}
                    className={cn(
                      "relative bg-muted overflow-hidden rounded transition-opacity aspect-square",
                      index === currentImageIndex ? "opacity-100 ring-2 ring-primary" : "opacity-70 hover:opacity-100"
                    )}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img
                      src={image.url}
                      alt={image.alt || product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-product.jpg';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            {/* Brand */}
            <div className="text-sm text-muted-foreground">
              {product.brand.name}
            </div>

            {/* Name */}
            <h2 className="text-2xl font-bold">{product.name}</h2>

            {/* Rating */}
            {product.rating && product.reviewCount && (
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        i < Math.floor(product.rating!)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  ({product.reviewCount} {getReviewWord(product.reviewCount)})
                </span>
              </div>
            )}

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-primary">
                  {currentPrice.toLocaleString('ru-RU')} ₽
                </span>
                {currentComparePrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    {currentComparePrice.toLocaleString('ru-RU')} ₽
                  </span>
                )}
                {discountPercentage > 0 && (
                  <Badge variant="destructive" className="text-sm">
                    -{discountPercentage}%
                  </Badge>
                )}
              </div>

              {product.seasonalDiscount && (
                <p className="text-sm text-green-600 font-medium">
                  🎉 {product.seasonalDiscount.name}
                </p>
              )}
            </div>

            <Separator />

            {/* Product Details: объём и нота аромата в том же стиле, что в карточках */}
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {product.volume && (
                <span className="inline-flex items-center px-2 py-1 rounded-md font-medium bg-neutral-100 text-neutral-700">
                  {product.volume}
                </span>
              )}
              {product.aromaFamily && (
                <span className="inline-flex items-center px-2 py-1 rounded-md font-medium bg-amber-100 text-amber-900">
                  {product.aromaFamily}
                </span>
              )}
              {product.gender && (
                <span className="inline-flex items-center px-2 py-1 rounded-md font-medium bg-neutral-100 text-neutral-700">
                  {product.gender === 'men' ? 'Мужской' : product.gender === 'women' ? 'Женский' : 'Унисекс'}
                </span>
              )}
            </div>

            <Separator />

            {/* Variant Selector */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Выберите объем:
                </label>
                <Select
                  value={selectedVariant?.id}
                  onValueChange={handleVariantChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Выберите объем" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.variants.map((variant) => (
                      <SelectItem key={variant.id} value={variant.id}>
                        {variant.value} - {variant.price.toLocaleString('ru-RU')} ₽
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Количество:
                </label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity === 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    disabled={quantity >= currentStock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground ml-auto">
                    В наличии: {currentStock} шт.
                  </span>
                </div>
              </div>
            )}

            {/* Stock Status */}
            {currentStock === 0 ? (
              <Badge variant="secondary" className="w-full justify-center py-2">
                Нет в наличии
              </Badge>
            ) : currentStock < 10 ? (
              <Badge variant="destructive" className="w-full justify-center py-2">
                Осталось только {currentStock} шт.
              </Badge>
            ) : null}

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                className="flex-1"
                size="lg"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                В корзину {quantity > 1 && `(${quantity})`}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12"
              >
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            {/* Description */}
            {product.description && (
              <>
                <Separator />
                <div>
                  <h3 className="font-medium mb-2">Описание</h3>
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
      
      {/* Lightbox для полноэкранного просмотра изображения */}
      {normalizedImages.length > 0 && (
        <ImageLightbox
          images={normalizedImages}
          currentIndex={currentImageIndex}
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          productName={product.name}
        />
      )}
    </Dialog>
  );
}



