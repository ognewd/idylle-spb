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
        slug: 'privacy',
        isActive: true,
      },
    });
    return page;
  } catch (error) {
    console.error('Error fetching privacy page:', error);
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageContent();

  if (!page) {
    return {
      title: 'Политика конфиденциальности - Idylle',
      description: 'Политика конфиденциальности Idylle. Как мы собираем, используем и защищаем ваши персональные данные.',
    };
  }

  return {
    title: page.metaTitle || page.title || 'Политика конфиденциальности - Idylle',
    description: page.metaDescription || 'Политика конфиденциальности Idylle. Как мы собираем, используем и защищаем ваши персональные данные.',
  };
}

export default async function PrivacyPage() {
  const page = await getPageContent();

  // Если страница не найдена в БД, показываем дефолтный контент (fallback)
  if (!page || !page.content) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Политика конфиденциальности</h1>
              <p className="text-xl text-muted-foreground">
                Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
              </p>
            </div>

            <div className="prose prose-lg max-w-none space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Общие положения</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных 
                  пользователей интернет-магазина Idylle (далее — «Магазин»), расположенного по адресу aromarussia.ru.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Использование Магазина означает безоговорочное согласие пользователя с настоящей Политикой 
                  конфиденциальности и указанными в ней условиями обработки его персональной информации.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Собираемая информация</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  При регистрации и оформлении заказа мы собираем следующую информацию:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>ФИО, адрес электронной почты, номер телефона</li>
                  <li>Адрес доставки и платежная информация</li>
                  <li>История покупок и предпочтения</li>
                  <li>Технические данные (IP-адрес, тип браузера, устройство)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Использование информации</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Собранная информация используется для:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Обработки и выполнения заказов</li>
                  <li>Связи с клиентами по вопросам заказов</li>
                  <li>Улучшения качества обслуживания</li>
                  <li>Отправки информационных сообщений (с согласия пользователя)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Защита данных</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Мы применяем современные методы защиты информации от несанкционированного доступа, 
                  изменения, раскрытия или уничтожения. Все данные передаются по защищенному соединению (HTTPS).
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Права пользователей</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Пользователь имеет право:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Получать информацию о своих персональных данных</li>
                  <li>Требовать исправления или удаления данных</li>
                  <li>Отозвать согласие на обработку данных</li>
                  <li>Ограничить обработку персональных данных</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Контакты</h2>
                <p className="text-muted-foreground leading-relaxed">
                  По всем вопросам, связанным с обработкой персональных данных, вы можете обратиться 
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

