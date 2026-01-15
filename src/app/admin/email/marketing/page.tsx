'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Send, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MarketingEmailPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/admin/email" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад к управлению email
        </Link>
        <h1 className="text-3xl font-bold mb-2">Маркетинговые email</h1>
        <p className="text-muted-foreground">
          Создавайте шаблоны и запускайте email-кампании
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Templates */}
        <Link href="/admin/email/marketing/templates" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle>Шаблоны</CardTitle>
                  <CardDescription>Конструктор email-шаблонов</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Создавайте и редактируйте шаблоны писем с помощью конструктора. Добавляйте товары, блоки и настраивайте дизайн.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Drag & drop конструктор</li>
                <li>• Блоки товаров</li>
                <li>• Предпросмотр Desktop/Mobile</li>
              </ul>
            </CardContent>
          </Card>
        </Link>

        {/* Campaigns */}
        <Link href="/admin/email/marketing/campaigns" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-pink-100 rounded-lg">
                  <Send className="h-6 w-6 text-pink-600" />
                </div>
                <div>
                  <CardTitle>Кампании</CardTitle>
                  <CardDescription>Запуск и управление рассылками</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Создавайте кампании, выбирайте аудиторию и отправляйте рассылки. Отслеживайте статистику отправок.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Выбор получателей</li>
                <li>• Планирование отправки</li>
                <li>• Статистика и аналитика</li>
              </ul>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
