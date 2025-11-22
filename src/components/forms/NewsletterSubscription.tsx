'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';

const newsletterSchema = z.object({
  email: z.string().email('Введите корректный email'),
  acceptMarketing: z.boolean().refine(val => val === true, 'Необходимо согласиться на получение рассылки'),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

interface NewsletterSubscriptionProps {
  variant?: 'default' | 'inline' | 'footer';
  className?: string;
}

export function NewsletterSubscription({ 
  variant = 'default', 
  className 
}: NewsletterSubscriptionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
  });

  const acceptMarketing = watch('acceptMarketing');

  const onSubmit = async (data: NewsletterFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          acceptMarketing: data.acceptMarketing,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка подписки');
      }

      setIsSuccess(true);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={cn("text-center p-6 bg-green-50 border border-green-200 rounded-lg", className)}>
        <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
        <h3 className="text-lg font-semibold text-green-800 mb-1">
          Подписка оформлена!
        </h3>
        <p className="text-green-700">
          Проверьте вашу почту и подтвердите подписку
        </p>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className={cn("flex flex-col sm:flex-row gap-2", className)}>
        <div className="flex-1">
          <Input
            {...register('email')}
            type="email"
            placeholder="Ваш email"
            className={cn(errors.email && 'border-destructive')}
          />
          {errors.email && (
            <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
          )}
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Подписаться
        </Button>
      </form>
    );
  }

  if (variant === 'footer') {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center space-x-2">
          <Mail className="h-5 w-5" />
          <h3 className="font-semibold">Подписка на новости</h3>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <Input
              {...register('email')}
              type="email"
              placeholder="Ваш email"
              className={cn(errors.email && 'border-destructive')}
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="acceptMarketing"
              checked={acceptMarketing}
              onCheckedChange={(checked) => setValue('acceptMarketing', checked as boolean)}
              className={cn(errors.acceptMarketing && 'border-destructive')}
            />
            <Label
              htmlFor="acceptMarketing"
              className="text-sm font-normal leading-snug peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Я согласен получать новости и специальные предложения
            </Label>
          </div>
          {errors.acceptMarketing && (
            <p className="text-sm text-destructive">{errors.acceptMarketing.message}</p>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Подписаться
          </Button>
        </form>
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn("max-w-md mx-auto", className)}>
      <div className="text-center mb-6">
        <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Подписка на новости</h2>
        <p className="text-muted-foreground">
          Получайте эксклюзивные предложения и новости о новых поступлениях
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            {...register('email')}
            type="email"
            placeholder="example@email.com"
            className={cn(errors.email && 'border-destructive')}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="acceptMarketing"
            checked={acceptMarketing}
            onCheckedChange={(checked) => setValue('acceptMarketing', checked as boolean)}
            className={cn(errors.acceptMarketing && 'border-destructive')}
          />
          <Label
            htmlFor="acceptMarketing"
            className="text-sm font-normal leading-snug peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Я согласен получать новости и специальные предложения по email
          </Label>
        </div>
        {errors.acceptMarketing && (
          <p className="text-sm text-destructive">{errors.acceptMarketing.message}</p>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Подписаться
        </Button>
      </form>
    </div>
  );
}
