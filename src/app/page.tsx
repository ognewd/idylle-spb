import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Star, 
  Truck, 
  MapPin, 
  Gift,
  Heart,
  ShoppingCart
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900 py-24 lg:py-32 overflow-hidden">
        {/* Animated Cloud Background */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          {/* Fog/Mist Animation */}
          <div className="fog-container absolute inset-0">
            <div className="fog-1"></div>
            <div className="fog-2"></div>
            <div className="fog-3"></div>
            <div className="fog-4"></div>
          </div>
          
          {/* Spray Particles Animation */}
          <div className="particles-container absolute inset-0">
            <div className="particle particle-1"></div>
            <div className="particle particle-2"></div>
            <div className="particle particle-3"></div>
            <div className="particle particle-4"></div>
            <div className="particle particle-5"></div>
            <div className="particle particle-6"></div>
            <div className="particle particle-7"></div>
            <div className="particle particle-8"></div>
            <div className="particle particle-9"></div>
            <div className="particle particle-10"></div>
            <div className="particle particle-11"></div>
            <div className="particle particle-12"></div>
            <div className="particle particle-13"></div>
            <div className="particle particle-14"></div>
            <div className="particle particle-15"></div>
          </div>
          
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-slate-800/60 to-amber-900/70"></div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-200/20 to-pink-200/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-amber-200/20 to-orange-200/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-8 mb-16">
              {/* Main Heading */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-600 bg-clip-text text-transparent drop-shadow-lg">
                  Мир ароматов
                </span>
                <br />
                <span className="text-white drop-shadow-lg">начинается здесь</span>
              </h1>
              
              {/* Subtitle */}
              <p className="text-xl md:text-2xl text-gray-100 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
                Откройте для себя уникальные парфюмерные коллекции от ведущих мировых брендов
              </p>
              
              {/* Location */}
              <div className="flex items-center justify-center gap-3 bg-white/90 backdrop-blur-md rounded-full px-6 py-3 w-fit mx-auto shadow-xl border border-white/20">
                <MapPin className="w-5 h-5 text-amber-600" />
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-900">Наш бутик в центре СПб</p>
                  <p className="text-xs text-gray-700">Невский пр., 114-116, ТЦ Невский центр, 4 этаж</p>
                </div>
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Button size="lg" className="px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all" asChild>
                  <Link href="/catalog">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Выбрать аромат
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="px-8 py-6 text-lg border-2" asChild>
                  <Link href="/brands">
                    <Heart className="mr-2 h-5 w-5" />
                    Наши бренды
                  </Link>
                </Button>
              </div>
              
              {/* Stats */}
              <div className="flex flex-wrap items-center justify-center gap-8 pt-8">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Star className="w-5 h-5 text-amber-300 fill-current drop-shadow-sm" />
                  <span className="text-sm font-semibold text-white drop-shadow-md">Премиум-качество</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Truck className="w-5 h-5 text-emerald-300 drop-shadow-sm" />
                  <span className="text-sm font-semibold text-white drop-shadow-md">Бесплатная доставка</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Gift className="w-5 h-5 text-rose-300 drop-shadow-sm" />
                  <span className="text-sm font-semibold text-white drop-shadow-md">Скидка новым клиентам</span>
                </div>
              </div>
            </div>
            
            {/* Hero Image */}
            <div className="relative max-w-4xl mx-auto">
              <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-orange-100 to-pink-100">
                <div className="w-full h-full flex items-center justify-center p-8">
                  <div className="text-center space-y-4">
                    <div className="text-9xl">🌟</div>
                    <h3 className="text-3xl font-bold text-gray-800">Персональный выбор</h3>
                    <p className="text-gray-600">Консультация и подбор уникальных ароматов</p>
                  </div>
                </div>
              </div>
              {/* Floating Cards */}
              <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-4 border border-white/30 hidden lg:block">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-2xl">✨</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">500+ ароматов</p>
                    <p className="text-xs text-gray-600 font-medium">Эксклюзивные коллекции</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-4 border border-white/30 hidden lg:block">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Лучшие бренды</p>
                    <p className="text-xs text-gray-600 font-medium">Мировые лидеры</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Truck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Бесплатная доставка</h3>
              <p className="text-muted-foreground">
                Доставляем заказы по Санкт-Петербургу бесплатно при покупке от 5000₽
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Бутик в центре города</h3>
              <p className="text-muted-foreground">
                Посетите наш бутик в ТЦ Невский Центр (Стокманн), 4 этаж, Невский пр., 114-116
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Gift className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">10% скидка на первый заказ</h3>
              <p className="text-muted-foreground">
                Оформите первый заказ и получите скидку 10% на всю корзину
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold">Популярные категории</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Откройте для себя наши самые популярные коллекции парфюмов и товаров для дома
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="group cursor-pointer overflow-hidden">
              <Link href="/aromaty-dlya-doma">
                <div className="aspect-[4/3] bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="text-6xl">🏠</div>
                    <h3 className="text-xl font-semibold">Ароматы для дома</h3>
                    <p className="text-muted-foreground">Создайте неповторимую атмосферу</p>
                  </div>
                </div>
              </Link>
            </Card>
            
            <Card className="group cursor-pointer overflow-hidden">
              <Link href="/uyut-i-interer">
                <div className="aspect-[4/3] bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="text-6xl">✨</div>
                    <h3 className="text-xl font-semibold">Уют и интерьер</h3>
                    <p className="text-muted-foreground">Товары для уюта</p>
                  </div>
                </div>
              </Link>
            </Card>
            
            <Card className="group cursor-pointer overflow-hidden">
              <Link href="/podarki">
                <div className="aspect-[4/3] bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="text-6xl">🎁</div>
                    <h3 className="text-xl font-semibold">Подарки</h3>
                    <p className="text-muted-foreground">Идеальные подарки для близких</p>
                  </div>
                </div>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold">
              Подпишитесь на рассылку
            </h2>
            <p className="text-xl opacity-90">
              Получайте эксклюзивные предложения и первыми узнавайте о новинках
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Ваш email"
                className="flex-1 px-4 py-2 rounded-md text-foreground"
              />
              <Button variant="secondary" size="lg">
                Подписаться
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
