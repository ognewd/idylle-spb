import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Дилерам | Aroma Idylle',
  description: 'Станьте нашим партнером',
};

export default function DealersPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="mb-4">
            <h1 className="text-4xl font-bold">Сотрудничество с дилерами</h1>
          </div>
          <p className="text-xl opacity-90 max-w-2xl">
            Присоединяйтесь к нашей сети партнеров и развивайте свой бизнес
          </p>
        </div>
      </div>

      {/* Benefits */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Преимущества сотрудничества</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📈</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Выгодные условия</h3>
            <p className="text-muted-foreground">
              Специальные цены для партнеров и гибкие условия оплаты
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏪</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Маркетинговая поддержка</h3>
            <p className="text-muted-foreground">
              Предоставляем рекламные материалы и маркетинговую поддержку
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👥</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Обучение</h3>
            <p className="text-muted-foreground">
              Тренинги для вашей команды и консультации от наших экспертов
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-orange-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🤝</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Долгосрочное партнерство</h3>
            <p className="text-muted-foreground">
              Выстраиваем долгосрочные отношения с нашими партнерами
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-muted rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Станьте нашим партнером</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Заполните форму, и мы свяжемся с вами для обсуждения условий сотрудничества
          </p>
          <div className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-block cursor-pointer">
            Оставить заявку
          </div>
        </div>
      </div>
    </div>
  );
}
