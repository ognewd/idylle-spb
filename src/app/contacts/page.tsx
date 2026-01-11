import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

// Отключаем статическую генерацию - страница должна рендериться динамически
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getPageContent() {
  try {
    const page = await prisma.page.findUnique({
      where: {
        slug: 'contacts',
        isActive: true,
      },
    });
    return page;
  } catch (error) {
    console.error('Error fetching contacts page:', error);
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageContent();

  if (!page) {
    return {
      title: 'Контакты - Idylle',
      description: 'Свяжитесь с нами. Контакты Idylle в Санкт-Петербурге. Телефон, адрес, время работы.',
    };
  }

  return {
    title: page.metaTitle || page.title || 'Контакты - Idylle',
    description: page.metaDescription || 'Свяжитесь с нами. Контакты Idylle в Санкт-Петербурге. Телефон, адрес, время работы.',
  };
}

export default async function ContactsPage() {
  const page = await getPageContent();

  // Если страница не найдена в БД, показываем дефолтный контент (fallback)
  if (!page || !page.content) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Контакты</h1>
              <p className="text-xl text-muted-foreground">
                Свяжитесь с нами любым удобным способом
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 mb-16">
              <div>
                <h2 className="text-2xl font-semibold mb-6">Наши контакты</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xl">📞</span>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Телефон</h3>
                      <p className="text-muted-foreground">+7 (812) 123-45-67</p>
                      <p className="text-sm text-muted-foreground">Пн-Вс: 10:00 - 22:00</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xl">✉️</span>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Email</h3>
                      <p className="text-muted-foreground">info@idylle.spb.ru</p>
                      <p className="text-sm text-muted-foreground">Ответим в течение часа</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xl">📍</span>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Адрес</h3>
                      <p className="text-muted-foreground">
                        Санкт-Петербург,<br />
                        Невский проспект, 123
                      </p>
                      <p className="text-sm text-muted-foreground">Станция метро: Невский проспект</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xl">⏰</span>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Время работы</h3>
                      <p className="text-muted-foreground">Пн-Вс: 10:00 - 22:00</p>
                      <p className="text-sm text-muted-foreground">Без выходных</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold mb-6">Напишите нам</h2>
                
                <form className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Ваше имя
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="w-full px-4 py-2 border border-input rounded-md bg-background"
                      placeholder="Введите ваше имя"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="w-full px-4 py-2 border border-input rounded-md bg-background"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-2">
                      Телефон
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="w-full px-4 py-2 border border-input rounded-md bg-background"
                      placeholder="+7 (___) ___-__-__"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      Сообщение
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      className="w-full px-4 py-2 border border-input rounded-md bg-background"
                      placeholder="Ваше сообщение..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-md font-medium hover:bg-primary/90 transition-colors"
                  >
                    Отправить сообщение
                  </button>
                </form>
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-8">
              <h2 className="text-2xl font-semibold mb-6 text-center">Как нас найти</h2>
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  Наш бутик находится в самом сердце Санкт-Петербурга на Невском проспекте
                </p>
                <div className="bg-muted rounded-lg p-4 inline-block">
                  <p className="font-medium">🚇 Ближайшие станции метро:</p>
                  <p className="text-muted-foreground">Невский проспект (2 мин пешком)</p>
                  <p className="text-muted-foreground">Гостиный двор (5 мин пешком)</p>
                </div>
              </div>
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
