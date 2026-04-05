'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getImageUrl } from '@/lib/image-url';
import { FileText, Award, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type CertificateItem = {
  id: string;
  title: string;
  fileUrl: string;
  fileName: string;
  mimeType: string | null;
};

function previewKind(mime: string | null, fileName: string): 'image' | 'pdf' | 'download' {
  const m = mime || '';
  if (m.startsWith('image/')) return 'image';
  if (m === 'application/pdf') return 'pdf';
  return 'download';
}

export function CertificatesList({ items }: { items: CertificateItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const active = useMemo(
    () => items.find((i) => i.id === openId) || null,
    [items, openId]
  );
  const fullUrl = active ? getImageUrl(active.fileUrl) : '';

  if (items.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-16">
        Сертификаты скоро появятся.
      </p>
    );
  }

  return (
    <>
      <ul className="mx-auto max-w-3xl space-y-1 py-4">
        {items.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => setOpenId(c.id)}
              className="flex w-full items-start gap-3 rounded-md px-2 py-3 text-left text-sm transition-colors hover:bg-muted/60 sm:py-2.5"
            >
              <Award className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
              <span className="border-b border-dotted border-muted-foreground/80 pb-px leading-snug text-foreground">
                {c.title}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <Dialog open={openId != null} onOpenChange={(o) => !o && setOpenId(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
          {active && (
            <>
              <DialogHeader className="p-4 sm:p-6 pb-2 shrink-0 border-b space-y-1 text-left">
                <DialogTitle className="text-base sm:text-lg leading-snug pr-8">
                  {active.title}
                </DialogTitle>
                <p className="text-xs text-muted-foreground truncate">{active.fileName}</p>
              </DialogHeader>
              <div className="min-h-0 flex-1 overflow-auto p-4 sm:p-6 pt-4">
                {previewKind(active.mimeType, active.fileName) === 'image' && (
                  <div className="flex justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={fullUrl}
                      alt=""
                      className="max-h-[min(75vh,720px)] w-auto max-w-full object-contain rounded-md border"
                    />
                  </div>
                )}
                {previewKind(active.mimeType, active.fileName) === 'pdf' && (
                  <iframe
                    title={active.title}
                    src={fullUrl}
                    className="h-[min(75vh,780px)] w-full rounded-md border bg-muted/30"
                  />
                )}
                {previewKind(active.mimeType, active.fileName) === 'download' && (
                  <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                    <FileText className="h-14 w-14 text-muted-foreground" aria-hidden />
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Для этого типа файла предпросмотр в браузере недоступен. Скачайте документ.
                    </p>
                    <Button asChild variant="default">
                      <a href={fullUrl} download={active.fileName} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-2" />
                        Скачать
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
