import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Акции | Aroma Idylle',
  description: 'Специальные предложения и акции',
};

export default function PromotionsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="mb-4">
            <h1 className="text-4xl font-bold">Акции и специальные предложения</h1>
          </div>
          <p className="text-xl opacity-90">
            Не упустите возможность приобрести любимые ароматы по выгодным ценам
          </p>
        </div>
      </div>

      {/* Promotions */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Placeholder для акций */}
          <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="bg-red-100 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
              <span className="text-2xl">%</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Скидка 20%</h3>
            <p className="text-muted-foreground mb-4">
              При покупке от 5000 рублей получите скидку 20% на весь заказ
            </p>
            <div className="text-red-600 font-semibold hover:underline cursor-pointer">
              Подробнее →
            </div>
          </div>
          
          <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="bg-orange-100 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
              <span className="text-2xl">🎁</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Подарок при покупке</h3>
            <p className="text-muted-foreground mb-4">
              При покупке от 3000 рублей получите миниатюру аромата в подарок
            </p>
            <div className="text-orange-600 font-semibold hover:underline cursor-pointer">
              Подробнее →
            </div>
          </div>
          
          <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="bg-purple-100 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4">
              <span className="text-2xl">🏷️</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Черная пятница</h3>
            <p className="text-muted-foreground mb-4">
              Скидки до 50% на весь каталог в дни специальной распродажи
            </p>
            <div className="text-purple-600 font-semibold hover:underline cursor-pointer">
              Подробнее →
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
