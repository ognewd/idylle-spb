import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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
      title: 'Контакты - AROMA BOUTIQUE IDYLLE',
      description: 'Свяжитесь с нами. Контакты AROMA BOUTIQUE IDYLLE в Санкт-Петербурге. Телефон, адрес, время работы.',
    };
  }

  return {
    title: page.metaTitle || page.title || 'Контакты - AROMA BOUTIQUE IDYLLE',
    description: page.metaDescription || 'Свяжитесь с нами. Контакты AROMA BOUTIQUE IDYLLE в Санкт-Петербурге. Телефон, адрес, время работы.',
  };
}

export default async function ContactsPage() {
  const page = await getPageContent();

  // Используем новую информацию независимо от БД
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">AROMA BOUTIQUE IDYLLE</h1>
            <p className="text-xl text-muted-foreground">
              Свяжитесь с нами любым удобным способом
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            {/* Контактная информация */}
            <div>
              <h2 className="text-2xl font-semibold mb-6">Наши контакты</h2>
              
              <div className="space-y-6">
                {/* Адрес */}
                <div className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Адрес</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Санкт-Петербург, Невский проспект, 114-116
                      <br />
                      <span className="text-sm">ТК Невский центр, 4 этаж</span>
                    </p>
                    <p className="text-sm text-primary mt-1">🚇 Станция метро: Площадь Восстания</p>
                  </div>
                </div>

                {/* Телефон */}
                <div className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Телефон</h3>
                    <a href="tel:8-800-500-87-29" className="text-primary hover:underline text-lg font-medium block mb-1">
                      8-800-500-87-29
                    </a>
                    <p className="text-sm text-muted-foreground">Бесплатный звонок по России</p>
                  </div>
                </div>

                {/* Время работы */}
                <div className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Время работы</h3>
                    <p className="text-muted-foreground">Пн-Вс: 10:00 - 23:00</p>
                    <p className="text-sm text-green-600 font-medium">Без выходных</p>
                  </div>
                </div>

                {/* Помощь с заказом */}
                <div className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border-2 border-primary/20">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Нужна помощь с заказом?</h3>
                    <a href="tel:89215990090" className="text-primary hover:underline font-medium block mb-2">
                      тел. 8-921-599-00-90
                    </a>
                    <div className="flex gap-2 mt-3">
                      <Link 
                        href="https://wa.me/79217892777" 
                        target="_blank"
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        WhatsApp
                      </Link>
                      <Link 
                        href="https://t.me/+79217892777" 
                        target="_blank"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.17 1.858-.896 6.728-.896 6.728-.448 2.388-1.224 2.681-1.892 2.727-1.492.065-2.625-.988-4.076-1.878-1.784-1.038-2.795-1.612-4.533-2.588-1.937-1.094-2.396-1.675-3.688-2.438-1.398-.844-4.909-1.886-4.789-3.338.062-.765.897-1.545 2.458-2.132 3.852-1.802 8.098-3.773 12.453-5.808.746-.346 1.624-.768 2.523-.778.69-.008 2.223.143 3.253 1.079.914.832.627 2.593.457 3.906z"/>
                        </svg>
                        Telegram
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Email для опта */}
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold text-lg">Для юридических лиц</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Оптовая торговля</p>
                      <a href="mailto:info@idylle.spb.ru" className="text-primary hover:underline font-medium">
                        info@idylle.spb.ru
                      </a>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Отдел по работе с юридическими лицами</p>
                      <a href="mailto:info@idylle.spb.ru" className="text-primary hover:underline font-medium">
                        info@idylle.spb.ru
                      </a>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Реклама и сотрудничество</p>
                      <a href="mailto:info@idylle.spb.ru" className="text-primary hover:underline font-medium">
                        info@idylle.spb.ru
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Форма обратной связи */}
            <div>
              <h2 className="text-2xl font-semibold mb-6">Напишите нам</h2>
              
              <form className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Ваше имя
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full px-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
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
                    className="w-full px-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
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
                    className="w-full px-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
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
                    className="w-full px-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="Ваше сообщение..."
                  ></textarea>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                >
                  Отправить сообщение
                </Button>
              </form>
            </div>
          </div>

          {/* Карта/Как нас найти */}
          <div className="bg-muted/30 rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-6 text-center">Как нас найти</h2>
            <div className="text-center">
              <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
                Наш бутик находится в самом сердце Санкт-Петербурга на Невском проспекте, 
                в торговом комплексе «Невский центр» на 4 этаже
              </p>
              <div className="bg-white rounded-lg p-6 inline-block shadow-sm">
                <p className="font-medium mb-2">🚇 Ближайшая станция метро:</p>
                <p className="text-primary font-semibold text-lg">Площадь Восстания</p>
                <p className="text-sm text-muted-foreground mt-2">2-3 минуты пешком от метро</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
