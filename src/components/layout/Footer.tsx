import Link from 'next/link';
import { NewsletterSubscription } from '@/components/forms/NewsletterSubscription';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube,
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle
} from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="text-2xl font-bold text-primary">AROMA BOUTIQUE IDYLLE</div>
            <p className="text-sm text-muted-foreground">
              Эксклюзивные ароматы и товары для дома от ведущих мировых брендов. 
              Мы создаем атмосферу роскоши и уюта в вашем доме.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Быстрые ссылки</h3>
            <nav className="space-y-2">
              <Link href="/catalog" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Каталог
              </Link>
              <Link href="/brands" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Бренды
              </Link>
              <Link href="/new" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Новинки
              </Link>
              <Link href="/sale" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Распродажа
              </Link>
              <Link href="/about" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                О нас
              </Link>
            </nav>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="font-semibold">Служба поддержки</h3>
            <nav className="space-y-2">
              <Link href="/delivery" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Доставка и оплата
              </Link>
              <Link href="/returns" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Возврат и обмен
              </Link>
              <Link href="/size-guide" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Размерная сетка
              </Link>
              <Link href="/faq" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Частые вопросы
              </Link>
              <Link href="/contacts" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Контакты
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold">Контакты</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href="tel:8-800-500-87-29" className="hover:text-primary transition-colors">
                  8-800-500-87-29
                </a>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href="mailto:info@idylle.spb.ru" className="hover:text-primary transition-colors">
                  info@idylle.spb.ru
                </a>
              </div>
              <div className="flex items-start space-x-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>
                  Санкт-Петербург,<br />
                  Невский проспект, 114-116<br />
                  <span className="text-xs text-muted-foreground">ТК Невский центр, 4 этаж</span>
                </span>
              </div>
              <div className="flex items-start space-x-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>Пн-Вс: 10:00 - 23:00 (без выходных)</span>
              </div>
              <div className="flex items-start space-x-2 text-sm pt-2 border-t">
                <MessageCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-2">Помощь с заказом:</p>
                  <div className="flex gap-2">
                    <a 
                      href="https://wa.me/79217892777" 
                      target="_blank"
                      className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      WhatsApp
                    </a>
                    <a 
                      href="https://t.me/+79217892777" 
                      target="_blank"
                      className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                      </svg>
                      Telegram
                    </a>
                  </div>
                  <a href="tel:89215990090" className="text-xs text-primary hover:underline mt-2 block">
                    8-921-599-00-90
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Subscription */}
        <div className="mt-12 pt-8 border-t">
          <div className="max-w-md mx-auto">
            <NewsletterSubscription variant="footer" />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © 2026 AROMA BOUTIQUE IDYLLE. Все права защищены.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                Политика конфиденциальности
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                Условия использования
              </Link>
              <Link href="/cookies" className="text-muted-foreground hover:text-primary transition-colors">
                Политика cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
