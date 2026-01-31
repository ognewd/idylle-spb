import { ArrowRight } from "lucide-react";

export function ProductGallery() {
  const products = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1760113559708-84e7a148ec68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBwZXJmdW1lJTIwYm90dGxlJTIwZWxlZ2FudHxlbnwxfHx8fDE3Njk2OTUzNzZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      name: "Velvet Noir",
      category: "Eau de Parfum",
      price: "24,500₽",
      featured: true
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1737920459846-2d0318700658?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwZnJhZ3JhbmNlJTIwYm90dGxlJTIwZ29sZHxlbnwxfHx8fDE3Njk3MTUwNDh8MA&ixlib=rb-4.1.0&q=80&w=1080",
      name: "Golden Essence",
      category: "Luxury Collection",
      price: "32,900₽"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1694179023466-cb438ce7ae0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ25lciUyMHBlcmZ1bWUlMjBib3R0bGUlMjB3aGl0ZSUyMGJhY2tncm91bmR8ZW58MXx8fHwxNzY5NzE1MDQ4fDA&ixlib=rb-4.1.0&q=80&w=1080",
      name: "Pure Elegance",
      category: "Limited Edition",
      price: "28,700₽"
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1617351165959-471f874b60a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob21lJTIwZnJhZ3JhbmNlJTIwZGlmZnVzZXJ8ZW58MXx8fHwxNzY5NzA3ODAxfDA&ixlib=rb-4.1.0&q=80&w=1080",
      name: "Amber Dream",
      category: "Home Diffuser",
      price: "18,500₽"
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1640869116016-93c00ba94b28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxleHBlbnNpdmUlMjBwZXJmdW1lJTIwYm90dGxlJTIwbWluaW1hbHxlbnwxfHx8fDE3Njk3MTUwNDl8MA&ixlib=rb-4.1.0&q=80&w=1080",
      name: "Midnight Rose",
      category: "Signature Scent",
      price: "26,300₽"
    },
    {
      id: 6,
      image: "https://images.unsplash.com/photo-1759793500112-c588839cfc6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaWdoJTIwZW5kJTIwZnJhZ3JhbmNlJTIwYm90dGxlfGVufDF8fHx8MTc2OTcxNTA0OXww&ixlib=rb-4.1.0&q=80&w=1080",
      name: "Crystal Oud",
      category: "Premium Line",
      price: "38,900₽"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 size-96 bg-amber-100/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 size-96 bg-purple-100/20 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-block">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-600"></div>
              <span className="text-sm tracking-[0.3em] text-amber-700 uppercase">Curated Selection</span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-600"></div>
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-light text-gray-900 tracking-tight">
            Featured <span className="font-normal">Fragrances</span>
          </h2>
          <p className="text-gray-600 font-light text-lg max-w-2xl mx-auto">
            Discover our handpicked collection of the world's most exquisite perfumes
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-amber-200"
            >
              {/* Featured badge */}
              {product.featured && (
                <div className="absolute top-4 right-4 z-10 bg-amber-600 text-white px-4 py-1.5 rounded-full text-xs tracking-wider uppercase">
                  Featured
                </div>
              )}

              {/* Image container */}
              <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-gray-50 to-white">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <button className="w-full bg-white/95 hover:bg-white text-gray-900 py-3 rounded-full font-light flex items-center justify-center gap-2 group/btn">
                      <span>View Details</span>
                      <ArrowRight className="size-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Product info */}
              <div className="p-6 space-y-3">
                <div className="space-y-1">
                  <p className="text-xs tracking-[0.2em] text-amber-700 uppercase">
                    {product.category}
                  </p>
                  <h3 className="text-xl font-light text-gray-900 group-hover:text-amber-900 transition-colors">
                    {product.name}
                  </h3>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-2xl font-light text-gray-900">{product.price}</span>
                  <div className="size-10 rounded-full border-2 border-gray-200 group-hover:border-amber-600 flex items-center justify-center transition-colors">
                    <ArrowRight className="size-5 text-gray-400 group-hover:text-amber-600 transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-16">
          <button className="group inline-flex items-center gap-3 bg-gray-900 hover:bg-amber-900 text-white px-10 py-4 rounded-full transition-all duration-500 hover:shadow-xl hover:scale-105">
            <span className="font-light tracking-wide">View All Collection</span>
            <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}
