'use client';

import Link from 'next/link';
import { MapPin, BookOpen } from 'lucide-react';

export type HeroProduct = {
  id: string;
  name: string;
  shortName?: string | null;
  slug: string;
  price: number;
  image: string;
  brandName?: string;
  category?: string;
  badge?: string;
};

type HeroSectionProps = {
  product?: HeroProduct | null;
};

export function HeroSection({ product }: HeroSectionProps) {
  return (
    <section className="relative min-h-[600px] bg-gradient-to-br from-[#FFF9F0] via-[#F8F8F8] to-[#FFF9F0] py-16 lg:py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">
          {/* Левая колонка — текст (3 колонки из 5 = 60%) */}
          <div className="lg:col-span-3 space-y-8 animate-fade-in z-10">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light text-[#1a1a1a] leading-[1.1] tracking-tight">
              Мир ароматов{' '}
              <span className="text-[#D4830F] font-normal">начинается</span>{' '}
              здесь
            </h1>
            <p className="text-lg sm:text-xl text-[#6B7280] max-w-xl leading-relaxed">
              Уникальные парфюмерные коллекции от ведущих мировых брендов. Люкс в каждой ноте.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#D4830F] text-white px-8 py-4 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <BookOpen className="size-5" />
                <span>В каталог</span>
              </Link>
              <Link
                href="/brands"
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-[#1a1a1a] border-2 border-gray-200 hover:border-[#D4830F] hover:text-[#D4830F] px-8 py-4 rounded-full font-medium transition-all duration-300"
              >
                <span>Наши бренды</span>
              </Link>
            </div>
            <div className="flex items-start gap-3 pt-4">
              <MapPin className="size-5 text-[#D4830F] flex-shrink-0 mt-1" />
              <div className="space-y-1">
                <p className="font-semibold text-[#1a1a1a]">Наш бутик</p>
                <p className="text-sm text-[#6B7280]">
                  Невский пр., 114-116, ТЦ Невский центр, 4 этаж
                </p>
              </div>
            </div>
          </div>

          {/* Правая колонка — карточка товара (как в шаблоне) */}
          <div className="lg:col-span-2 flex justify-center lg:justify-end animate-slide-up">
            {product ? (
              <Link
                href={`/catalog/${product.slug}`}
                className="group w-full max-w-[340px] bg-white rounded-3xl shadow-xl hover:shadow-2xl p-6 transition-all duration-500 hover:-translate-y-3 block"
              >
                <div className="relative aspect-square mb-6 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-700"
                  />
                  {product.badge && (
                    <div className="absolute top-4 right-4 bg-[#D4830F] text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                      {product.badge}
                    </div>
                  )}
                </div>
                <div className="text-center space-y-3">
                  <p className="text-xs uppercase tracking-widest text-[#6B7280] font-medium">
                    {product.brandName || product.category}
                  </p>
                  <h3 className="text-xl font-medium text-[#1a1a1a] group-hover:text-[#D4830F] transition-colors">
                    {product.shortName || product.name}
                  </h3>
                  <div className="pt-2">
                    <p className="text-2xl font-light text-[#1a1a1a]">
                      {product.price.toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                  <span className="inline-block w-full mt-4 bg-[#1a1a1a] group-hover:bg-[#D4830F] text-white py-3 rounded-full font-medium transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 text-center">
                    Подробнее
                  </span>
                </div>
              </Link>
            ) : (
              <div className="relative w-full max-w-[340px] flex justify-center">
                <div className="absolute -top-4 right-0 z-20 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white px-6 py-3 rounded-full font-medium shadow-xl animate-bounce-slow">
                  100% Premium Quality
                </div>
                <div className="relative w-full aspect-square flex items-center justify-center rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                  <img
                    src="https://images.unsplash.com/photo-1617351165959-471f874b60a9?w=800&q=80"
                    alt="Ароматы"
                    className="w-full h-full object-contain p-4"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Декоративные элементы фона */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-[#FFE4B5] rounded-full blur-3xl opacity-20 animate-float pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#FFA500] rounded-full blur-3xl opacity-10 animate-float-delayed pointer-events-none" />
    </section>
  );
}
