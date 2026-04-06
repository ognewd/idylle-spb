'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { AlertTriangle, ArrowLeft, CheckCircle2, FileText, ShieldCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function Step({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-gray-700">{children}</CardContent>
    </Card>
  );
}

export default function DealerManagementDocPage() {
  const router = useRouter();
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/admin/documentation')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Управление дилерами</h1>
            <p className="text-sm text-gray-600">Инструкция для администратора</p>
          </div>
        </div>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <FileText className="h-5 w-5" />
              Где это находится
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-900">
            Откройте <strong>Админка → Партнеры и дилеры → Опт (дилеры)</strong>.
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Step title="1) Обработка заявки дилера">
            <p>Перейдите в список заявок и проверьте компанию, контакты, реквизиты, желаемые бренды.</p>
            <p>Если заявка подходит — создайте профиль дилера.</p>
          </Step>

          <Step title="2) Настройка доступа к брендам">
            <p>В карточке дилера отметьте только разрешенные бренды в блоке «Бренды и скидки».</p>
            <p>Сохраните изменения кнопкой «Сохранить изменения».</p>
          </Step>

          <Step title="3) Базовые скидки по брендам">
            <p>Для каждого выбранного бренда задайте скидку от <strong>1 до 99%</strong>.</p>
            <p>Это основная скидка, по которой дилер видит цену в витрине.</p>
          </Step>

          <Step title="4) Пользователи дилера">
            <p>В блоке «Пользователи дилера» добавьте сотрудников компании (email и пароль).</p>
            <p>При необходимости можно заблокировать или удалить пользователя.</p>
          </Step>

          <Step title="5) Заказы дилера">
            <p>Дилер оформляет заказ через витрину; заказ отображается в «Мои заказы» у дилера и в общих заказах админки.</p>
            <p>Письма по дилерскому заказу уходят на <strong>opt@aromarussia.ru</strong> и дилеру.</p>
          </Step>

          <Step title="6) Контроль после изменений">
            <p>Проверьте, что дилер видит только разрешенные бренды и корректные цены после скидки.</p>
            <p>Сделайте тестовый заказ и убедитесь, что уведомления отправляются.</p>
          </Step>
        </div>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Скриншоты</CardTitle>
            <CardDescription>Реальные скриншоты сайта по шагам настройки дилера</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <figure className="space-y-2">
              <button
                type="button"
                onClick={() =>
                  setLightbox({
                    src: '/images/docs/dealer-step-1-section.png',
                    alt: 'Раздел Партнеры и дилеры в админке',
                  })
                }
                className="w-full text-left"
              >
                <img
                  src="/images/docs/dealer-step-1-section.png"
                  alt="Раздел Партнеры и дилеры в админке"
                  className="w-full rounded-lg border object-cover transition hover:opacity-90"
                />
              </button>
              <figcaption className="text-xs text-gray-600">Шаг 1: вход в раздел «Партнеры и дилеры»</figcaption>
            </figure>
            <figure className="space-y-2">
              <button
                type="button"
                onClick={() =>
                  setLightbox({
                    src: '/images/docs/dealer-step-2-wholesale.png',
                    alt: 'Экран опта и заявок',
                  })
                }
                className="w-full text-left"
              >
                <img
                  src="/images/docs/dealer-step-2-wholesale.png"
                  alt="Экран опта и заявок"
                  className="w-full rounded-lg border object-cover transition hover:opacity-90"
                />
              </button>
              <figcaption className="text-xs text-gray-600">Шаг 2: экран «Опт: дилеры и заявки»</figcaption>
            </figure>
            <figure className="space-y-2">
              <button
                type="button"
                onClick={() =>
                  setLightbox({
                    src: '/images/docs/dealer-step-3-brand-discounts.png',
                    alt: 'Бренды и базовые скидки дилера',
                  })
                }
                className="w-full text-left"
              >
                <img
                  src="/images/docs/dealer-step-3-brand-discounts.png"
                  alt="Бренды и базовые скидки дилера"
                  className="w-full rounded-lg border object-cover transition hover:opacity-90"
                />
              </button>
              <figcaption className="text-xs text-gray-600">Шаг 3: выбор брендов и базовые скидки</figcaption>
            </figure>
            <figure className="space-y-2">
              <button
                type="button"
                onClick={() =>
                  setLightbox({
                    src: '/images/docs/dealer-step-4-users.png',
                    alt: 'Пользователи дилера',
                  })
                }
                className="w-full text-left"
              >
                <img
                  src="/images/docs/dealer-step-4-users.png"
                  alt="Пользователи дилера"
                  className="w-full rounded-lg border object-cover transition hover:opacity-90"
                />
              </button>
              <figcaption className="text-xs text-gray-600">Шаг 4: управление пользователями дилера</figcaption>
            </figure>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <AlertTriangle className="h-5 w-5" />
                Правила безопасности
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-amber-900 space-y-1">
              <p>Не выдавайте дилеру лишние бренды «на всякий случай».</p>
              <p>Не передавайте пароли в открытых чатах — используйте защищенные каналы.</p>
              <p>При увольнении сотрудника дилера сразу блокируйте его учетную запись.</p>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-900">
                <ShieldCheck className="h-5 w-5" />
                Чек-лист перед стартом
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-emerald-900 space-y-1">
              <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Выбраны нужные бренды</p>
              <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Проставлены скидки 1..99%</p>
              <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Создан хотя бы 1 пользователь дилера</p>
              <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Проверены уведомления по тестовому заказу</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-indigo-200 bg-indigo-50">
          <CardHeader>
            <CardTitle className="text-indigo-900">Лайфхак для тестирования пользователей</CardTitle>
            <CardDescription className="text-indigo-800">
              Gmail поддерживает alias через символ <strong>+</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-indigo-900 space-y-2">
            <p>
              Для сайта это разные email, а для Gmail — один и тот же почтовый ящик. Это удобно для теста
              регистрации/входа нескольких пользователей без создания новых реальных ящиков.
            </p>
            <div className="rounded-md border border-indigo-200 bg-white p-3 font-mono text-sm">
              <p>ognew.d@gmail.com</p>
              <p>ognew.d+1@gmail.com</p>
              <p>ognew.d+2@gmail.com</p>
            </div>
          </CardContent>
        </Card>

        <div>
          <Button asChild variant="outline">
            <Link href="/admin/wholesale">Перейти к управлению дилерами</Link>
          </Button>
        </div>
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/75 p-4 md:p-8"
          onClick={() => setLightbox(null)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') setLightbox(null);
          }}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-md bg-white/90 p-2 text-gray-800 hover:bg-white"
            onClick={() => setLightbox(null)}
            aria-label="Закрыть"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="h-full w-full flex items-center justify-center">
            <img
              src={lightbox.src}
              alt={lightbox.alt}
              className="max-h-full max-w-full rounded-lg bg-white object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}

