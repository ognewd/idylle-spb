import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Доставка и оплата - Idylle',
  description: 'Условия доставки и оплаты в Idylle. Быстрая доставка по Санкт-Петербургу и всей России.',
};

export default function DeliveryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Доставка и оплата</h1>
            <p className="text-xl text-muted-foreground">
              Удобные способы получения и оплаты ваших заказов
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-2xl font-semibold mb-6">Способы доставки</h2>
              
              <div className="space-y-6">
                <div className="border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-3">🚚 Курьерская доставка по СПб</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Доставка в день заказа (при заказе до 14:00)</li>
                    <li>• Стоимость: от 300 ₽</li>
                    <li>• Время доставки: 2-4 часа</li>
                    <li>• Возможность оплаты при получении</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-3">📦 Самовывоз из бутика</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Бесплатно</li>
                    <li>• Адрес: Невский проспект, 123</li>
                    <li>• Время работы: Пн-Вс 10:00-22:00</li>
                    <li>• Возможность примерки и консультации</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-3">🌍 Доставка по России</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• СДЭК, Почта России</li>
                    <li>• Стоимость: от 400 ₽</li>
                    <li>• Срок доставки: 3-7 дней</li>
                    <li>• Отслеживание посылки</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold mb-6">Способы оплаты</h2>
              
              <div className="space-y-6">
                <div className="border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-3">💳 Банковская карта</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Visa, MasterCard, МИР</li>
                    <li>• Безопасная оплата онлайн</li>
                    <li>• Мгновенное подтверждение</li>
                    <li>• Возврат в течение 14 дней</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-3">🏢 Безналичный расчет</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Для юридических лиц</li>
                    <li>• Возможность загрузки реквизитов</li>
                    <li>• Выставление счетов</li>
                    <li>• НДС включен в стоимость</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-3">💰 Наличные</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• При самовывозе</li>
                    <li>• При курьерской доставке</li>
                    <li>• Сдача предоставляется</li>
                    <li>• Чек выдается</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-muted/30 rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-6 text-center">Условия возврата</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-3">Возврат возможен если:</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Товар не был в употреблении</li>
                  <li>• Сохранен товарный вид</li>
                  <li>• Прошло не более 14 дней</li>
                  <li>• Есть чек или документ о покупке</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Как оформить возврат:</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Обратитесь в службу поддержки</li>
                  <li>• Укажите причину возврата</li>
                  <li>• Дождитесь подтверждения</li>
                  <li>• Отправьте товар курьером</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


