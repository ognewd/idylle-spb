'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ContactRequestFormProps {
  productName?: string;
  productUrl?: string;
  submitText?: string;
  compact?: boolean;
}

const SUCCESS_TEXT = 'Спасибо! Мы получили ваш запрос и свяжемся с вами в ближайшее время.';

function normalizePhoneInput(value: string): string {
  return value.replace(/[^\d+\-()\s]/g, '').slice(0, 25);
}

export function ContactRequestForm({
  productName,
  productUrl,
  submitText = 'Отправить заявку',
  compact = false,
}: ContactRequestFormProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [question, setQuestion] = useState('');
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName.trim() || !phone.trim() || !email.trim() || !question.trim()) {
      setError('Заполните обязательные поля');
      return;
    }
    if (!consent) {
      setError('Необходимо согласие на обработку персональных данных');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          question: question.trim(),
          consent,
          productName: productName || '',
          productUrl: productUrl || '',
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.error || 'Не удалось отправить заявку');
        return;
      }

      setSuccess(SUCCESS_TEXT);
      setFullName('');
      setPhone('');
      setEmail('');
      setQuestion('');
      setConsent(false);
    } catch {
      setError('Не удалось отправить заявку');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className={compact ? 'space-y-3' : 'space-y-5'}>
      {productName && (
        <div className="rounded-md border border-muted bg-muted/30 p-3 text-sm">
          <p className="font-medium">Товар: {productName}</p>
          {productUrl && (
            <p className="text-muted-foreground break-all">
              Ссылка: {productUrl}
            </p>
          )}
        </div>
      )}

      <div>
        <Label htmlFor="contact-full-name">ФИО *</Label>
        <Input
          id="contact-full-name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Иванов Иван Иванович"
          required
        />
      </div>

      <div className={compact ? 'space-y-3' : 'grid gap-4 md:grid-cols-2'}>
        <div>
          <Label htmlFor="contact-phone">Телефон *</Label>
          <Input
            id="contact-phone"
            value={phone}
            onChange={(e) => setPhone(normalizePhoneInput(e.target.value))}
            placeholder="+7 (999) 123-45-67"
            required
          />
        </div>
        <div>
          <Label htmlFor="contact-email">Email *</Label>
          <Input
            id="contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="mail@example.com"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="contact-question">Вопрос *</Label>
        <Textarea
          id="contact-question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={compact ? 4 : 5}
          placeholder="Опишите ваш вопрос..."
          required
        />
      </div>

      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5"
          required
        />
        <span>
          Я согласен(на) на обработку персональных данных в соответствии с{' '}
          <Link href="/privacy" className="text-primary underline">
            политикой конфиденциальности
          </Link>
          .
        </span>
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-700">{success}</p>}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Отправка...' : submitText}
      </Button>
    </form>
  );
}

