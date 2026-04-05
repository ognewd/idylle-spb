/** Индекс кадра галереи по горизонтали курсора внутри прямоугольника (листинг карточек). */
export function galleryIndexFromClientX(
  clientX: number,
  rect: DOMRectReadOnly,
  imageCount: number
): number {
  if (imageCount <= 1 || rect.width <= 0) return 0;
  const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  return Math.min(imageCount - 1, Math.floor(ratio * imageCount));
}
