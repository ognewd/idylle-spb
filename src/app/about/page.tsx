import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'О нас - Idylle',
  description: 'Узнайте больше о Idylle - эксклюзивные парфюмы и товары для дома от ведущих мировых брендов.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">О нас</h1>
            <p className="text-xl text-muted-foreground">
              Создаем атмосферу роскоши и уюта в вашем доме
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-2xl font-semibold mb-6">Наша история</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Idylle — это уникальное пространство, где встречаются изысканность и комфорт. 
                Мы специализируемся на эксклюзивных парфюмах и товарах для дома от ведущих 
                мировых брендов.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Наша миссия — помочь вам создать неповторимую атмосферу в вашем доме, 
                где каждый аромат рассказывает свою историю, а каждый предмет несет 
                в себе частичку роскоши.
              </p>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-8">
              <h3 className="text-xl font-semibold mb-4">Наши ценности</h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <span className="text-muted-foreground">Качество и подлинность каждого продукта</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <span className="text-muted-foreground">Индивидуальный подход к каждому клиенту</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <span className="text-muted-foreground">Создание уникальной атмосферы</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <span className="text-muted-foreground">Стремление к совершенству</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-6">Почему выбирают нас</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏆</span>
                </div>
                <h3 className="font-semibold mb-2">Эксклюзивность</h3>
                <p className="text-muted-foreground text-sm">
                  Только оригинальные товары от ведущих мировых брендов
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="font-semibold mb-2">Экспертиза</h3>
                <p className="text-muted-foreground text-sm">
                  Профессиональные консультации по выбору ароматов
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚚</span>
                </div>
                <h3 className="font-semibold mb-2">Доставка</h3>
                <p className="text-muted-foreground text-sm">
                  Быстрая и надежная доставка по всей России
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


