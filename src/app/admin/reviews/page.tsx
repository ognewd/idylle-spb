'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Check, X, Trash2, Package, User, Calendar, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Review {
  id: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
  isApproved: boolean;
  createdAt: string;
  userName?: string | null;
  userEmail?: string | null;
  user: {
    id: string;
    name?: string | null;
    email: string;
  } | null;
  product: {
    id: string;
    name: string;
    shortName?: string | null;
    slug: string;
    images: Array<{ url: string }>;
  };
}

export default function AdminReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [allReviews, setAllReviews] = useState<Review[]>([]); // Все отзывы для подсчета
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'all'>('pending');
  const [typeFilter, setTypeFilter] = useState<'product' | 'company'>('product');
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const [lastUpdatedReviewId, setLastUpdatedReviewId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, statusFilter, typeFilter]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      
      // Загружаем отзывы с текущим фильтром
      const response = await fetch(
        `/api/admin/reviews?status=${statusFilter}&type=${typeFilter}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const loadedReviews = data.reviews || [];
        setReviews(loadedReviews);
      } else {
        const errorData = await response.json();
        console.error('Error loading reviews:', errorData);
      }

      // Всегда загружаем все отзывы для подсчета счетчиков
      const allResponse = await fetch(
        `/api/admin/reviews?status=all&type=${typeFilter}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (allResponse.ok) {
        const allData = await allResponse.json();
        setAllReviews(allData.reviews || []);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId: string, approve: boolean) => {
    setUpdatingIds(prev => new Set(prev).add(reviewId));
    setLastUpdatedReviewId(reviewId);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewId,
          isApproved: approve,
        }),
      });

      if (response.ok) {
        // Если одобряем отзыв и фильтр на "pending", переключаем на "approved"
        // чтобы показать одобренный отзыв
        if (approve && statusFilter === 'pending') {
          // Сначала переключаем фильтр, затем загружаем
          // useEffect автоматически вызовет loadReviews при изменении statusFilter
          setStatusFilter('approved');
        } else {
          // Просто перезагружаем отзывы с текущим фильтром
          await loadReviews();
        }
      }
    } catch (error) {
      console.error('Error updating review:', error);
    } finally {
      setUpdatingIds(prev => {
        const next = new Set(prev);
        next.delete(reviewId);
        return next;
      });
      // Очищаем через 2 секунды
      setTimeout(() => setLastUpdatedReviewId(null), 2000);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот отзыв?')) {
      return;
    }

    setUpdatingIds(prev => new Set(prev).add(reviewId));
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/reviews?reviewId=${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await loadReviews();
      }
    } catch (error) {
      console.error('Error deleting review:', error);
    } finally {
      setUpdatingIds(prev => {
        const next = new Set(prev);
        next.delete(reviewId);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    );
  }

  // Используем allReviews для подсчета, если загружены, иначе reviews (fallback)
  // Если фильтр "all", используем текущие reviews, иначе allReviews
  const reviewsForCount = statusFilter === 'all' ? reviews : (allReviews.length > 0 ? allReviews : reviews);
  const pendingReviews = reviewsForCount.filter(r => !r.isApproved);
  const approvedReviews = reviewsForCount.filter(r => r.isApproved);
  const totalReviews = reviewsForCount.length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Отзывы</h1>
          <p className="text-gray-600 mt-2">
            Модерация отзывов пользователей
          </p>
        </div>

        <Tabs defaultValue="product" className="w-full">
          <TabsList>
            <TabsTrigger value="product" onClick={() => setTypeFilter('product')}>
              Отзывы на товар
            </TabsTrigger>
            <TabsTrigger value="company" onClick={() => setTypeFilter('company')} disabled>
              Отзывы на компанию (скоро)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="product" className="mt-6">
            <div className="mb-4 flex gap-2">
              <Button
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('pending')}
              >
                На модерации ({pendingReviews.length})
              </Button>
              <Button
                variant={statusFilter === 'approved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('approved')}
              >
                Одобренные ({approvedReviews.length})
              </Button>
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setStatusFilter('all');
                  loadReviews();
                }}
              >
                Все ({totalReviews})
              </Button>
            </div>

            <div className="space-y-4">
              {reviews.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    Отзывов нет
                  </CardContent>
                </Card>
              ) : (
                reviews.map((review) => (
                  <Card key={review.id} className={cn(
                    !review.isApproved && 'border-yellow-300 bg-yellow-50/30'
                  )}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    'h-4 w-4',
                                    i < review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  )}
                                />
                              ))}
                            </div>
                            <Badge variant={review.isApproved ? 'default' : 'secondary'}>
                              {review.isApproved ? 'Одобрен' : 'На модерации'}
                            </Badge>
                          </div>
                          {review.title && (
                            <h3 className="font-semibold text-lg mb-1">{review.title}</h3>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {!review.isApproved && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprove(review.id, true)}
                              disabled={updatingIds.has(review.id)}
                            >
                              {updatingIds.has(review.id) ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Check className="h-4 w-4 mr-1" />
                                  Одобрить
                                </>
                              )}
                            </Button>
                          )}
                          {review.isApproved && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprove(review.id, false)}
                              disabled={updatingIds.has(review.id)}
                            >
                              {updatingIds.has(review.id) ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <X className="h-4 w-4 mr-1" />
                                  Отклонить
                                </>
                              )}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(review.id)}
                            disabled={updatingIds.has(review.id)}
                          >
                            {updatingIds.has(review.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-red-600" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Товар */}
                        {review.product && (
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                            {review.product.images && review.product.images.length > 0 && (
                              <img
                                src={review.product.images[0].url}
                                alt={review.product.shortName || review.product.name}
                                className="w-16 h-16 object-cover rounded"
                              />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Package className="h-4 w-4 text-gray-400" />
                                <Link
                                  href={`/catalog/${review.product.slug}`}
                                  className="font-medium text-primary hover:underline"
                                  target="_blank"
                                >
                                  {review.product.shortName || review.product.name}
                                </Link>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Комментарий */}
                        {review.comment && (
                          <div>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">
                              {review.comment}
                            </p>
                          </div>
                        )}

                        {/* Информация о пользователе */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground pt-3 border-t">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{review.user?.name || review.userName || review.user?.email || review.userEmail || 'Анонимный пользователь'}</span>
                          </div>
                          {!review.user && review.userEmail && (
                            <span className="text-xs text-gray-500">({review.userEmail})</span>
                          )}
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(review.createdAt).toLocaleDateString('ru-RU', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="company" className="mt-6">
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Функционал отзывов на компанию в разработке
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
