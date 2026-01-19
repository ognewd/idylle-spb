import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Функция для склонения слова "отзыв" в зависимости от числа
 * @param count - количество отзывов
 * @returns склоненное слово "отзыв"
 * 
 * Примеры:
 * 1 отзыв
 * 2, 3, 4 отзыва
 * 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20 отзывов
 * 21 отзыв
 * 22, 23, 24 отзыва
 * 25, 26, 27, 28, 29, 30 отзывов
 */
export function getReviewWord(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;

  // Исключения для 11-14
  if (mod100 >= 11 && mod100 <= 14) {
    return 'отзывов';
  }

  // Для чисел, оканчивающихся на 1
  if (mod10 === 1) {
    return 'отзыв';
  }

  // Для чисел, оканчивающихся на 2, 3, 4
  if (mod10 >= 2 && mod10 <= 4) {
    return 'отзыва';
  }

  // Для всех остальных (0, 5, 6, 7, 8, 9)
  return 'отзывов';
}
