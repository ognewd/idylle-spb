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
  Shield,
  FileText,
  CheckSquare,
  Wrench,
  Star,
  Truck
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

  // Конфигурация карточек с разделением на секции
  // Порядок: строго 1-12 как указано в требованиях
  const allMenuItems = [
    // Секция A: Каталог
    {
      title: 'Товары',
      description: 'Управление каталогом. Список или таблица с массовыми изменениями',
      icon: Package,
      href: '/admin/products',
      color: 'bg-blue-500',
      section: 'products' as const,
      sectionName: 'Каталог' as const,
    },
    {
      title: 'Категории',
      description: 'Управление категориями',
      icon: Settings,
      href: '/admin/categories',
      color: 'bg-green-500',
      section: 'categories' as const,
      sectionName: 'Каталог' as const,
    },
    {
      title: 'Фильтры',
      description: 'Настройка фильтров каталога',
      icon: BarChart3,
      href: '/admin/filters',
      color: 'bg-purple-500',
      section: 'filters' as const,
      sectionName: 'Каталог' as const,
    },
    // Секция B: Продажи
    {
      title: 'Заказы',
      description: 'Просмотр и управление заказами',
      icon: ShoppingCart,
      href: '/admin/orders',
      color: 'bg-red-500',
      section: 'orders' as const,
      sectionName: 'Продажи' as const,
    },
    {
      title: 'Покупатели',
      description: 'Управление покупателями',
      icon: Users,
      href: '/admin/buyers',
      color: 'bg-orange-500',
      section: 'users' as const,
      sectionName: 'Продажи' as const,
    },
    {
      title: 'Сезонные скидки',
      description: 'Управление скидками по категориям',
      icon: Tag,
      href: '/admin/seasonal-discounts',
      color: 'bg-pink-500',
      section: 'seasonal-discounts' as const,
      sectionName: 'Продажи' as const,
    },
    // Секция C: Коммуникации и контент
    {
      title: 'Управление email',
      description: 'SMTP настройки и шаблоны писем',
      icon: Mail,
      href: '/admin/email',
      color: 'bg-cyan-500',
      section: 'products' as const, // Using products section for now, can be added to permissions later
      sectionName: 'Коммуникации и контент' as const,
    },
    {
      title: 'Чат',
      description: 'Сообщения от пользователей',
      icon: MessageCircle,
      href: '/admin/chat',
      color: 'bg-teal-500',
      section: 'products' as const, // Using products section for now, can be added to permissions later
      sectionName: 'Коммуникации и контент' as const,
    },
    {
      title: 'Отзывы',
      description: 'Модерация отзывов на товары',
      icon: Star,
      href: '/admin/reviews',
      color: 'bg-yellow-500',
      section: 'products' as const,
      sectionName: 'Коммуникации и контент' as const,
    },
    {
      title: 'Страницы',
      description: 'Управление внутренними страницами сайта',
      icon: FileText,
      href: '/admin/pages',
      color: 'bg-amber-500',
      section: 'products' as const,
      sectionName: 'Коммуникации и контент' as const,
    },
    // Секция D: Администрирование и задачи
    {
      title: 'Администраторы',
      description: 'Управление администраторами',
      icon: Users,
      href: '/admin/admins',
      color: 'bg-indigo-500',
      section: 'administrators' as const,
      sectionName: 'Администрирование и задачи' as const,
    },
    {
      title: 'OAuth / Социальные сети',
      description: 'Настройка авторизации через социальные сети',
      icon: Shield,
      href: '/admin/oauth',
      color: 'bg-gradient-to-br from-blue-500 to-purple-600',
      section: 'products' as const,
      sectionName: 'Администрирование и задачи' as const,
    },
    {
      title: 'Режим обслуживания',
      description: 'Управление режимом обслуживания сайта',
      icon: Wrench,
      href: '/admin/maintenance',
      color: 'bg-orange-500',
      section: 'products' as const,
      sectionName: 'Администрирование и задачи' as const,
    },
    {
      title: 'Настройки безопасности',
      description: 'Rate limit: логин, регистрация, заказы, подписка',
      icon: Shield,
      href: '/admin/rate-limit',
      color: 'bg-slate-600',
      section: 'administrators' as const,
      sectionName: 'Администрирование и задачи' as const,
    },
    {
      title: 'Задачи по сайту',
      description: 'Постановка и отслеживание задач',
      icon: CheckSquare,
      href: '/admin/tasks',
      color: 'bg-violet-500',
      section: 'products' as const,
      sectionName: 'Администрирование и задачи' as const,
    },
    {
      title: 'Доставка (СДЕК)',
      description: 'Учётные данные API СДЕК для автокомплита городов и расчёта доставки',
      icon: Truck,
      href: '/admin/delivery',
      color: 'bg-emerald-500',
      section: 'orders' as const,
      sectionName: 'Администрирование и задачи' as const,
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

        {/* Menu Grid with Sections */}
        <div className="space-y-6">
          {/* Группируем карточки по секциям */}
          {['Каталог', 'Продажи', 'Коммуникации и контент', 'Администрирование и задачи'].map((sectionName) => {
            const sectionItems = menuItems.filter(item => item.sectionName === sectionName);
            
            if (sectionItems.length === 0) return null;

            // Легкие фоновые цвета для разных секций (очень ненавязчивые)
            const sectionBgClass = 
              sectionName === 'Каталог' ? 'bg-blue-50/30' :
              sectionName === 'Продажи' ? 'bg-green-50/30' :
              sectionName === 'Коммуникации и контент' ? 'bg-purple-50/30' :
              'bg-slate-50/30';

            return (
              <div 
                key={sectionName} 
                className={`${sectionBgClass} rounded-xl border border-gray-100 shadow-sm p-6 space-y-4 transition-all hover:shadow-md`}
              >
                {/* Заголовок секции */}
                <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200/50 pb-3">
                  {sectionName}
                </h2>
                
                {/* Сетка карточек секции: 1 колонка на мобильных, 2 на планшетах, 3 на десктопе */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sectionItems.map((item) => (
                    <Card key={item.href} className="hover:shadow-lg transition-shadow cursor-pointer flex flex-col bg-white">
                      <CardHeader className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-lg ${item.color} flex-shrink-0`}>
                            <item.icon className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg">{item.title}</CardTitle>
                            <CardDescription className="text-sm">{item.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
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
            );
          })}
        </div>
      </div>
    </div>
  );
}
