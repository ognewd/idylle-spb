import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Распродажа - Idylle',
  description: 'Скидки и специальные предложения на парфюмы и товары для дома в Idylle.',
};

export default function SalePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Распродажа</h1>
            <p className="text-xl text-muted-foreground">
              Специальные предложения и скидки на избранные ароматы
            </p>
          </div>

          {/* Sale Categories */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔥</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Горячие предложения</h3>
              <p className="text-muted-foreground mb-4">
                Скидки до 50% на популярные ароматы
              </p>
              <Button variant="outline" asChild>
                <Link href="/catalog?filter_sale=true">
                  Смотреть предложения
                </Link>
              </Button>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⏰</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Ограниченное время</h3>
              <p className="text-muted-foreground mb-4">
                Специальные цены только до конца месяца
              </p>
              <Button variant="outline" asChild>
                <Link href="/catalog?filter_limited=true">
                  Посмотреть
                </Link>
              </Button>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎁</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Подарочные наборы</h3>
              <p className="text-muted-foreground mb-4">
                Выгодные комплекты для подарков
              </p>
              <Button variant="outline" asChild>
                <Link href="/catalog?filter_gift=true">
                  Выбрать набор
                </Link>
              </Button>
            </div>
          </div>

          {/* Current Sales */}
          <div className="bg-muted/30 rounded-lg p-8 mb-16">
            <h2 className="text-2xl font-semibold mb-6 text-center">Текущие акции</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-background rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-2xl">🌸</span>
                  <h3 className="text-lg font-semibold">Весенняя коллекция</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  Скидка 30% на все ароматы весенней коллекции. 
                  Свежие цветочные композиции по специальной цене.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">До 31 марта</span>
                  <Button size="sm" asChild>
                    <Link href="/catalog?filter_category=spring">
                      Купить
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="bg-background rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-2xl">🏠</span>
                  <h3 className="text-lg font-semibold">Домашние ароматы</h3>
                </div>
                <p className="text-muted-foreground mb-4">
                  При покупке 2 товаров для дома третий в подарок. 
                  Создайте уютную атмосферу в вашем доме.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Постоянная акция</span>
                  <Button size="sm" asChild>
                    <Link href="/home">
                      Выбрать
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="bg-primary/5 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Не пропустите лучшие предложения</h2>
            <p className="text-muted-foreground mb-6">
              Подпишитесь на уведомления о скидках и специальных предложениях
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


