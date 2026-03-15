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
    <div className="rounded-lg border bg-muted/30 p-4">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <FileText className="h-4 w-4" />
        Документы на товар
      </h3>
      <p className="text-xs text-muted-foreground mb-3">
        Сертификаты, декларации и отказные письма для вашего спокойствия
      </p>
      <ul className="space-y-2">
        {documents.map((doc) => (
          <li key={doc.id}>
            <a
              href={doc.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <FileText className="h-4 w-4 shrink-0" />
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
