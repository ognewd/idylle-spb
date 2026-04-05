'use client';

export const dynamic = 'force-dynamic';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Award,
  Loader2,
  Trash2,
  ExternalLink,
  Save,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

type CertificateRow = {
  id: string;
  title: string;
  fileUrl: string;
  fileName: string;
  mimeType: string | null;
  fileSize: number | null;
  watermarked: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
};

export default function AdminCertificatesPage() {
  const router = useRouter();
  const [list, setList] = useState<CertificateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [watermark, setWatermark] = useState(true);
  const [edits, setEdits] = useState<Record<string, { title: string; sortOrder: string }>>({});

  const load = useCallback(async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/certificates', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.certificates) {
        setList(data.certificates);
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const next: Record<string, { title: string; sortOrder: string }> = {};
    for (const c of list) {
      next[c.id] = { title: c.title, sortOrder: String(c.sortOrder) };
    }
    setEdits(next);
  }, [list]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    if (!token || !title.trim() || !file) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.set('title', title.trim());
      fd.set('file', file);
      fd.set('watermark', watermark ? 'true' : 'false');

      const res = await fetch('/api/admin/certificates', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || 'Ошибка загрузки');
        return;
      }
      setTitle('');
      setFile(null);
      setWatermark(true);
      await load();
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить этот документ с сайта и с диска?')) return;
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    const res = await fetch(`/api/admin/certificates/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) await load();
    else alert('Не удалось удалить');
  };

  const handleSaveRow = async (c: CertificateRow) => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    const e = edits[c.id];
    if (!e) return;
    const sort = parseInt(e.sortOrder, 10);
    const res = await fetch(`/api/admin/certificates/${c.id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: e.title.trim(),
        sortOrder: Number.isFinite(sort) ? sort : c.sortOrder,
      }),
    });
    if (res.ok) await load();
    else alert('Не удалось сохранить');
  };

  const toggleActive = async (c: CertificateRow) => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    const res = await fetch(`/api/admin/certificates/${c.id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isActive: !c.isActive }),
    });
    if (res.ok) await load();
  };

  return (
    <div className="min-h-screen bg-muted/30 p-4 sm:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
              <Link href="/admin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Админка
              </Link>
            </Button>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Award className="h-7 w-7" />
              Сертификаты
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Файлы публикуются на{' '}
              <Link href="/certificates" className="underline inline-flex items-center gap-1" target="_blank">
                /certificates
                <ExternalLink className="h-3 w-3" />
              </Link>
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Загрузить документ</CardTitle>
            <CardDescription>
              PDF, изображения (JPG, PNG, WebP, GIF), Excel (.xlsx, .xls), Word (.doc, .docx). До 25 МБ.
              Для JPG, PNG, WebP и PDF при включённой галочке накладывается полупрозрачный логотип по центру
              (Excel/Word/GIF сохраняются без изменений).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4 max-w-lg">
              <div className="space-y-2">
                <Label htmlFor="cert-title">Название на сайте</Label>
                <Input
                  id="cert-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Например: 01.02.26 Wella · шампунь Fusion…"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cert-file">Файл</Label>
                <Input
                  id="cert-file"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.xlsx,.xls,.doc,.docx"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cert-wm"
                  checked={watermark}
                  onCheckedChange={(v) => setWatermark(v === true)}
                />
                <Label htmlFor="cert-wm" className="text-sm font-normal cursor-pointer">
                  Наложить водяной знак (логотип) для PDF и изображений
                </Label>
              </div>
              <Button type="submit" disabled={uploading || !title.trim() || !file}>
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Загрузка…
                  </>
                ) : (
                  'Добавить'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Опубликованные</CardTitle>
            <CardDescription>Порядок: по полю «Порядок» (меньше — выше на странице).</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground py-8">
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                Загрузка…
              </div>
            ) : list.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">Пока нет файлов.</p>
            ) : (
              <ul className="space-y-4">
                {list.map((c) => (
                  <li
                    key={c.id}
                    className={`rounded-lg border p-4 space-y-3 ${c.isActive ? '' : 'opacity-60 bg-muted/40'}`}
                  >
                    <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                      <div className="space-y-2">
                        <Label className="text-xs">Название</Label>
                        <Input
                          value={edits[c.id]?.title ?? c.title}
                          onChange={(e) =>
                            setEdits((prev) => ({
                              ...prev,
                              [c.id]: {
                                title: e.target.value,
                                sortOrder: prev[c.id]?.sortOrder ?? String(c.sortOrder),
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2 w-full sm:w-28">
                        <Label className="text-xs">Порядок</Label>
                        <Input
                          type="number"
                          value={edits[c.id]?.sortOrder ?? String(c.sortOrder)}
                          onChange={(e) =>
                            setEdits((prev) => ({
                              ...prev,
                              [c.id]: { title: prev[c.id]?.title ?? c.title, sortOrder: e.target.value },
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
                      <span>{c.fileName}</span>
                      {c.fileSize != null && <span>{(c.fileSize / 1024).toFixed(1)} КБ</span>}
                      {c.watermarked && <span className="text-emerald-700">С водяным знаком</span>}
                      {!c.isActive && <span className="text-amber-700">Скрыто</span>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" size="sm" variant="secondary" onClick={() => handleSaveRow(c)}>
                        <Save className="h-4 w-4 mr-1" />
                        Сохранить
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => toggleActive(c)}>
                        {c.isActive ? 'Скрыть' : 'Показать'}
                      </Button>
                      <Button type="button" size="sm" variant="destructive" onClick={() => handleDelete(c.id)}>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Удалить
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
