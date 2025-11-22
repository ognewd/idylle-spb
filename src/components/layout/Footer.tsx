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
  Clock
} from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="text-2xl font-bold text-primary">Idylle</div>
            <p className="text-sm text-muted-foreground">
              Эксклюзивные парфюмы и товары для дома от ведущих мировых брендов. 
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
                <span>+7 (812) 123-45-67</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>info@idylle.spb.ru</span>
              </div>
              <div className="flex items-start space-x-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>Санкт-Петербург,<br />Невский проспект, 123</span>
              </div>
              <div className="flex items-start space-x-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>Пн-Вс: 10:00 - 22:00</span>
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
              © 2024 Idylle. Все права защищены.
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
