'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Trash2, ArrowLeft, ShoppingCart } from 'lucide-react';

export default function WishlistPage() {
  const { items, remove, clear } = useWishlist();
  const { addItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Избранное</h1>
          <Link href="/catalog" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Вернуться к каталогу
          </Link>
        </div>
        <p className="text-muted-foreground">Вы ещё не добавили товары в избранное.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Избранное</h1>
        <Button variant="outline" size="sm" onClick={clear}>
          <Trash2 className="h-4 w-4 mr-2" />
          Очистить список
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map(item => (
          <div key={item.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <Link href={`/catalog/${item.slug}`} className="block">
              <div className="relative aspect-square bg-muted">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>
            </Link>
            <div className="p-4 space-y-2">
              <Link href={`/catalog/${item.slug}`} className="block font-medium hover:text-primary">
                {item.name}
              </Link>
              <div className="flex items-center justify-between">
                <span className="font-semibold">{item.price.toLocaleString('ru-RU')} ₽</span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      addItem({
                        id: item.id,
                        productId: item.id,
                        name: item.name,
                        price: item.price,
                        image: item.image,
                      })
                    }
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    В корзину
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => remove(item.id)} title="Удалить">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


