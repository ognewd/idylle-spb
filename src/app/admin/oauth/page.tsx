'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function OAuthProvidersPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Button
              variant="ghost"
              onClick={() => router.push('/admin')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">OAuth / Социальные сети</h1>
              <p className="text-gray-600">Настройка авторизации через социальные сети</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Google OAuth */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/oauth/google')}>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-blue-500 w-16 h-16 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">G</span>
                </div>
                <div>
                  <CardTitle className="text-xl">Google OAuth</CardTitle>
                  <CardDescription>Настройка авторизации через Google</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Настроить</Button>
            </CardContent>
          </Card>

          {/* VK OAuth */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/oauth/vk')}>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-[#4680C2] w-16 h-16 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">VK</span>
                </div>
                <div>
                  <CardTitle className="text-xl">VK OAuth</CardTitle>
                  <CardDescription>Настройка авторизации через VK</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Настроить</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
