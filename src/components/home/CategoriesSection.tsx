'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
};

const GRADIENTS = [
  'from-rose-500/80 to-pink-600/80',
  'from-emerald-500/80 to-teal-600/80',
  'from-amber-500/80 to-yellow-600/80',
];

type CategoriesSectionProps = {
  categories?: CategoryItem[];
};

export function CategoriesSection({ categories = [] }: CategoriesSectionProps) {
  const hasCategories = categories.length > 0;
  const displayCategories = hasCategories
    ? categories.slice(0, 3)
    : [
        { id: '1', name: 'Ароматы для дома', slug: 'aromaty-dlya-doma', description: 'Уникальная атмосфера', image: null },
        { id: '2', name: 'Товары для дома', slug: 'catalog', description: 'Создайте уют', image: null },
        { id: '3', name: 'Подарки', slug: 'podarki', description: 'Готовые наборы', image: null },
      ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-light text-gray-900">
            Популярные категории
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Откройте для себя наши коллекции ароматов и товаров для дома
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {displayCategories.map((category, index) => {
            const gradient = GRADIENTS[index % GRADIENTS.length];
            const href = category.slug === 'catalog' ? '/catalog' : category.slug === 'podarki' ? '/podarki' : `/catalog?category=${category.slug}`;
            const fallbackImage = `https://images.unsplash.com/photo-1617351165959-471f874b60a9?w=800&q=80`;
            const imageUrl = category.image || fallbackImage;

            return (
              <Link
                key={category.id}
                href={href}
                className="group relative h-[400px] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer block"
              >
                <img
                  src={imageUrl}
                  alt={category.name}
                  className="absolute inset-0 size-full object-cover group-hover:scale-110 transition-transform duration-700"
                  onError={(e) => {
                    const el = e.currentTarget;
                    if (el.src !== fallbackImage) {
                      el.onerror = null;
                      el.src = fallbackImage;
                    }
                  }}
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${gradient} opacity-60 group-hover:opacity-70 transition-opacity duration-300`} />
                <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                  <div className="space-y-3 transform group-hover:translate-y-[-8px] transition-transform duration-300">
                    <h3 className="text-2xl font-medium">{category.name}</h3>
                    <p className="text-white/90 text-sm leading-relaxed">
                      {category.description || 'Смотреть коллекцию'}
                    </p>
                    <span className="inline-flex items-center gap-2 text-white font-medium group/btn mt-2">
                      В каталог
                      <ArrowRight className="size-4 group-hover/btn:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
                <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/30 rounded-3xl transition-colors duration-300" />
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl group"
          >
            Все категории
            <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
