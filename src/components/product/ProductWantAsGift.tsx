'use client';

import { useState } from 'react';
import { Gift, Link2, Mail, Copy, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const POSTCARD_TEXT = 'Вот бы кто-то подарил...';

interface ProductWantAsGiftProps {
  productName: string;
  productSlug: string;
  className?: string;
}

export function ProductWantAsGift({ productName, productSlug, className }: ProductWantAsGiftProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toEmail, setToEmail] = useState('');
  const [toName, setToName] = useState('');
  const [fromName, setFromName] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const productUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/catalog/${productSlug}`
      : `/catalog/${productSlug}`;

  const copyLink = async () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/catalog/${productSlug}` : productUrl;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Не удалось скопировать');
    }
  };

  const sendByEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!toEmail.trim()) {
      setError('Введите email получателя');
      return;
    }
    if (!fromName.trim()) {
      setError('Введите, от кого письмо');
      return;
    }
    setSending(true);
    try {
      const url = typeof window !== 'undefined' ? `${window.location.origin}/catalog/${productSlug}` : productUrl;
      const res = await fetch('/api/gift-hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmail: toEmail.trim(),
          toName: toName.trim() || undefined,
          fromName: fromName.trim(),
          productUrl: url,
          productName,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Не удалось отправить');
        return;
      }
      setSent(true);
      setToEmail('');
      setToName('');
      setFromName('');
    } catch {
      setError('Ошибка отправки');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'inline-flex items-center gap-2 rounded-md border border-stone-200/80 bg-stone-50/80 text-stone-700 hover:bg-stone-100 hover:border-stone-300 hover:text-stone-900 font-medium text-sm py-2 px-3.5 shadow-sm transition-colors',
            className
          )}
        >
          <Gift className="h-4 w-4 text-amber-600/90 shrink-0" />
          Хочу это в подарок
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">Намекнуть о подарке</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Открытка */}
          <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-rose-400 via-red-400 to-orange-500 p-6 text-white">
            <p className="text-xl font-bold uppercase tracking-wide text-center drop-shadow-sm">
              {POSTCARD_TEXT}
            </p>
            <p className="text-sm text-center mt-2 opacity-95 truncate px-2" title={productName}>
              {productName}
            </p>
            <Gift className="absolute bottom-3 left-3 h-8 w-8 opacity-80" />
          </div>

          {/* Скопировать ссылку */}
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={copyLink}
            >
              {copied ? (
                <Check className="h-4 w-4 mr-2 text-green-600" />
              ) : (
                <Link2 className="h-4 w-4 mr-2" />
              )}
              {copied ? 'Скопировано' : 'Скопировать ссылку'}
            </Button>
          </div>

          {/* Отправить на почту */}
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-3 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Отправить на почту
            </p>
            {sent ? (
              <p className="text-sm text-green-600">Письмо отправлено.</p>
            ) : (
              <form onSubmit={sendByEmail} className="space-y-3">
                <div>
                  <Label htmlFor="gift-to-email">Кому (email) *</Label>
                  <Input
                    id="gift-to-email"
                    type="email"
                    placeholder="email@example.com"
                    value={toEmail}
                    onChange={(e) => setToEmail(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="gift-to-name">Имя получателя</Label>
                  <Input
                    id="gift-to-name"
                    type="text"
                    placeholder="Как к нему обращаться"
                    value={toName}
                    onChange={(e) => setToName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="gift-from-name">От кого (ваше имя) *</Label>
                  <Input
                    id="gift-from-name"
                    type="text"
                    placeholder="Ваше имя"
                    value={fromName}
                    onChange={(e) => setFromName(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                <Button type="submit" className="w-full" disabled={sending}>
                  {sending ? 'Отправка...' : 'Отправить открытку'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
