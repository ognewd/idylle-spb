'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, Mail, CheckCircle2, TrendingUp, Users, Shield, FileText, UserCheck, Target } from 'lucide-react';

export default function DealersPage() {
  type DealersFormState = {
    companyName: string;
    contacts: string;
    requisites: string;
    brands: string;
    agreeDocuments: boolean;
  };

  const [activeTab, setActiveTab] = useState<'partners' | 'dealers'>('partners');
  const [isDealersFormOpen, setIsDealersFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const [dealersForm, setDealersForm] = useState<DealersFormState>({
    companyName: '',
    contacts: '',
    requisites: '',
    brands: '',
    agreeDocuments: false,
  });

  useEffect(() => {
    // Устанавливаем метаданные страницы
    document.title = 'Сотрудничество | AROMARUSSIA';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Партнерство с брендами и дилерами. Станьте частью AROMARUSSIA');
    }

    // Определяем активную вкладку на основе хэша URL
    const hash = window.location.hash;
    if (hash === '#dealers') {
      setActiveTab('dealers');
    } else {
      setActiveTab('partners');
    }

    // Обработчик изменения хэша при прокрутке
    const handleHashChange = () => {
      const currentHash = window.location.hash;
      if (currentHash === '#dealers') {
        setActiveTab('dealers');
      } else {
        setActiveTab('partners');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleTabClick = (tab: 'partners' | 'dealers', e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setActiveTab(tab);
    const element = document.getElementById(tab);
    if (element) {
      const offset = 100; // Отступ от верха
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      // Обновляем хэш без прокрутки
      setTimeout(() => {
        window.history.pushState(null, '', `#${tab}`);
      }, 100);
    }
  };

  const handleDealersFormChange = <K extends keyof DealersFormState>(
    field: K,
    value: DealersFormState[K]
  ) => {
    setDealersForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleDealersSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');
    setSubmitSuccess(false);

    if (
      !dealersForm.companyName.trim() ||
      !dealersForm.contacts.trim() ||
      !dealersForm.requisites.trim() ||
      !dealersForm.brands.trim()
    ) {
      setFormError('Пожалуйста, заполните все поля формы');
      return;
    }

    if (!dealersForm.agreeDocuments) {
      setFormError('Необходимо подтвердить согласие с документами');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/dealers/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: dealersForm.companyName,
          contacts: dealersForm.contacts,
          requisites: dealersForm.requisites,
          brands: dealersForm.brands,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setFormError(data.error || 'Не удалось отправить заявку');
        return;
      }

      setSubmitSuccess(true);
      setDealersForm({
        companyName: '',
        contacts: '',
        requisites: '',
        brands: '',
        agreeDocuments: false,
      });
    } catch {
      setFormError('Ошибка сети. Попробуйте еще раз');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero: широкое фото, текст и вкладки как раньше */}
      <div className="relative text-white">
        <div className="relative min-h-[240px] sm:min-h-[300px] md:min-h-[360px] lg:min-h-[400px] w-full">
          <Image
            src="/images/hero/dealers-cooperation.png"
            alt="Сотрудничество: партнёрам и дилерам"
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/25" aria-hidden />
          <div className="absolute inset-y-0 left-0 w-full md:w-[58%] bg-gradient-to-r from-black/55 to-transparent pointer-events-none" aria-hidden />
          <div className="relative z-[1] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24 min-h-[240px] sm:min-h-[300px] md:min-h-[360px] lg:min-h-[400px] flex flex-col justify-end">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-md">Сотрудничество</h1>
            <p className="text-xl md:text-2xl text-white/95 max-w-3xl drop-shadow-md leading-snug">
              Два направления партнерства для развития бизнеса в сфере премиальных ароматов
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-[2] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-lg shadow-lg p-1 flex gap-2">
          <a
            href="#partners"
            onClick={(e) => handleTabClick('partners', e)}
            className={`flex-1 text-center py-3 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'partners'
                ? 'bg-[#D4830F] text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Партнерам
          </a>
          <a
            href="#dealers"
            onClick={(e) => handleTabClick('dealers', e)}
            className={`flex-1 text-center py-3 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'dealers'
                ? 'bg-[#D4830F] text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Дилерам
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Раздел: Партнерам */}
        <section id="partners" className="mb-20 scroll-mt-8">
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Партнерам
            </h2>
            <p className="text-lg text-gray-600">
              Брендам и поставщикам
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Станьте частью AROMARUSSIA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-700 leading-relaxed">
                <strong>AROMARUSSIA</strong> — это современная платформа премиальных ароматов для дома и решений в сфере бизнес-ароматизации. Мы формируем культуру интерьерной парфюмерии в России, объединяя сильные бренды, качественный сервис и профессиональный подход к продвижению.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Мы открыты к сотрудничеству с производителями и официальными дистрибьюторами ароматов для дома, парфюмерии, интерьерных решений и сопутствующих аксессуаров.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Наша цель — создавать устойчивые партнерства и развивать бренды на российском рынке в долгосрочной перспективе.
              </p>
            </CardContent>
          </Card>

          {/* Что получает партнер */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Что получает партнер</h3>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="h-6 w-6 text-[#D4830F]" />
                    <CardTitle className="text-xl">Профессиональное продвижение</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">
                    Мы инвестируем в маркетинг, контент и развитие бренда внутри нашей экосистемы:
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>качественные карточки товаров и экспертные описания</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>рекламные кампании</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>продвижение в digital-каналах</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>работа с постоянной аудиторией премиум-сегмента</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="h-6 w-6 text-[#D4830F]" />
                    <CardTitle className="text-xl">Выход на рынок России</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Мы обеспечиваем доступ к клиентам по всей территории РФ — от крупных городов до удаленных регионов. Интернет-формат позволяет представить продукцию максимально широкой аудитории.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="h-6 w-6 text-[#D4830F]" />
                    <CardTitle className="text-xl">Репутация и доверие</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Мы работаем только с оригинальной продукцией и тщательно контролируем качество. Высокий уровень сервиса, прозрачная логистика и поддержка клиентов формируют устойчивую лояльность к представленным брендам.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="h-6 w-6 text-[#D4830F]" />
                    <CardTitle className="text-xl">Прозрачность сотрудничества</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Четкие договоренности, соблюдение финансовых обязательств и уважение к партнеру — основа нашей работы. Нас интересует стратегическое, взаимовыгодное сотрудничество.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Требования */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Требования к рассмотрению предложения</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-[#D4830F] font-bold">—</span>
                  <span>Продукция должна быть оригинальной и сертифицированной</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D4830F] font-bold">—</span>
                  <span>Необходимо предоставить информацию о бренде, прайс-листы и официальный сайт</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D4830F] font-bold">—</span>
                  <span>Указать статус компании в РФ: представительство, дистрибьютор, эксклюзивный дистрибьютор</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D4830F] font-bold">—</span>
                  <span>Контактные данные для связи</span>
                </li>
              </ul>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-gray-700 mb-3">
                  Скачайте и заполните прилагаемую заявку. Заполненный файл высылайте на наш e-mail: <a href="mailto:office@aromarussia.ru" className="text-[#D4830F] font-semibold hover:underline">office@aromarussia.ru</a>
                </p>
                <a 
                  href="/Partner.xls" 
                  download 
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#D4830F] hover:bg-[#b8700d] text-white rounded-md font-medium transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Скачать бланк заявки (Excel)
                </a>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-16" />

        {/* Раздел: Дилерам */}
        <section id="dealers" className="scroll-mt-8">
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Дилерам и оптовым партнерам
            </h2>
            <p className="text-lg text-gray-600">
              B2B, онлайн-заказ, договор
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Сотрудничество в сфере премиальных ароматов</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                <strong>AROMARUSSIA</strong> предлагает профессиональные решения для:
              </p>
              <ul className="space-y-2 text-gray-700 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-[#D4830F] font-bold">—</span>
                  <span>интерьерной парфюмерии</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D4830F] font-bold">—</span>
                  <span>премиальных ароматов для дома</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D4830F] font-bold">—</span>
                  <span>ароматизации бизнеса (отели, банки, салоны, офисы, бутики, девелопмент)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D4830F] font-bold">—</span>
                  <span>интерьерных аксессуаров для дома и подарочных решений</span>
                </li>
              </ul>
              <p className="text-gray-700 leading-relaxed font-medium mt-4">
                Мы создаем не просто продукт, а атмосферу, которая усиливает ценность пространства.
              </p>
            </CardContent>
          </Card>

          {/* Почему с нами выгодно работать */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Почему с нами выгодно работать</h3>
            <p className="text-gray-700 mb-6">
              Ваши клиенты ценят качество, эстетику и статус. Мы предлагаем ассортимент, который соответствует этим ожиданиям.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Target className="h-6 w-6 text-[#D4830F]" />
                    <CardTitle className="text-xl">Сильный продукт</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>премиальные композиции</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>устойчивые формулы</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>узнаваемые бренды</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>востребованность в сегменте среднего и высокого ценового уровня</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <UserCheck className="h-6 w-6 text-[#D4830F]" />
                    <CardTitle className="text-xl">Поддержка партнера</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>маркетинговые материалы</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>консультационная поддержка</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>обучение по продукту</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>помощь в подборе ассортимента</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Условия сотрудничества */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Условия сотрудничества</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-[#D4830F] font-bold">—</span>
                  <span>Работа по договору</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D4830F] font-bold">—</span>
                  <span>Онлайн-кабинет для заказов</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#D4830F] font-bold">—</span>
                  <span>Минимальный закупочный объем обсуждается индивидуально</span>
                </li>
              </ul>
              <p className="text-gray-700 mt-4">
                Мы рассматриваем индивидуальные условия для каждого партнера.
              </p>
            </CardContent>
          </Card>

          {/* Потенциал прибыли */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Потенциал прибыли</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Мы предоставляем:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>рекомендованные розничные цены</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>оптовые цены для партнера</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>расчет маржинальности</span>
                </li>
              </ul>
              <p className="text-gray-700 mt-4">
                Это позволяет заранее оценить экономику проекта и планировать развитие.
              </p>
            </CardContent>
          </Card>

          {/* Как начать сотрудничество */}
          <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Как начать сотрудничество</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/90 mb-6 leading-relaxed">
                Для подключения к дилерской программе необходимо направить запрос: <a href="mailto:office@aromarussia.ru" className="text-[#D4830F] font-semibold hover:underline">office@aromarussia.ru</a> или отправить заявку с помощью формы ниже. После согласования условий предоставляется доступ к B2B-кабинету.
              </p>
              <Dialog open={isDealersFormOpen} onOpenChange={setIsDealersFormOpen}>
                <DialogTrigger asChild>
                  <Button className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#D4830F] hover:bg-[#b8700d] text-white rounded-md font-medium transition-colors text-base">
                    <Mail className="h-5 w-5" />
                    Отправить заявку
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[620px]">
                  <DialogHeader>
                    <DialogTitle>Как начать сотрудничество</DialogTitle>
                  </DialogHeader>

                  <form onSubmit={handleDealersSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="companyName">Название компании *</Label>
                      <Input
                        id="companyName"
                        value={dealersForm.companyName}
                        onChange={(e) => handleDealersFormChange('companyName', e.target.value)}
                        placeholder="ООО Пример"
                        className="mt-1"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="contacts">Контакты *</Label>
                      <Textarea
                        id="contacts"
                        value={dealersForm.contacts}
                        onChange={(e) => handleDealersFormChange('contacts', e.target.value)}
                        placeholder="Контактное лицо, телефон, email"
                        className="mt-1 min-h-[90px]"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="requisites">Реквизиты *</Label>
                      <Textarea
                        id="requisites"
                        value={dealersForm.requisites}
                        onChange={(e) => handleDealersFormChange('requisites', e.target.value)}
                        placeholder="ИНН, КПП, юридический адрес, банковские реквизиты"
                        className="mt-1 min-h-[90px]"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="brands">Какие бренды хотите закупать *</Label>
                      <Textarea
                        id="brands"
                        value={dealersForm.brands}
                        onChange={(e) => handleDealersFormChange('brands', e.target.value)}
                        placeholder="Перечислите бренды и примерные объемы"
                        className="mt-1 min-h-[90px]"
                        required
                      />
                    </div>

                    <div className="space-y-2 rounded-md border border-gray-200 bg-gray-50 p-3">
                      <label className="flex items-start gap-2 text-sm text-gray-700">
                        <Checkbox
                          checked={dealersForm.agreeDocuments}
                          onCheckedChange={(checked) => handleDealersFormChange('agreeDocuments', checked === true)}
                          className="mt-0.5"
                        />
                        <span>
                          Я принимаю{' '}
                          <Link href="/privacy" target="_blank" className="text-[#D4830F] underline underline-offset-2">
                            Политику конфиденциальности
                          </Link>
                          ,{' '}
                          <Link href="/terms" target="_blank" className="text-[#D4830F] underline underline-offset-2">
                            Условия использования
                          </Link>
                          {' '}и даю согласие на{' '}
                          <Link href="/privacy" target="_blank" className="text-[#D4830F] underline underline-offset-2">
                            обработку персональных данных
                          </Link>
                          {' '}*
                        </span>
                      </label>
                    </div>

                    {formError && (
                      <p className="text-sm text-red-500">{formError}</p>
                    )}
                    {submitSuccess && (
                      <p className="text-sm text-green-600">Заявка отправлена. Мы свяжемся с вами в ближайшее время.</p>
                    )}

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsDealersFormOpen(false)}>
                        Закрыть
                      </Button>
                      <Button
                        type="submit"
                        className="bg-[#D4830F] hover:bg-[#b8700d]"
                        disabled={isSubmitting || !dealersForm.agreeDocuments}
                      >
                        {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
