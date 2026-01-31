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
  variant?: 'default' | 'inline' | 'footer' | 'footerDark';
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

  const isDark = variant === 'footerDark';

  if (isSuccess) {
    if (isDark) {
      return (
        <div className={cn('text-center p-6 bg-green-900/30 border border-green-500/50 rounded-xl', className)}>
          <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-green-200 mb-1">Подписка оформлена!</h3>
          <p className="text-green-300/90">Проверьте вашу почту и подтвердите подписку</p>
        </div>
      );
    }
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

  if (variant === 'footerDark') {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center justify-center gap-2 text-gray-200">
          <Mail className="h-5 w-5 text-[#D4830F]" />
          <h3 className="font-semibold text-lg">Подписка на новости</h3>
        </div>
        <p className="text-center text-gray-400 text-sm max-w-md mx-auto">
          Получайте эксклюзивные предложения и новости о новых поступлениях
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md mx-auto">
          <div>
            <input
              {...register('email')}
              type="email"
              placeholder="Ваш email"
              className={cn(
                'w-full px-4 py-3 rounded-xl border-2 bg-white/10 border-white/20 text-white placeholder:text-gray-400',
                'focus:outline-none focus:ring-2 focus:ring-[#D4830F] focus:border-[#D4830F] transition-all',
                errors.email && 'border-red-400/60'
              )}
            />
            {errors.email && (
              <p className="text-sm text-red-400 mt-1">{errors.email.message}</p>
            )}
          </div>
          <div className="flex items-start gap-3">
            <Checkbox
              id="acceptMarketing-dark"
              checked={acceptMarketing}
              onCheckedChange={(checked) => setValue('acceptMarketing', checked as boolean)}
              className={cn(
                'border-white/30 data-[state=checked]:bg-[#D4830F] data-[state=checked]:border-[#D4830F] mt-0.5',
                errors.acceptMarketing && 'border-red-400/60'
              )}
            />
            <Label
              htmlFor="acceptMarketing-dark"
              className="text-sm text-gray-300 leading-snug cursor-pointer"
            >
              Я согласен получать новости и специальные предложения
            </Label>
          </div>
          {errors.acceptMarketing && (
            <p className="text-sm text-red-400">{errors.acceptMarketing.message}</p>
          )}
          {error && (
            <div className="rounded-lg bg-red-900/30 border border-red-500/50 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-[#D4830F] to-amber-500 text-white hover:opacity-90 hover:shadow-lg hover:shadow-[#D4830F]/30 py-3 rounded-xl font-medium transition-all"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Подписаться
          </Button>
        </form>
      </div>
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
