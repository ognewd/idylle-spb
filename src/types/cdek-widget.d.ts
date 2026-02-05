/**
 * Типы для виджета СДЭК 3.0 (подключается с cdn.jsdelivr.net/npm/@cdek-it/widget@3).
 * @see https://github.com/cdek-it/widget/wiki/Установка-3.0
 */

declare global {
  interface Window {
    CDEKWidget?: new (options: Record<string, unknown>) => {
      addParcel?: (parcel: unknown | unknown[]) => void;
      getParcels?: () => unknown[];
      resetParcels?: () => void;
      open?: () => void;
      close?: () => void;
      updateLocation?: (location: string | [number, number]) => void;
    };
  }
}

export {};
