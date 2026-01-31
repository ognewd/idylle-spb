import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export type GalleryProduct = {
  id: string;
  name: string;
  shortName?: string | null;
  slug: string;
  price: number;
  image: string;
  category?: string;
  isFeatured?: boolean;
};

type ProductGalleryProps = {
  products?: GalleryProduct[];
};

export function ProductGallery({ products = [] }: ProductGalleryProps) {
  const displayProducts = products.length > 0 ? products.slice(0, 6) : [];

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      <div className="absolute top-0 right-0 size-96 bg-amber-100/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 size-96 bg-purple-100/20 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-block">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-600" />
              <span className="text-sm tracking-[0.3em] text-amber-700 uppercase">Избранное</span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-600" />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-light text-gray-900 tracking-tight">
            Рекомендуем <span className="font-normal">вам</span>
          </h2>
          <p className="text-gray-600 font-light text-lg max-w-2xl mx-auto">
            Подборка избранных ароматов и товаров для дома
          </p>
        </div>

        {displayProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/catalog/${product.slug}`}
                  className="group w-full max-w-[340px] mx-auto bg-white rounded-3xl shadow-xl hover:shadow-2xl p-6 transition-all duration-500 hover:-translate-y-3 block"
                >
                  {/* Изображение */}
                  <div className="relative aspect-square mb-6 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-700"
                    />
                    {product.isFeatured && (
                      <div className="absolute top-4 right-4 bg-[#D4830F] text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                        Хит
                      </div>
                    )}
                  </div>
                  {/* Информация о товаре */}
                  <div className="text-center space-y-3">
                    {(product.category) && (
                      <p className="text-xs uppercase tracking-widest text-[#6B7280] font-medium">
                        {product.category}
                      </p>
                    )}
                    <h3 className="text-xl font-medium text-[#1a1a1a] group-hover:text-[#D4830F] transition-colors">
                      {product.shortName || product.name}
                    </h3>
                    <div className="pt-2">
                      <p className="text-2xl font-light text-[#1a1a1a]">
                        {product.price.toLocaleString('ru-RU')} ₽
                      </p>
                    </div>
                    <span className="inline-block w-full mt-4 bg-[#1a1a1a] group-hover:bg-[#D4830F] text-white py-3 rounded-full font-medium transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0">
                      Подробнее
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-16">
              <Link
                href="/catalog"
                className="group inline-flex items-center gap-3 bg-gray-900 hover:bg-amber-900 text-white px-10 py-4 rounded-full transition-all duration-500 hover:shadow-xl hover:scale-105"
              >
                <span className="font-light tracking-wide">Весь каталог</span>
                <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-16 bg-white/80 rounded-2xl border border-gray-100">
            <p className="text-gray-500">Добавьте товары в каталог — здесь появятся избранные</p>
            <Link href="/catalog" className="mt-4 inline-block text-amber-600 hover:text-amber-700 font-medium">
              Перейти в каталог →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
