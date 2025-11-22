'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  Settings, 
  BarChart3,
  Plus,
  Edit,
  Trash2,
  LogOut,
  Tag,
  Mail,
  MessageCircle,
  Shield
} from 'lucide-react';
import { hasAccessToSection } from '@/lib/admin-permissions';

interface AdminStats {
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    // Verify token and get admin info
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setAdminUser(payload);
    } catch (error) {
      localStorage.removeItem('admin_token');
      router.push('/admin/login');
      return;
    }

    // Load dashboard stats
    loadStats();
  }, [router]);

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    // Clear admin token
    localStorage.removeItem('admin_token');
    
    // Sign out from NextAuth
    await signOut({ redirect: false });
    
    // Redirect to login
    router.push('/admin/login');
  };

  const allMenuItems = [
    {
      title: 'Товары',
      description: 'Управление каталогом товаров',
      icon: Package,
      href: '/admin/products',
      color: 'bg-blue-500',
      section: 'products' as const,
    },
    {
      title: 'Категории',
      description: 'Управление категориями',
      icon: Settings,
      href: '/admin/categories',
      color: 'bg-green-500',
      section: 'categories' as const,
    },
    {
      title: 'Сезонные скидки',
      description: 'Управление скидками по категориям',
      icon: Tag,
      href: '/admin/seasonal-discounts',
      color: 'bg-pink-500',
      section: 'seasonal-discounts' as const,
    },
    {
      title: 'Фильтры',
      description: 'Настройка фильтров каталога',
      icon: BarChart3,
      href: '/admin/filters',
      color: 'bg-purple-500',
      section: 'filters' as const,
    },
    {
      title: 'Покупатели',
      description: 'Управление покупателями',
      icon: Users,
      href: '/admin/buyers',
      color: 'bg-orange-500',
      section: 'users' as const,
    },
    {
      title: 'Заказы',
      description: 'Просмотр и управление заказами',
      icon: ShoppingCart,
      href: '/admin/orders',
      color: 'bg-red-500',
      section: 'orders' as const,
    },
    {
      title: 'Администраторы',
      description: 'Управление администраторами',
      icon: Users,
      href: '/admin/admins',
      color: 'bg-indigo-500',
      section: 'administrators' as const,
    },
    {
      title: 'Управление email',
      description: 'SMTP настройки и шаблоны писем',
      icon: Mail,
      href: '/admin/email',
      color: 'bg-cyan-500',
      section: 'products' as const, // Using products section for now, can be added to permissions later
    },
    {
      title: 'Чат',
      description: 'Сообщения от пользователей',
      icon: MessageCircle,
      href: '/admin/chat',
      color: 'bg-teal-500',
      section: 'products' as const, // Using products section for now, can be added to permissions later
    },
    {
      title: 'OAuth / Социальные сети',
      description: 'Настройка авторизации через социальные сети',
      icon: Shield,
      href: '/admin/oauth',
      color: 'bg-gradient-to-br from-blue-500 to-purple-600',
      section: 'products' as const,
    },
  ];

  // Фильтруем элементы меню по правам доступа
  const menuItems = adminUser 
    ? allMenuItems.filter(item => hasAccessToSection(adminUser, item.section))
    : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Админ панель</h1>
              <p className="text-gray-600">Добро пожаловать, {adminUser?.email}</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Выйти
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Товары</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                Всего в каталоге
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Пользователи</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Зарегистрированных
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Заказы</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                Всего заказов
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Выручка</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} ₽</div>
              <p className="text-xs text-muted-foreground">
                Общая выручка
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <Card key={item.href} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${item.color}`}>
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  onClick={() => router.push(item.href)}
                >
                  Перейти
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
