'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Settings, FileText, Megaphone } from 'lucide-react';

export default function EmailManagementPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Управление email</h1>
        <p className="text-muted-foreground">
          Настройка почтового сервера, сервисных шаблонов и маркетинговых рассылок
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* SMTP Settings */}
        <Link href="/admin/email/smtp" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Settings className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>SMTP настройки</CardTitle>
                  <CardDescription>Настройка почтового сервера</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Настройте параметры SMTP сервера для отправки email уведомлений
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Service Email Templates */}
        <Link href="/admin/email/templates" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle>Сервисные email</CardTitle>
                  <CardDescription>Шаблоны системных уведомлений</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Шаблоны для подтверждения заказов, сброса паролей и других системных писем
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Marketing Emails */}
        <Link href="/admin/email/marketing" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-pink-100 rounded-lg">
                  <Megaphone className="h-6 w-6 text-pink-600" />
                </div>
                <div>
                  <CardTitle>Маркетинговые email</CardTitle>
                  <CardDescription>Рассылки и кампании</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Создавайте рассылки, управляйте кампаниями и отслеживайте эффективность
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
