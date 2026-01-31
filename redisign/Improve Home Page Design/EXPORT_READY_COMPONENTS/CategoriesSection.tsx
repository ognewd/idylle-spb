import { ArrowRight } from "lucide-react";

export function CategoriesSection() {
  const categories = [
    {
      title: "Luxury Perfumes",
      description: "Exquisite fragrances from world-renowned brands",
      image: "https://images.unsplash.com/photo-1760113559708-84e7a148ec68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBwZXJmdW1lJTIwYm90dGxlJTIwZWxlZ2FudHxlbnwxfHx8fDE3Njk2OTUzNzZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      gradient: "from-rose-500/80 to-pink-600/80"
    },
    {
      title: "Home Fragrances",
      description: "Transform your space with elegant scents",
      image: "https://images.unsplash.com/photo-1660853142045-a74bc7d4e07b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwZnJhZ3JhbmNlJTIwZGlmZnVzZXJ8ZW58MXx8fHwxNzY5NzAyMTAzfDA&ixlib=rb-4.1.0&q=80&w=1080",
      gradient: "from-emerald-500/80 to-teal-600/80"
    },
    {
      title: "Spa & Bathroom",
      description: "Create a luxurious wellness experience",
      image: "https://images.unsplash.com/photo-1760564019103-81cd3c225cd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBiYXRocm9vbSUyMHNwYXxlbnwxfHx8fDE3Njk2MjMzMzd8MA&ixlib=rb-4.1.0&q=80&w=1080",
      gradient: "from-amber-500/80 to-yellow-600/80"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-light text-gray-900">
            Popular categories
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our most popular fragrance and home collections
          </p>
        </div>

        {/* Categories grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <div
              key={index}
              className="group relative h-[400px] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
            >
              {/* Background image */}
              <img
                src={category.image}
                alt={category.title}
                className="absolute inset-0 size-full object-cover group-hover:scale-110 transition-transform duration-700"
              />

              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${category.gradient} opacity-60 group-hover:opacity-70 transition-opacity duration-300`}></div>

              {/* Content */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                <div className="space-y-3 transform group-hover:translate-y-[-8px] transition-transform duration-300">
                  <h3 className="text-2xl font-medium">
                    {category.title}
                  </h3>
                  <p className="text-white/90 text-sm leading-relaxed">
                    {category.description}
                  </p>
                  <button className="inline-flex items-center gap-2 text-white font-medium group/btn mt-2">
                    <span>Explore collection</span>
                    <ArrowRight className="size-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Hover border effect */}
              <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/30 rounded-3xl transition-colors duration-300"></div>
            </div>
          ))}
        </div>

        {/* View all button */}
        <div className="text-center mt-12">
          <button className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl group">
            View all categories
            <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}
