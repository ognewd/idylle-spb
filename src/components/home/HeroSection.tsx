'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { MapPin, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

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
  products?: HeroProduct[];
};

interface FragranceParticle {
  id: number;
  x: number;
  y: number;
  timestamp: number;
}

export function HeroSection({ products = [] }: HeroSectionProps) {
  const [particles, setParticles] = useState<FragranceParticle[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hasMouseMoved, setHasMouseMoved] = useState(false);
  const particleIdRef = useRef(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Автопрокрутка слайдера
  useEffect(() => {
    if (products.length <= 1) return;

    autoScrollIntervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 5000); // Меняем слайд каждые 5 секунд

    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
    };
  }, [products.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
    }
    // Перезапускаем автопрокрутку через 5 секунд
    autoScrollIntervalRef.current = setTimeout(() => {
      autoScrollIntervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % products.length);
      }, 5000);
    }, 5000);
  };

  const goToPrevious = () => {
    goToSlide((currentIndex - 1 + products.length) % products.length);
  };

  const goToNext = () => {
    goToSlide((currentIndex + 1) % products.length);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (!hasMouseMoved) {
      setHasMouseMoved(true);
    }

    setMousePosition({ x, y });

    const newParticle: FragranceParticle = {
      id: particleIdRef.current++,
      x,
      y,
      timestamp: Date.now(),
    };

    setParticles((prev) => [...prev, newParticle]);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setParticles((prev) => prev.filter((p) => now - p.timestamp < 3000));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="relative min-h-[600px] bg-[#FFFCF9] bg-gradient-to-br from-[#FFFCF9] via-[#FBF8F5] to-[#FFFCF9] py-16 lg:py-20 overflow-hidden"
      onMouseMove={handleMouseMove}
    >

      {/* Интерактивные частицы аромата от курсора */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="mouse-fragrance-particle"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
          }}
        />
      ))}

      {/* Светящийся след за курсором */}
      {hasMouseMoved && (
        <div
          className="mouse-glow-trail"
          style={{
            left: `${mousePosition.x}px`,
            top: `${mousePosition.y}px`,
          }}
        />
      )}

      {/* Эффект распространения аромата — волны дыма и свечение (под контентом) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="smoke-stream smoke-stream-1" />
        <div className="smoke-stream smoke-stream-2" />
        <div className="smoke-stream smoke-stream-3" />
        <div className="smoke-stream smoke-stream-4" />
        <div className="smoke-stream smoke-stream-5" />
        <div className="smoke-stream smoke-stream-6" />

        {/* Лёгкое свечение слева — низкая непрозрачность, чтобы не перекрывать фон */}
        <div className="fragrance-glow w-[600px] h-[600px] bg-amber-100/20 top-1/4 left-0 -translate-x-1/4" />
        <div className="fragrance-glow w-[500px] h-[500px] bg-amber-50/15 top-1/3 left-[10%]" style={{ animationDelay: '1s' }} />
        <div className="fragrance-glow w-96 h-96 bg-amber-100/10 top-1/2 left-[5%]" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">
          {/* Левая колонка — текст с эффектами */}
          <div className="lg:col-span-3 space-y-8 animate-fade-in z-10 relative">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light text-[#1a1a1a] leading-[1.1] tracking-tight">
              Мир ароматов{' '}
              <span className="text-[#D4830F] font-normal relative inline-block">
                начинается
                <span className="absolute inset-0 blur-xl bg-amber-400/30 -z-10" />
              </span>{' '}
              здесь
            </h1>

            <p className="text-lg sm:text-xl text-[#6B7280] max-w-xl leading-relaxed">
              Уникальные парфюмерные коллекции от ведущих мировых брендов. Люкс в каждой ноте.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#D4830F] text-white px-8 py-4 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 relative overflow-hidden group"
              >
                <span className="absolute inset-0 shimmer-effect group-hover:opacity-100 opacity-0" />
                <BookOpen className="size-5 relative z-10" />
                <span className="relative z-10">В каталог</span>
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

          {/* Правая колонка — слайдер товаров */}
          <div className="lg:col-span-2 flex justify-center lg:justify-end animate-slide-up relative z-10">
            {products.length > 0 ? (
              <div className="w-full max-w-[340px] relative group/slider">
                {/* Контейнер слайдера */}
                <div className="relative overflow-hidden">
                  <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{
                      transform: `translateX(-${currentIndex * 100}%)`,
                    }}
                  >
                    {products.map((product) => (
                      <div key={product.id} className="w-full flex-shrink-0">
                        <Link
                          href={`/catalog/${product.slug}`}
                          className="group w-full bg-white rounded-3xl border border-gray-100 p-6 transition-all duration-500 hover:-translate-y-2 hover:border-[#D4830F]/20 block"
                          style={{
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
                          }}
                        >
                          <div className="relative aspect-square mb-6 rounded-2xl overflow-hidden bg-transparent">
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
                      </div>
                    ))}
                  </div>

                  {/* Навигационные кнопки - появляются при наведении */}
                  {products.length > 1 && (
                    <>
                      <button
                        onClick={goToPrevious}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2.5 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 opacity-0 group-hover/slider:opacity-100 z-20 border border-gray-200/60 hover:border-[#D4830F]/40"
                        aria-label="Предыдущий товар"
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-700 hover:text-[#D4830F] transition-colors duration-300" />
                      </button>
                      <button
                        onClick={goToNext}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2.5 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 opacity-0 group-hover/slider:opacity-100 z-20 border border-gray-200/60 hover:border-[#D4830F]/40"
                        aria-label="Следующий товар"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-700 hover:text-[#D4830F] transition-colors duration-300" />
                      </button>
                    </>
                  )}
                </div>

                {/* Индикаторы точек */}
                {products.length > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    {products.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          index === currentIndex
                            ? 'w-8 bg-[#D4830F]'
                            : 'w-2 bg-gray-300 hover:bg-gray-400'
                        }`}
                        aria-label={`Перейти к слайду ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="relative w-full max-w-[340px] flex justify-center">
                <div className="absolute -top-4 right-0 z-20 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white px-6 py-3 rounded-full font-medium shadow-xl animate-bounce-slow">
                  100% Premium Quality
                </div>
                <div className="relative w-full aspect-square flex items-center justify-center rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                  <img
                    src="/images/categories/aromaty-dlya-doma.jpg"
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
