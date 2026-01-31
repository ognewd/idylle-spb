'use client';

import { useState, useEffect, useRef } from 'react';
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

interface FragranceParticle {
  id: number;
  x: number;
  y: number;
  timestamp: number;
}

export function HeroSection({ product }: HeroSectionProps) {
  const [particles, setParticles] = useState<FragranceParticle[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hasMouseMoved, setHasMouseMoved] = useState(false);
  const particleIdRef = useRef(0);

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
      className="relative min-h-[600px] bg-gradient-to-br from-slate-800 via-slate-700 to-gray-800 py-16 lg:py-20 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Темный радиальный градиент для контраста в зоне распыления */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_800px_600px_at_70%_50%,rgba(15,23,42,0.4),transparent)]" />

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

      {/* Эффект распространения аромата — волны дыма и свечение */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="smoke-stream smoke-stream-1" />
        <div className="smoke-stream smoke-stream-2" />
        <div className="smoke-stream smoke-stream-3" />
        <div className="smoke-stream smoke-stream-4" />
        <div className="smoke-stream smoke-stream-5" />
        <div className="smoke-stream smoke-stream-6" />

        {/* Свечение только слева (за текстом), чтобы не было пятна у карточки */}
        <div className="fragrance-glow w-[600px] h-[600px] bg-slate-200/8 top-1/4 left-0 -translate-x-1/4" />
        <div className="fragrance-glow w-[500px] h-[500px] bg-gray-100/10 top-1/3 left-[10%]" style={{ animationDelay: '1s' }} />
        <div className="fragrance-glow w-96 h-96 bg-slate-300/7 top-1/2 left-[5%]" style={{ animationDelay: '2s' }} />
        <div className="fragrance-glow w-[550px] h-[550px] bg-gray-200/9 top-2/5 left-[15%]" style={{ animationDelay: '1.5s' }} />
        <div className="fragrance-glow w-[450px] h-[450px] bg-slate-100/6 top-[35%] left-0" style={{ animationDelay: '0.5s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">
          {/* Левая колонка — текст с эффектами */}
          <div className="lg:col-span-3 space-y-8 animate-fade-in z-10 relative">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light text-white leading-[1.1] tracking-tight">
              Мир ароматов{' '}
              <span className="text-[#D4830F] font-normal relative inline-block">
                начинается
                <span className="absolute inset-0 blur-xl bg-amber-400/30 -z-10" />
              </span>{' '}
              здесь
            </h1>

            <p className="text-lg sm:text-xl text-gray-300 max-w-xl leading-relaxed">
              Уникальные парфюмерные коллекции от ведущих мировых брендов. Люкс в каждой ноте.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 bg-white hover:bg-[#D4830F] text-[#1a1a1a] hover:text-white px-8 py-4 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 relative overflow-hidden group"
              >
                <span className="absolute inset-0 shimmer-effect group-hover:opacity-100 opacity-0" />
                <BookOpen className="size-5 relative z-10" />
                <span className="relative z-10">В каталог</span>
              </Link>
              <Link
                href="/brands"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border-2 border-white/30 hover:border-[#D4830F] hover:text-[#D4830F] px-8 py-4 rounded-full font-medium transition-all duration-300 backdrop-blur-sm"
              >
                <span>Наши бренды</span>
              </Link>
            </div>

            <div className="flex items-start gap-3 pt-4">
              <MapPin className="size-5 text-[#D4830F] flex-shrink-0 mt-1" />
              <div className="space-y-1">
                <p className="font-semibold text-white">Наш бутик</p>
                <p className="text-sm text-gray-300">
                  Невский пр., 114-116, ТЦ Невский центр, 4 этаж
                </p>
              </div>
            </div>
          </div>

          {/* Правая колонка — карточка товара */}
          <div className="lg:col-span-2 flex justify-center lg:justify-end animate-slide-up relative z-10">
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
    </section>
  );
}
