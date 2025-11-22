'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Heart, ShoppingCart, Star, X, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';

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
  }>;
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

  useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      const sorted = [...product.variants].sort((a, b) => a.price - b.price);
      setSelectedVariant(sorted[0]);
    }
  }, [product]);

  if (!product) return null;

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
    const imageUrl = product.images && product.images.length > 0
      ? product.images[0]?.url || '/placeholder-product.jpg'
      : '/placeholder-product.jpg';

    // Add quantity times
    for (let i = 0; i < quantity; i++) {
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Быстрый просмотр</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[currentImageIndex]?.url || '/placeholder-product.jpg'}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  Нет изображения
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    className={cn(
                      "relative aspect-square bg-muted rounded-lg overflow-hidden border-2 transition-colors",
                      index === currentImageIndex ? "border-primary" : "border-transparent"
                    )}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt || product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 25vw, 12.5vw"
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
                  ({product.reviewCount} отзывов)
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

            {/* Product Details */}
            <div className="space-y-2 text-sm">
              {product.volume && (
                <div>
                  <span className="text-muted-foreground">Объем: </span>
                  <span className="font-medium">{product.volume}</span>
                </div>
              )}
              {product.aromaFamily && (
                <div>
                  <span className="text-muted-foreground">Семейство: </span>
                  <span className="font-medium">{product.aromaFamily}</span>
                </div>
              )}
              {product.gender && (
                <div>
                  <span className="text-muted-foreground">Для: </span>
                  <span className="font-medium">
                    {product.gender === 'men' ? 'Мужской' : product.gender === 'women' ? 'Женский' : 'Унисекс'}
                  </span>
                </div>
              )}
              {product.ingredients && (
                <div>
                  <span className="text-muted-foreground">Состав: </span>
                  <span className="font-medium">{product.ingredients}</span>
                </div>
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
    </Dialog>
  );
}



