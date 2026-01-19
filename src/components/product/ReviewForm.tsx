'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewFormProps {
  productId: string;
  onSuccess?: () => void;
}

export function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = session?.user?.id;
  const isAuthenticated = !!userId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setError('Необходимо выбрать рейтинг');
      return;
    }

    // Если пользователь не авторизован, проверяем наличие имени и email
    if (!isAuthenticated) {
      if (!userName.trim()) {
        setError('Необходимо указать имя');
        return;
      }
      if (!userEmail.trim()) {
        setError('Необходимо указать email');
        return;
      }
      // Простая валидация email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userEmail.trim())) {
        setError('Некорректный email адрес');
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          userId: userId || null,
          rating,
          title: title.trim() || null,
          comment: comment.trim() || null,
          userName: !isAuthenticated ? userName.trim() : null,
          userEmail: !isAuthenticated ? userEmail.trim() : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при отправке отзыва');
      }

      setIsSuccess(true);
      // Очищаем форму
      setRating(0);
      setTitle('');
      setComment('');
      setUserName('');
      setUserEmail('');
      
      // Вызываем callback для обновления списка отзывов
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
          setIsSuccess(false);
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Не удалось отправить отзыв');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-center">
        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-green-900 mb-1">
          Спасибо за отзыв!
        </h3>
        <p className="text-sm text-green-700">
          Ваш отзыв отправлен на модерацию и появится после одобрения администратором.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="rating" className="mb-2 block">
          Рейтинг *
        </Label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus:outline-none transition-transform hover:scale-110"
              disabled={isSubmitting}
            >
              <Star
                className={cn(
                  'h-8 w-8 transition-colors',
                  star <= (hoverRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                )}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-muted-foreground">
              {rating} {rating === 1 ? 'звезда' : rating < 5 ? 'звезды' : 'звезд'}
            </span>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="title">Заголовок отзыва (необязательно)</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Краткое описание вашего отзыва"
          disabled={isSubmitting}
          maxLength={100}
        />
      </div>

      <div>
        <Label htmlFor="comment">Комментарий (необязательно)</Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Расскажите подробнее о вашем опыте использования товара"
          disabled={isSubmitting}
          rows={4}
          maxLength={1000}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {comment.length}/1000 символов
        </p>
      </div>

      {/* Поля для анонимных пользователей */}
      {!isAuthenticated && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="userName">Ваше имя *</Label>
            <Input
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Введите ваше имя"
              disabled={isSubmitting}
              required
            />
          </div>
          <div>
            <Label htmlFor="userEmail">Ваш email *</Label>
            <Input
              id="userEmail"
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="example@mail.com"
              disabled={isSubmitting}
              required
            />
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting || rating === 0 || (!isAuthenticated && (!userName.trim() || !userEmail.trim()))}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Отправка...
          </>
        ) : (
          'Отправить отзыв'
        )}
      </Button>
    </form>
  );
}
