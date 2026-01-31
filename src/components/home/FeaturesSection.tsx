import { Truck, MapPin, Gift } from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      icon: Truck,
      title: 'Бесплатная доставка',
      description: 'Доставляем заказы по Санкт-Петербургу бесплатно при покупке от 15 000 ₽.',
    },
    {
      icon: MapPin,
      title: 'Бутик в центре города',
      description: 'Посетите наш бутик в ТЦ Невский центр (Стокманн), 4 этаж, Невский пр., 114–116',
    },
    {
      icon: Gift,
      title: '10% скидка на первый заказ',
      description: 'Оформите первый заказ и получите 10% скидку на всю корзину.',
    },
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 via-transparent to-gray-50/50 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid md:grid-cols-3 gap-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="group relative">
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-yellow-600/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500 scale-150" />
                    <div className="relative size-20 rounded-full border-2 border-amber-600/20 flex items-center justify-center bg-gradient-to-br from-white to-gray-50 group-hover:border-amber-600/40 transition-all duration-500 group-hover:scale-110">
                      <Icon className="size-9 text-amber-700 group-hover:text-amber-600 transition-colors" strokeWidth={1.5} />
                    </div>
                  </div>
                  <h3 className="text-xl font-light text-gray-900 group-hover:text-amber-900 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed font-light text-[15px]">
                    {feature.description}
                  </p>
                  <div className="w-12 h-px bg-gradient-to-r from-transparent via-amber-600/50 to-transparent group-hover:w-20 transition-all duration-500" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
