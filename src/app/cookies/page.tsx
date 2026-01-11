import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

// Отключаем статическую генерацию - страница должна рендериться динамически
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getPageContent() {
  try {
    const page = await prisma.page.findUnique({
      where: {
        slug: 'cookies',
        isActive: true,
      },
    });
    return page;
  } catch (error) {
    console.error('Error fetching cookies page:', error);
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageContent();

  if (!page) {
    return {
      title: 'Политика cookies - Idylle',
      description: 'Политика использования файлов cookie в интернет-магазине Idylle. Как мы используем cookies для улучшения работы сайта.',
    };
  }

  return {
    title: page.metaTitle || page.title || 'Политика cookies - Idylle',
    description: page.metaDescription || 'Политика использования файлов cookie в интернет-магазине Idylle. Как мы используем cookies для улучшения работы сайта.',
  };
}

export default async function CookiesPage() {
  const page = await getPageContent();

  // Если страница не найдена в БД, показываем дефолтный контент (fallback)
  if (!page || !page.content) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Политика cookies</h1>
              <p className="text-xl text-muted-foreground">
                Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
              </p>
            </div>

            <div className="prose prose-lg max-w-none space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Что такое cookies</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Cookies — это небольшие текстовые файлы, которые сохраняются на вашем устройстве 
                  при посещении веб-сайта. Они помогают сайту запомнить ваши предпочтения и улучшить 
                  работу сайта.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Как мы используем cookies</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Мы используем cookies для следующих целей:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Сохранение информации о корзине покупок</li>
                  <li>Запоминание ваших предпочтений и настроек</li>
                  <li>Улучшение работы сайта и пользовательского опыта</li>
                  <li>Анализ использования сайта для его улучшения</li>
                  <li>Обеспечение безопасности и предотвращение мошенничества</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Типы используемых cookies</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Мы используем следующие типы cookies:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>Обязательные cookies</strong> — необходимы для работы сайта</li>
                  <li><strong>Функциональные cookies</strong> — улучшают функциональность сайта</li>
                  <li><strong>Аналитические cookies</strong> — помогают анализировать использование сайта</li>
                  <li><strong>Маркетинговые cookies</strong> — используются для персонализации контента</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Управление cookies</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Вы можете управлять cookies через настройки своего браузера. Однако отключение 
                  некоторых cookies может повлиять на функциональность сайта.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Для управления cookies в популярных браузерах:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Google Chrome: Настройки → Конфиденциальность и безопасность → Файлы cookie</li>
                  <li>Mozilla Firefox: Настройки → Приватность и защита → Файлы cookie</li>
                  <li>Safari: Настройки → Конфиденциальность → Файлы cookie</li>
                  <li>Microsoft Edge: Настройки → Конфиденциальность → Файлы cookie</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Сторонние cookies</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Наш сайт может использовать сторонние сервисы (например, аналитические системы), 
                  которые также используют cookies. Мы не контролируем использование cookies 
                  третьими сторонами.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Контакты</h2>
                <p className="text-muted-foreground leading-relaxed">
                  По всем вопросам, связанным с использованием cookies, вы можете обратиться 
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
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

