import { Truck, MapPin, Gift } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: Truck,
      title: "Free shipping",
      description: "We deliver orders in St. Petersburg for free with purchases over 15,000₽.",
    },
    {
      icon: MapPin,
      title: "Boutique in the city center",
      description: "Visit our boutique in the Nevsky Center shopping center (Stockmann), 4th floor, Nevsky Prospekt, 114–116",
    },
    {
      icon: Gift,
      title: "10% discount on your first order",
      description: "Place your first order and get 10% off your entire cart.",
    }
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 via-transparent to-gray-50/50 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid md:grid-cols-3 gap-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative"
              >
                <div className="flex flex-col items-center text-center space-y-6">
                  {/* Elegant icon with gold accent */}
                  <div className="relative">
                    {/* Outer glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-yellow-600/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500 scale-150"></div>
                    
                    {/* Icon container */}
                    <div className="relative size-20 rounded-full border-2 border-amber-600/20 flex items-center justify-center bg-gradient-to-br from-white to-gray-50 group-hover:border-amber-600/40 transition-all duration-500 group-hover:scale-110">
                      <Icon className="size-9 text-amber-700 group-hover:text-amber-600 transition-colors" strokeWidth={1.5} />
                    </div>
                  </div>

                  {/* Title with gold accent on hover */}
                  <h3 className="text-xl font-light text-gray-900 group-hover:text-amber-900 transition-colors duration-300">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed font-light text-[15px]">
                    {feature.description}
                  </p>

                  {/* Bottom accent line */}
                  <div className="w-12 h-px bg-gradient-to-r from-transparent via-amber-600/50 to-transparent group-hover:w-20 transition-all duration-500"></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
