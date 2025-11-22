'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Heart, Phone, Mail, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

const brands = [
  {
    name: 'Locherber Milano',
    logo: '/brands/locherber-milano.jpg',
    description: 'Коллекции ароматов класса люкс из Италии, это не только совершенное звучание парфюмерных композиций, но и большое количество предметов ароматизации и объемов, рассчитанных на различные площади и даже самые большие пространства. Каждый аромат посвящен какой-либо стране, материку, городу и знаковому месту на планете.',
    highlight: 'Уникальные материалы: дерево Briccole из Венеции, шишки с дерева Банксия из Австралии, итальянский орех, мрамор',
  },
  {
    name: 'Mathilde M',
    logo: '/brands/mathilde-m-new.jpg',
    description: 'Основанная во Франции, представляющая ароматы королевских дворов, в современных обработках парфюмерных композиций. Создает креативные предметы ароматизации, аксессуары для ванной комнаты, предметы декора.',
    highlight: 'Стиль Shabby Chic. Визитная карточка — ароматизированные фигурки с повторной заправкой',
  },
  {
    name: 'Dr. Vranjes Firenze',
    description: 'Паоло Враньез, основатель бренда, уникальная личность. На вопрос, какой ваш любимый аромат, он всегда отвечает: «Следующий». В коллекции 37 ароматов, каждый достоин восхищения.',
    highlight: 'Коллекционные ароматы и библиотека ароматов, связанных с эмоциями и воспоминаниями',
  },
  {
    name: 'Baobab Collection',
    description: 'Интерьерные ароматы премиального бельгийского бренда (основан в 2002 году). Оригинальный дизайн вдохновлен африканскими путешествиями по Танзании с ее первобытными местами и дикой природой.',
    highlight: 'Великолепно украшает интерьеры с мудростью и духом великого путешественника',
  },
  {
    name: 'ERBAE Essences for home',
    description: 'Это простота и гармония. Линия ароматических диффузоров для дома, созданных из уникальных природных ингредиентов. Создают уютную и безмятежную атмосферу в вашем пространстве.',
    highlight: 'Наполняйте дом энергией природы',
  },
  {
    name: 'Miho Unexpected Things',
    description: 'Подсвечники ручной работы — настоящее произведение искусства. Предметы декора и аксессуары в доме, как уникальные украшения и незабываемые эмоции.',
    highlight: 'Каждый элемент произведен вручную и не повторяется',
  },
  {
    name: 'Maison Berger Paris',
    description: 'Единственная марка в мире, прошедшая через десятилетия, основанная в 1898 года. Лампы Берже за несколько минут способны очистить воздух от любого неприятного запаха, дезинфицировать воздух и наполнить дом любимым ароматом.',
    highlight: 'Прекрасные предметы интерьера с функцией очистки воздуха',
  },
  {
    name: 'VOLUSPA',
    description: 'Ароматические свечи класса люкс производства США. Поразительный дизайн, чрезвычайно тонкие и сложные ароматы, уникальные качества воска.',
    highlight: 'Поразительный дизайн и уникальный воск',
  },
  {
    name: 'CULTI Milano',
    description: 'Ароматы CULTI характеризуются своим уникальным стилем, основанным на качестве, тщательном отборе материалов и ингредиентов, и потрясающем внимании к деталям.',
    highlight: 'Персональный подход к ароматизации частного дома и рабочего пространства',
  },
  {
    name: 'Esteban Paris Parfums',
    description: 'Французский парфюмерный дом, каждая композиция состоит из нескольких нот. Коллекции из ароматических диффузоров, сменных ароматов, парфюмерных свечей, электрических диффузоров.',
    highlight: 'Богатые многослойные композиции',
  },
  {
    name: 'Plantes & Parfums de Provence',
    description: 'Сделано с душой и любовью. Каждый аромат — проникновение в уголок сознания, воспоминания о самых прекрасных моментах в жизни и продолжение их.',
    highlight: 'Натуральные эфирные масла и саше из цветов лаванды',
  },
  {
    name: 'Castelbel Porto',
    description: 'Королевские ароматы из Португалии. Богатый выбор на любой, самый искушенный вкус. Ароматы, которыми пользуются королевские династии.',
    highlight: 'Роскошные композиции королевского уровня',
  },
];

export default function BrandsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Banner with Image */}
      <section className="relative h-[500px] overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/60 to-black/40"></div>
        </div>
        
        {/* Content */}
        <div className="container mx-auto px-4 h-full flex items-center relative z-10">
          <div className="max-w-2xl text-white">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Star className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-wider">Премиум бренды</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Наши бренды
            </h1>
            
            <p className="text-lg md:text-xl text-gray-100 mb-8 max-w-xl">
              Эксклюзивные коллекции мировых производителей ароматов для дома из Франции, Италии и Португалии
            </p>
            
            <Button 
              size="lg" 
              className="bg-white text-gray-900 hover:bg-gray-100 shadow-lg"
              onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}
            >
              Смотреть бренды
            </Button>
          </div>
        </div>
      </section>

      {/* Brands Grid */}
      <section className="relative py-16 bg-background overflow-hidden">
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-3"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1584802036285-3a9370a0be79?q=80&w=2070&auto=format&fit=crop)',
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background"></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {brands.map((brand, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:border-primary/50">
                  <CardHeader>
                    {brand.logo ? (
                      <div className="space-y-3">
                        <div className="relative w-full h-20 flex items-center justify-start bg-gradient-to-r from-muted/50 to-transparent rounded-lg px-6 py-4">
                          <div className="relative w-48 h-16">
                            <Image 
                              src={brand.logo} 
                              alt={brand.name}
                              fill
                              className="object-contain object-left"
                            />
                          </div>
                        </div>
                        <CardTitle className="flex items-center gap-2 text-xl">
                          <Sparkles className="h-5 w-5 text-primary" />
                          {brand.name}
                        </CardTitle>
                      </div>
                    ) : (
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <Sparkles className="h-5 w-5 text-primary" />
                        {brand.name}
                      </CardTitle>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {brand.description}
                    </p>
                    {brand.highlight && (
                      <div className="flex gap-2 p-3 bg-primary/5 rounded-lg border border-primary/10">
                        <Heart className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-medium text-primary">
                          {brand.highlight}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Посетите наш бутик
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Откройте для себя мир ароматов в нашем шоуруме
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <Link href="/home">
                  Ароматы для дома
                </Link>
              </Button>
              
              <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
                <a href="mailto:info@idylle.spb.ru">
                  <Mail className="mr-2 h-5 w-5" />
                  Написать нам
                </a>
              </Button>
            </div>

            <div className="pt-8 border-t space-y-3">
              <p className="text-lg font-semibold">По всем вопросам:</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-muted-foreground">
                <a href="tel:88005008729" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Phone className="h-4 w-4" />
                  <span className="font-medium">8-800-500-87-29</span>
                </a>
                <span className="hidden sm:inline">•</span>
                <a href="mailto:info@idylle.spb.ru" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Mail className="h-4 w-4" />
                  <span className="font-medium">info@idylle.spb.ru</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}





