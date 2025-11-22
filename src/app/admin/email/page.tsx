'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Settings, FileText } from 'lucide-react';

export default function EmailManagementPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Управление email</h1>
        <p className="text-muted-foreground">
          Настройка почтового сервера и шаблонов email уведомлений
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SMTP Settings */}
        <Link href="/admin/email/smtp" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
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

        {/* Email Templates */}
        <Link href="/admin/email/templates" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle>Шаблоны email</CardTitle>
                  <CardDescription>Управление шаблонами писем</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Создавайте и редактируйте шаблоны email уведомлений
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
