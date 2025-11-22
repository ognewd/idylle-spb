'use client';

import { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Copy, Check } from 'lucide-react';

interface ProductQRCodeProps {
  productSlug: string;
  productName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductQRCode({ productSlug, productName, isOpen, onClose }: ProductQRCodeProps) {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  // Генерируем URL для QR-кода
  const getProductUrl = () => {
    if (typeof window !== 'undefined') {
      const baseUrl = window.location.origin;
      return `${baseUrl}/catalog/${productSlug}`;
    }
    return `/catalog/${productSlug}`;
  };

  const productUrl = getProductUrl();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDownloadQR = () => {
    if (!qrRef.current) return;

    const canvas = qrRef.current.querySelector('canvas');
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `qr-${productSlug}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold">QR-код товара</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-6 pt-2">
          {/* Product Name */}
          <div className="text-center w-full">
            <h3 className="font-semibold text-lg leading-tight px-4 break-words">
              {productName}
            </h3>
            <p className="text-sm text-gray-500 mt-2">Отсканируйте QR-код для просмотра</p>
          </div>

          {/* QR Code */}
          <div ref={qrRef} className="p-4 bg-white rounded-lg border-2 border-gray-200 shadow-sm">
            <QRCodeCanvas
              value={productUrl}
              size={256}
              level="H"
              includeMargin={true}
            />
          </div>

          {/* Product URL */}
          <div className="w-full px-1">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Ссылка на товар:
            </label>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-700 flex-1 break-all font-mono">
                {productUrl}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyLink}
                className="shrink-0 h-8 w-8 p-0"
                title={copied ? "Скопировано" : "Копировать ссылку"}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 w-full pt-2 border-t">
            <Button
              onClick={handleDownloadQR}
              className="flex-1 h-10"
            >
              <Download className="h-4 w-4 mr-2" />
              Скачать PNG
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-10"
            >
              Закрыть
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

