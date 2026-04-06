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
            'inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-orange-300 bg-orange-50/50 text-sm font-medium text-neutral-900 shadow-none hover:bg-orange-50/80',
            className
          )}
        >
          <Gift className="h-4 w-4 shrink-0 text-orange-600" />
          Хочу это в подарок
        </Button>
      </DialogTrigger>
      <DialogContent
        overlayClassName="bg-[radial-gradient(1200px_500px_at_20%_15%,rgba(244,114,182,0.2),transparent_62%),radial-gradient(900px_460px_at_80%_20%,rgba(251,146,60,0.17),transparent_58%),linear-gradient(160deg,rgba(15,23,42,0.44),rgba(76,29,149,0.34))] backdrop-blur-[3px]"
        className="overflow-hidden border-pink-100 p-0 shadow-2xl sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="sr-only">Намекнуть о подарке</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 bg-gradient-to-b from-rose-50/70 via-white to-white p-4 sm:p-5">
          {/* Header */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-fuchsia-500 via-pink-500 to-orange-500 p-4 text-white shadow-lg">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-lg bg-white/20 p-2">
                <Gift className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-2xl font-semibold leading-none">Хочу подарок</p>
                <p className="mt-1 truncate text-xs text-white/90" title={productName}>
                  {productName}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-center gap-1 rounded-lg border border-neutral-200 bg-white px-2 py-2 text-xs font-medium text-neutral-700">
              <Mail className="h-3.5 w-3.5" />
              Отправить на почту
            </div>
            <button
              type="button"
              onClick={copyLink}
              className="flex items-center justify-center gap-1 rounded-lg border border-neutral-200 bg-white px-2 py-2 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Скопировано' : 'Скопировать ссылку'}
            </button>
          </div>

          {/* Отправить на почту */}
          <div className="rounded-xl border border-neutral-200 bg-white p-3.5 shadow-sm">
            <p className="mb-3 flex items-center gap-2 text-sm font-medium text-neutral-800">
              <Mail className="h-4 w-4" />
              Отправить на почту
            </p>
            {sent ? (
              <p className="rounded-md bg-green-50 p-2 text-sm text-green-700">Письмо отправлено.</p>
            ) : (
              <form onSubmit={sendByEmail} className="space-y-3">
                <div>
                  <Label htmlFor="gift-to-email" className="text-xs text-neutral-600">Кому (email) *</Label>
                  <Input
                    id="gift-to-email"
                    type="email"
                    placeholder="email@example.com"
                    value={toEmail}
                    onChange={(e) => setToEmail(e.target.value)}
                    className="mt-1 h-10 border-neutral-200 focus-visible:ring-pink-300"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="gift-to-name" className="text-xs text-neutral-600">Имя получателя</Label>
                  <Input
                    id="gift-to-name"
                    type="text"
                    placeholder="Как к нему обращаться"
                    value={toName}
                    onChange={(e) => setToName(e.target.value)}
                    className="mt-1 h-10 border-neutral-200 focus-visible:ring-pink-300"
                  />
                </div>
                <div>
                  <Label htmlFor="gift-from-name" className="text-xs text-neutral-600">От кого (ваше имя) *</Label>
                  <Input
                    id="gift-from-name"
                    type="text"
                    placeholder="Ваше имя"
                    value={fromName}
                    onChange={(e) => setFromName(e.target.value)}
                    className="mt-1 h-10 border-neutral-200 focus-visible:ring-pink-300"
                    required
                  />
                </div>
                {error && (
                  <p className="rounded-md bg-red-50 p-2 text-sm text-red-600">{error}</p>
                )}
                <Button
                  type="submit"
                  className="h-10 w-full bg-gradient-to-r from-fuchsia-500 via-pink-500 to-orange-500 font-medium text-white shadow-md hover:from-fuchsia-600 hover:via-pink-600 hover:to-orange-600"
                  disabled={sending}
                >
                  <Link2 className="mr-2 h-4 w-4" />
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
