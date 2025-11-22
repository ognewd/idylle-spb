'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product/ProductCard';

export default function NewPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products?limit=12');
        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Новинки</h1>
            <p className="text-xl text-muted-foreground">
              Откройте для себя самые свежие ароматы и новинки сезона
            </p>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {products.map((product: any) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToWishlist={(id) => console.log('Add to wishlist:', id)}
                  onAddToCart={(id) => console.log('Add to cart:', id)}
                  onQuickView={(id) => console.log('Quick view:', id)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-muted/30 rounded-lg p-8 mb-16 text-center">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-semibold mb-4">Скоро в продаже</h2>
                <p className="text-muted-foreground mb-6">
                  Мы работаем над добавлением новых ароматов и товаров. 
                  Следите за обновлениями нашего каталога!
                </p>
                
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-background rounded-lg p-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🌸</span>
                    </div>
                    <h3 className="font-semibold mb-2">Весенние ароматы</h3>
                    <p className="text-sm text-muted-foreground">
                      Свежие цветочные композиции
                    </p>
                  </div>
                  
                  <div className="bg-background rounded-lg p-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🏠</span>
                    </div>
                    <h3 className="font-semibold mb-2">Домашние ароматы</h3>
                    <p className="text-sm text-muted-foreground">
                      Новые коллекции для дома
                    </p>
                  </div>
                  
                  <div className="bg-background rounded-lg p-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">💼</span>
                    </div>
                    <h3 className="font-semibold mb-2">Бизнес ароматы</h3>
                    <p className="text-sm text-muted-foreground">
                      Профессиональные решения
                    </p>
                  </div>
                </div>
                
                <Button asChild>
                  <Link href="/catalog">
                    Посмотреть каталог
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {/* Newsletter Subscription */}
          <div className="bg-primary/5 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Узнавайте о новинках первыми</h2>
            <p className="text-muted-foreground mb-6">
              Подпишитесь на рассылку и получайте уведомления о новых поступлениях
            </p>
            
            <div className="max-w-md mx-auto flex gap-4">
              <input
                type="email"
                placeholder="Ваш email"
                className="flex-1 px-4 py-2 border border-input rounded-md bg-background"
              />
              <Button>Подписаться</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
