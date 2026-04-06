'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminDocumentationPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/admin')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Документация</h1>
        </div>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Разделы
            </CardTitle>
            <CardDescription>
              Выберите инструкцию для работы в админке.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/admin/documentation/dealer-management"
              className="flex items-center justify-between rounded-lg border p-4 transition hover:bg-gray-50"
            >
              <div>
                <p className="font-medium text-gray-900">Управление дилерами</p>
                <p className="text-sm text-gray-600">Заявки, доступы, скидки, пользователи и заказы дилера</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-500" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

