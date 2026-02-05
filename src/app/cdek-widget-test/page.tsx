'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';

const WIDGET_SCRIPT = 'https://cdn.jsdelivr.net/npm/@cdek-it/widget@3';
const YANDEX_KEY = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY || '';

export default function CdekWidgetTestPage() {
  const [scriptReady, setScriptReady] = useState(false);
  const [widgetError, setWidgetError] = useState<string | null>(null);
  const initDone = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !scriptReady || initDone.current) return;
    if (!YANDEX_KEY) {
      setWidgetError('Добавьте NEXT_PUBLIC_YANDEX_MAPS_API_KEY в .env.local');
      return;
    }

    const el = document.getElementById('cdek-map');
    if (!el || !window.CDEKWidget) return;

    try {
      initDone.current = true;
      new window.CDEKWidget!({
        from: 'Санкт-Петербург',
        root: 'cdek-map',
        apiKey: YANDEX_KEY,
        servicePath: `${window.location.origin}/api/cdek-widget`,
        defaultLocation: 'Санкт-Петербург',
        lang: 'rus',
        currency: 'RUB',
        goods: [{ weight: 1000, width: 30, height: 20, length: 15 }],
        tariffs: {
          office: [234, 136, 138],
          door: [233, 137, 139],
        },
        onReady: () => setWidgetError(null),
        onCalculate: (_tariffs: unknown, _address: unknown) => {},
        onChoose: (_mode: string, _tariff: unknown, _address: unknown) => {},
      });
    } catch (e) {
      setWidgetError(e instanceof Error ? e.message : 'Ошибка инициализации виджета');
    }
  }, [scriptReady]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
          ← На главную
        </Link>

        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Тест виджета СДЭК 3.0
        </h1>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-sm text-amber-900">
          <p className="font-medium mb-1">Что от вас требуется:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>
              Получить ключ Яндекс.Карт:{' '}
              <a
                href="https://developer.tech.yandex.ru/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                developer.tech.yandex.ru
              </a>
              {' '}→ «Получить ключ» → сервис «JavaScript API и HTTP Геокодер».
            </li>
            <li>
              В настройках ключа указать <strong>HTTP Referrer</strong>:{' '}
              <code className="bg-amber-100 px-1 rounded">http://localhost:3000/*</code>{' '}
              (для разработки) или ваш домен.
            </li>
            <li>
              В корне проекта в файле <code className="bg-amber-100 px-1 rounded">.env.local</code>{' '}
              добавить строку: <code className="bg-amber-100 px-1 rounded">NEXT_PUBLIC_YANDEX_MAPS_API_KEY=ваш_ключ</code>
            </li>
            <li>
              Перезапустить dev-сервер (<code className="bg-amber-100 px-1 rounded">npm run dev</code>) и обновить страницу.
            </li>
          </ol>
          <p className="mt-2 text-amber-800">
            Учётные данные СДЭК (CDEK_CLIENT_ID / CDEK_CLIENT_SECRET) уже заданы в админке или в .env — их менять не нужно.
          </p>
        </div>

        {widgetError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-800 text-sm">
            {widgetError}
          </div>
        )}

        <div
          id="cdek-map"
          className="w-full bg-white border border-gray-200 rounded-lg overflow-hidden"
          style={{ minWidth: 320, height: 600 }}
        />

        <Script
          src={WIDGET_SCRIPT}
          strategy="afterInteractive"
          onLoad={() => setScriptReady(true)}
        />
      </div>
    </div>
  );
}
