'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { LayoutGrid, LayoutList, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ViewMode } from './ProductGrid';

const sortOptions = [
  { value: 'popular', label: 'По популярности' },
  { value: 'price_asc', label: 'Цена: по возрастанию' },
  { value: 'price_desc', label: 'Цена: по убыванию' },
  { value: 'newest', label: 'Новинки' },
  { value: 'name_asc', label: 'Название: А-Я' },
  { value: 'name_desc', label: 'Название: Я-А' },
];

interface SortSelectorProps {
  currentSort?: string;
  totalProducts?: number;
  activeFiltersCount?: number;
  onOpenMobileFilters?: () => void;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  basePath?: string;
}

export function SortSelector({ 
  currentSort = 'newest',
  totalProducts = 0,
  activeFiltersCount = 0,
  onOpenMobileFilters,
  viewMode = 'grid',
  onViewModeChange,
  basePath = '/catalog',
}: SortSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === 'newest') {
      params.delete('sort');
    } else {
      params.set('sort', value);
    }
    router.push(`${basePath}?${params.toString()}`, { scroll: false });
  };

  const handleViewModeChange = (mode: ViewMode) => {
    if (onViewModeChange) {
      onViewModeChange(mode);
    } else {
      // Fallback: store in URL
      const params = new URLSearchParams(searchParams);
      if (mode === 'grid') {
        params.delete('view');
      } else {
        params.set('view', mode);
      }
      router.push(`${basePath}?${params.toString()}`, { scroll: false });
    }
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Product Count & Mobile Filter Button */}
        <div className="flex items-center gap-3">
          {onOpenMobileFilters && (
            <Button
              variant="outline"
              className="lg:hidden relative"
              onClick={onOpenMobileFilters}
            >
              <SlidersHorizontal className="size-4 mr-2" />
              Фильтры
              {activeFiltersCount > 0 && (
                <Badge 
                  variant="secondary" 
                  className="ml-2 rounded-full size-5 p-0 flex items-center justify-center"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          )}
          <p className="text-sm text-neutral-600">
            Найдено <span className="font-medium text-neutral-900">{totalProducts}</span> товаров
          </p>
        </div>

        {/* Right: Sort & View Mode */}
        <div className="flex items-center gap-3">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-600 hidden sm:inline">
              Сортировка:
            </span>
            <Select value={currentSort} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center gap-1 border border-neutral-200 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              className="size-8 p-0"
              onClick={() => handleViewModeChange('grid')}
            >
              <LayoutGrid className="size-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              className="size-8 p-0"
              onClick={() => handleViewModeChange('list')}
            >
              <LayoutList className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
