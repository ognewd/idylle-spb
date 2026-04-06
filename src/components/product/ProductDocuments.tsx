'use client';

import { FileText } from 'lucide-react';

const TYPE_LABELS: Record<string, string> = {
  certificate: 'Сертификат гос. регистрации',
  declaration: 'Декларация соответствия',
  refusal: 'Отказное письмо',
  other: 'Документ',
};

interface Document {
  id: string;
  type: string;
  title: string;
  fileUrl: string;
}

export function ProductDocuments({ documents }: { documents: Document[] }) {
  if (!documents || documents.length === 0) return null;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-900">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
          <FileText className="h-4 w-4" aria-hidden />
        </span>
        Документы на товар
      </h3>
      <p className="mb-4 text-xs leading-relaxed text-neutral-600">
        Сертификаты, декларации и отказные письма для вашего спокойствия
      </p>
      <ul className="divide-y divide-neutral-100">
        {documents.map((doc) => (
          <li key={doc.id} className="py-3 first:pt-0 last:pb-0">
            <a
              href={doc.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-sm font-medium text-neutral-900 underline-offset-4 transition-colors hover:text-neutral-600 hover:underline"
            >
              <FileText className="h-4 w-4 shrink-0 text-neutral-400 transition-colors group-hover:text-neutral-600" />
              <span>
                {doc.title}
                {TYPE_LABELS[doc.type] && doc.type !== 'other' && (
                  <span className="text-muted-foreground ml-1">
                    ({TYPE_LABELS[doc.type]})
                  </span>
                )}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
