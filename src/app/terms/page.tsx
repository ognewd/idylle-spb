import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { sanitizeHtml } from '@/lib/sanitize';

// Отключаем статическую генерацию - страница должна рендериться динамически
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getPageContent() {
  try {
    const page = await prisma.page.findUnique({
      where: {
        slug: 'terms',
        isActive: true,
      },
    });
    return page;
  } catch (error) {
    console.error('Error fetching terms page:', error);
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageContent();

  if (!page) {
    return {
      title: 'Условия использования - Idylle',
      description: 'Условия использования интернет-магазина Idylle. Правила размещения заказов, оплаты и доставки.',
    };
  }

  return {
    title: page.metaTitle || page.title || 'Условия использования - Idylle',
    description: page.metaDescription || 'Условия использования интернет-магазина Idylle. Правила размещения заказов, оплаты и доставки.',
  };
}

export default async function TermsPage() {
  const page = await getPageContent();

  // Если страница не найдена в БД, показываем дефолтный контент (fallback)
  if (!page || !page.content) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Условия использования</h1>
              <p className="text-xl text-muted-foreground">
                Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
              </p>
            </div>

            <div className="prose prose-lg max-w-none space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Общие положения</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Настоящие Условия использования регулируют отношения между интернет-магазином Idylle 
                  (далее — «Магазин») и пользователями сайта aromarussia.ru (далее — «Пользователи»).
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Используя сайт Магазина, Пользователь соглашается с настоящими Условиями использования.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Регистрация и оформление заказа</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Для оформления заказа Пользователь должен:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Предоставить достоверные персональные данные</li>
                  <li>Указать корректный адрес доставки и контактную информацию</li>
                  <li>Выбрать способ оплаты и доставки</li>
                  <li>Подтвердить заказ</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Оплата и доставка</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Оплата заказа производится в соответствии с выбранным способом оплаты. 
                  Доставка осуществляется в соответствии с условиями доставки, указанными на сайте.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Возврат товара</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Возврат товара надлежащего качества возможен в течение 14 дней с момента покупки при условии:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Сохранения товарного вида и потребительских свойств</li>
                  <li>Наличия документа, подтверждающего покупку</li>
                  <li>Отсутствия признаков использования товара</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Ответственность</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Магазин не несет ответственности за ущерб, причиненный вследствие неправильного использования 
                  товара, приобретенного в Магазине. Все товары соответствуют описанию на сайте.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Контакты</h2>
                <p className="text-muted-foreground leading-relaxed">
                  По всем вопросам, связанным с условиями использования, вы можете обратиться 
                  по электронной почте: info@idylle.spb.ru или телефону: +7 (812) 123-45-67.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Если страница найдена в БД, показываем контент из БД
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">{page.title}</h1>
          </div>

          {page.content && (
            <div 
              className="prose prose-lg max-w-none prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed prose-ul:list-disc prose-ol:list-decimal prose-a:text-primary prose-a:underline hover:prose-a:text-primary/80 prose-img:rounded-lg prose-img:shadow-sm"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content) }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

