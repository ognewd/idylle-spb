'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building2, 
  Gift, 
  Sparkles,
  CheckCircle2,
  Mail
} from 'lucide-react';
import Link from 'next/link';

type QuizStep = 'goal' | 'industry' | 'budget' | 'result';
type Goal = 'gifts' | 'aromatization' | 'perfume' | 'all' | '';
type Industry = 'retail' | 'hotel' | 'office' | 'auto' | 'other' | '';
type Budget = 'study' | 'trial' | 'permanent' | '';

export default function BusinessPage() {
  const [currentStep, setCurrentStep] = useState<QuizStep>('goal');
  const [goal, setGoal] = useState<Goal>('');
  const [industry, setIndustry] = useState<Industry>('');
  const [budget, setBudget] = useState<Budget>('');
  const [customIndustry, setCustomIndustry] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    contact: '',
    agree: false,
  });

  const handleQuizNext = () => {
    if (currentStep === 'goal' && goal) {
      setCurrentStep('industry');
    } else if (currentStep === 'industry' && industry) {
      setCurrentStep('budget');
    } else if (currentStep === 'budget' && budget) {
      setCurrentStep('result');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // TODO: Send to API
    alert('Спасибо за заявку! Наши специалисты свяжутся с вами в течение 24 часов.');
  };

  const getIndustryName = () => {
    const names: Record<Industry, string> = {
      retail: 'Ритейл, бутики',
      hotel: 'Отели, HoReCa',
      office: 'Офисные центры, коворкинги',
      auto: 'Автосалоны, салоны красоты',
      other: customIndustry || 'Другое',
      '': '',
    };
    return names[industry];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-200/20 to-pink-200/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Ароматы для бизнеса: Усильте ваш бренд и увеличивайте лояльность
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Создайте уникальную атмосферу в вашем пространстве и повышайте лояльность клиентов с помощью эксклюзивных ароматических решений.
            </p>
            
            <Button 
              size="lg" 
              className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-8 py-6 shadow-xl"
              onClick={() => {
                const quizSection = document.getElementById('quiz-section');
                quizSection?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Рассчитать решение для моей задачи
            </Button>
          </div>
        </div>
      </section>

      {/* Solutions Cards */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Выберите ваше направление
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="hover:shadow-xl transition-shadow cursor-pointer border-2 hover:border-primary">
                <CardContent className="p-8">
                  <div className="text-6xl mb-4">🎁</div>
                  <h3 className="text-2xl font-bold mb-4">Корпоративные подарки</h3>
                  <p className="text-muted-foreground mb-6">
                    Элитные аромаподарки для клиентов, партнеров и сотрудников с брендированием под ваш стиль.
                  </p>
                  <Link href="/podarki">
                    <Button variant="outline" className="w-full">
                      Смотреть кейсы и варианты →
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl transition-shadow cursor-pointer border-2 hover:border-primary">
                <CardContent className="p-8">
                  <div className="text-6xl mb-4">🏢</div>
                  <h3 className="text-2xl font-bold mb-4">Аромадизайн помещений</h3>
                  <p className="text-muted-foreground mb-6">
                    Создание уникальной атмосферы в отелях, шоу-румах, офисах и бутиках, которая увеличивает время пребывания гостей.
                  </p>
                  <Link href="/home">
                    <Button variant="outline" className="w-full">
                      Узнать о влиянии на бизнес →
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl transition-shadow cursor-pointer border-2 hover:border-primary">
                <CardContent className="p-8">
                  <div className="text-6xl mb-4">♾️</div>
                  <h3 className="text-2xl font-bold mb-4">Готовая парфюмерия под вашим брендом</h3>
                  <p className="text-muted-foreground mb-6">
                    Разработка и производство духов, свечей и диффузоров с логотипом вашей компании. Полный цикл «под ключ».
                  </p>
                  <Link href="/podarki">
                    <Button variant="outline" className="w-full">
                      Получить коммерческое предложение →
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Quiz Section */}
      <section id="quiz-section" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              {currentStep === 'result' 
                ? 'Идеальное решение для вашего бизнеса'
                : 'Ответьте на 3 вопроса и получите персональное решение для вашего бизнеса'
              }
            </h2>
            
            <Card className="border-2">
              <CardContent className="p-8 md:p-12">
                {/* Quiz Steps */}
                {currentStep === 'goal' && (
                  <div>
                    <h3 className="text-2xl font-bold mb-6">Что вас интересует в первую очередь?</h3>
                    <RadioGroup value={goal} onValueChange={(val) => setGoal(val as Goal)}>
                      <div className="space-y-4">
                        <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted">
                          <RadioGroupItem value="gifts" id="gifts" />
                          <span>Подарки для клиентов/партнеров</span>
                        </label>
                        <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted">
                          <RadioGroupItem value="aromatization" id="aromatization" />
                          <span>Ароматизация моего бизнес-пространства</span>
                        </label>
                        <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted">
                          <RadioGroupItem value="perfume" id="perfume" />
                          <span>Создание парфюмерии под моим брендом</span>
                        </label>
                        <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted">
                          <RadioGroupItem value="all" id="all" />
                          <span>Всё из перечисленного, я еще выбираю</span>
                        </label>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {currentStep === 'industry' && (
                  <div>
                    <h3 className="text-2xl font-bold mb-6">В какой сфере вы работаете?</h3>
                    <Select value={industry} onValueChange={(val) => setIndustry(val as Industry)}>
                      <SelectTrigger className="w-full mb-4">
                        <SelectValue placeholder="Выберите сферу бизнеса" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="retail">Ритейл, бутики</SelectItem>
                        <SelectItem value="hotel">Отели, HoReCa</SelectItem>
                        <SelectItem value="office">Офисные центры, коворкинги</SelectItem>
                        <SelectItem value="auto">Автосалоны, салоны красоты</SelectItem>
                        <SelectItem value="other">Другое</SelectItem>
                      </SelectContent>
                    </Select>
                    {industry === 'other' && (
                      <Input
                        placeholder="Укажите вашу сферу"
                        value={customIndustry}
                        onChange={(e) => setCustomIndustry(e.target.value)}
                        className="mt-4"
                      />
                    )}
                  </div>
                )}

                {currentStep === 'budget' && (
                  <div>
                    <h3 className="text-2xl font-bold mb-6">Какой у вас предполагаемый бюджет или масштаб проекта?</h3>
                    <RadioGroup value={budget} onValueChange={(val) => setBudget(val as Budget)}>
                      <div className="space-y-4">
                        <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted">
                          <RadioGroupItem value="study" id="study" />
                          <span>Пока на стадии изучения, нужна консультация</span>
                        </label>
                        <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted">
                          <RadioGroupItem value="trial" id="trial" />
                          <span>Пробный заказ (до 100 тыс. руб.)</span>
                        </label>
                        <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted">
                          <RadioGroupItem value="permanent" id="permanent" />
                          <span>Постоянное сотрудничество или крупный заказ (от 100 тыс. руб.)</span>
                        </label>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {/* Result Step */}
                {currentStep === 'result' && (
                  <div>
                    <div className="text-center mb-8">
                      <div className="text-6xl mb-4">🎯</div>
                      <h3 className="text-2xl font-bold mb-4">
                        Идеальное решение для {getIndustryName()}
                      </h3>
                      <p className="text-muted-foreground text-lg">
                        {goal === 'gifts' && 'Корпоративные аромаподарки — отличный выбор для укрепления отношений с клиентами и партнерами!'}
                        {goal === 'aromatization' && 'Аромадизайн пространства поможет создать неповторимую атмосферу и увеличить время пребывания гостей!'}
                        {goal === 'perfume' && 'Создание эксклюзивной парфюмерии под вашим брендом — уникальный способ выделиться на рынке!'}
                        {goal === 'all' && 'Мы подготовим комплексное решение, учитывающее все ваши бизнес-задачи!'}
                        {(budget === 'trial' || budget === 'permanent') && ' Наши специалисты готовы приступить к работе!'}
                        {budget === 'study' && ' Получите бесплатную консультацию от наших экспертов!'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                {currentStep !== 'result' && (
                  <div className="flex justify-between mt-8">
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (currentStep === 'goal') {
                          const heroSection = document.getElementById('hero-section');
                          heroSection?.scrollIntoView({ behavior: 'smooth' });
                        } else if (currentStep === 'industry') {
                          setCurrentStep('goal');
                        } else if (currentStep === 'budget') {
                          setCurrentStep('industry');
                        }
                      }}
                    >
                      ← Назад
                    </Button>
                    <Button
                      onClick={handleQuizNext}
                      disabled={
                        (currentStep === 'goal' && !goal) ||
                        (currentStep === 'industry' && !industry) ||
                        (currentStep === 'budget' && !budget)
                      }
                    >
                      Далее →
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">
              Готовы создать незабываемый опыт для вашего бренда?
            </h2>
            <p className="text-xl text-muted-foreground mb-12 text-center">
              Наши специалисты по работе с бизнес-клиентами подготовят для вас индивидуальное предложение в течение 24 часов.
            </p>
            
            <Card className="border-2">
              <CardContent className="p-8">
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Имя *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="Ваше имя"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company">Название компании *</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      required
                      placeholder="Название вашей компании"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contact">Телефон или E-mail *</Label>
                    <Input
                      id="contact"
                      type="text"
                      value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      required
                      placeholder="+7 (___) ___-__-__ или email@example.com"
                    />
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="agree"
                      checked={formData.agree}
                      onCheckedChange={(checked) => setFormData({ ...formData, agree: checked as boolean })}
                      required
                    />
                    <label htmlFor="agree" className="text-sm cursor-pointer">
                      Я согласен на обработку персональных данных *
                    </label>
                  </div>
                  
                  <Button type="submit" className="w-full" size="lg">
                    <Mail className="mr-2 h-5 w-5" />
                    Отправить запрос
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
