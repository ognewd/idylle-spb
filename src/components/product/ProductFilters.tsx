'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterOption {
  id: string;
  name: string;
  count?: number;
}

interface FilterGroup {
  id: string;
  name: string;
  type: 'checkbox' | 'range' | 'select';
  options?: FilterOption[];
  min?: number;
  max?: number;
  step?: number;
}

interface ProductFiltersProps {
  filters: FilterGroup[];
  className?: string;
  basePath?: string;
  /** Встроенный режим: без своей рамки, внутри общей границы каталога */
  embedded?: boolean;
}

export function ProductFilters({ filters, className, basePath = '/catalog', embedded }: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [isMounted, setIsMounted] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState<Record<string, boolean>>({});
  const [inStockOnly, setInStockOnly] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    const params: Record<string, any> = {};
    
    // Handle price range specially
    const priceMin = searchParams.get('filter_price_min');
    const priceMax = searchParams.get('filter_price_max');
    if (priceMin && priceMax) {
      params.price = [parseFloat(priceMin), parseFloat(priceMax)];
    }
    
    // Handle in stock filter
    const inStock = searchParams.get('filter_inStock');
    setInStockOnly(inStock === 'true');
    
    // Handle other filters
    searchParams.forEach((value, key) => {
      if (key.startsWith('filter_') && !key.includes('price_min') && !key.includes('price_max') && key !== 'filter_inStock') {
        const filterKey = key.replace('filter_', '');
        if (value.includes(',')) {
          params[filterKey] = value.split(',');
        } else {
          params[filterKey] = [value];
        }
      }
    });
    
    setActiveFilters(params);
  }, [searchParams, isMounted]);

  const updateFilter = (filterId: string, value: any, debounce = false) => {
    if (!isMounted) return;
    
    const newFilters = { ...activeFilters };
    
    if (value === null || value === undefined || (Array.isArray(value) && value.length === 0)) {
      delete newFilters[filterId];
    } else {
      newFilters[filterId] = value;
    }

    setActiveFilters(newFilters);
    
    if (debounce) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        updateURL(newFilters, inStockOnly);
      }, 300);
    } else {
      updateURL(newFilters, inStockOnly);
    }
  };

  const updateURL = (filters: Record<string, any>, stockFilter: boolean) => {
    if (!isMounted) return;
    
    const params = new URLSearchParams(searchParams);
    
    // Remove existing filter params
    Array.from(params.keys()).forEach(key => {
      if (key.startsWith('filter_')) {
        params.delete(key);
      }
    });

    // Add new filter params
    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'price' && Array.isArray(value)) {
        params.set('filter_price_min', value[0].toString());
        params.set('filter_price_max', value[1].toString());
      } else if (Array.isArray(value) && value.length > 0) {
        params.set(`filter_${key}`, value.join(','));
      } else if (!Array.isArray(value)) {
        params.set(`filter_${key}`, value);
      }
    });

    // Add in stock filter
    if (stockFilter) {
      params.set('filter_inStock', 'true');
    }

    router.push(`${basePath}?${params.toString()}`, { scroll: false });
  };

  const handleInStockChange = (checked: boolean) => {
    setInStockOnly(checked);
    updateURL(activeFilters, checked);
  };

  const clearAllFilters = () => {
    if (!isMounted) return;
    
    setActiveFilters({});
    setInStockOnly(false);
    const params = new URLSearchParams(searchParams);
    Array.from(params.keys()).forEach(key => {
      if (key.startsWith('filter_')) {
        params.delete(key);
      }
    });
    router.push(`${basePath}?${params.toString()}`, { scroll: false });
  };

  const getActiveFilterCount = () => {
    let count = Object.keys(activeFilters).length;
    if (inStockOnly) count++;
    return count;
  };

  const renderCheckboxFilter = (filter: FilterGroup) => {
    const validOptions = (filter.options || [])
      .filter(opt => (opt.count ?? 0) > 0)
      .sort((a, b) => (b.count ?? 0) - (a.count ?? 0));
    
    const isExpanded = expandedFilters[filter.id] || false;
    const hasMoreThan5 = validOptions.length > 5;
    const displayedOptions = hasMoreThan5 && !isExpanded 
      ? validOptions.slice(0, 5) 
      : validOptions;

    return (
      <div className="space-y-3">
        {displayedOptions.map((option) => {
          const isChecked = Array.isArray(activeFilters[filter.id])
            ? activeFilters[filter.id].includes(option.id)
            : activeFilters[filter.id] === option.id;

          return (
            <div key={option.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`${filter.id}-${option.id}`}
                  checked={isChecked}
                  onCheckedChange={(checked) => {
                    const current = activeFilters[filter.id] || [];
                    const currentArray = Array.isArray(current) ? current : [];
                    
                    if (checked) {
                      if (!currentArray.includes(option.id)) {
                        const newValue = [...currentArray, option.id];
                        updateFilter(filter.id, newValue);
                      }
                    } else {
                      const newValue = currentArray.filter((v: string) => v !== option.id);
                      updateFilter(filter.id, newValue.length > 0 ? newValue : null);
                    }
                  }}
                />
                <Label
                  htmlFor={`${filter.id}-${option.id}`}
                  className="text-sm cursor-pointer hover:text-neutral-900"
                >
                  {option.name}
                </Label>
              </div>
              <span className="text-xs text-neutral-400">({option.count})</span>
            </div>
          );
        })}
        {hasMoreThan5 && (
          <button
            onClick={() => setExpandedFilters(prev => ({ ...prev, [filter.id]: !isExpanded }))}
            className="text-xs text-neutral-500 hover:text-neutral-900 flex items-center gap-1"
          >
            {isExpanded ? (
              <>Свернуть <ChevronUp className="h-3 w-3" /></>
            ) : (
              <>Показать все ({validOptions.length}) <ChevronDown className="h-3 w-3" /></>
            )}
          </button>
        )}
      </div>
    );
  };

  const renderPriceFilter = (filter: FilterGroup) => {
    const rangeValue = activeFilters[filter.id] || [filter.min || 0, filter.max || 100000];
    const [localRange, setLocalRange] = useState(rangeValue);
    
    useEffect(() => {
      setLocalRange(rangeValue);
    }, [rangeValue[0], rangeValue[1]]);

    return (
      <div className="space-y-4">
        <Label className="text-sm font-medium block">
          {localRange[0].toLocaleString('ru-RU')} ₽ — {localRange[1].toLocaleString('ru-RU')} ₽
        </Label>
        <Slider
          min={filter.min || 0}
          max={filter.max || 100000}
          step={filter.step || 100}
          value={localRange}
          onValueChange={(value) => setLocalRange(value)}
          onValueCommit={(value) => updateFilter(filter.id, value)}
          className="mb-2"
        />
        <div className="flex justify-between text-xs text-neutral-500">
          <span>{(filter.min || 0).toLocaleString('ru-RU')} ₽</span>
          <span>{(filter.max || 100000).toLocaleString('ru-RU')} ₽</span>
        </div>
      </div>
    );
  };

  const renderFilter = (filter: FilterGroup) => {
    if (!isMounted) return null;
    
    switch (filter.type) {
      case 'checkbox':
        return renderCheckboxFilter(filter);
      case 'range':
        return renderPriceFilter(filter);
      default:
        return null;
    }
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Header with clear "Фильтры" title */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
        <h2 className="font-bold text-xl">Фильтры</h2>
        {getActiveFilterCount() > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs text-neutral-600 hover:text-neutral-900 h-auto p-1"
          >
            Сбросить
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* In Stock Toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="in-stock" className="text-sm font-medium cursor-pointer">
            Только в наличии
          </Label>
          <Switch
            id="in-stock"
            checked={inStockOnly}
            onCheckedChange={handleInStockChange}
          />
        </div>

        {filters.map((filter, index) => {
          // Check if filter has any options with count > 0
          const hasResults = filter.options 
            ? filter.options.some(option => (option.count ?? 0) > 0)
            : true;
          
          if (!hasResults) return null;

          return (
            <div key={filter.id}>
              {index > 0 && <Separator className="mb-6" />}
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-semibold">{filter.name}</Label>
                {activeFilters[filter.id] && (
                  <button
                    onClick={() => updateFilter(filter.id, null)}
                    className="text-xs text-neutral-500 hover:text-neutral-900"
                  >
                    Очистить
                  </button>
                )}
              </div>
              {renderFilter(filter)}
            </div>
          );
        })}
      </div>
    </div>
  );

  if (!isMounted) {
    return (
      <div className={cn("hidden lg:block", className)}>
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-neutral-200 rounded w-24"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-neutral-200 rounded"></div>
                  <div className="h-4 bg-neutral-200 rounded flex-1"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-between"
        >
          <span className="flex items-center">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Фильтры
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="ml-2 rounded-full">
                {getActiveFilterCount()}
              </Badge>
            )}
          </span>
        </Button>
      </div>

      {/* Mobile Filter Panel */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 flex-shrink-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">Фильтры</h2>
                {getActiveFilterCount() > 0 && (
                  <Badge variant="secondary" className="rounded-full">
                    {getActiveFilterCount()}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {getActiveFilterCount() > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-neutral-600"
                  >
                    Сбросить всё
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-6">
                {/* In Stock Toggle */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="mobile-in-stock" className="text-sm font-medium">
                    Только в наличии
                  </Label>
                  <Switch
                    id="mobile-in-stock"
                    checked={inStockOnly}
                    onCheckedChange={handleInStockChange}
                  />
                </div>

                <Separator />

                {filters.map((filter, index) => {
                  const hasResults = filter.options 
                    ? filter.options.some(option => (option.count ?? 0) > 0)
                    : true;
                  
                  if (!hasResults) return null;

                  return (
                    <div key={filter.id}>
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-sm font-medium">{filter.name}</Label>
                        {activeFilters[filter.id] && (
                          <button
                            onClick={() => updateFilter(filter.id, null)}
                            className="text-xs text-neutral-500 hover:text-neutral-900"
                          >
                            Очистить
                          </button>
                        )}
                      </div>
                      {renderFilter(filter)}
                      {index < filters.length - 1 && <Separator className="mt-6" />}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="p-4 border-t border-neutral-200 flex-shrink-0">
              <Button
                className="w-full"
                onClick={() => setIsOpen(false)}
              >
                Применить фильтры
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Filter Sidebar */}
      <div className={cn("hidden lg:block", className)}>
        <div className={cn("p-6", !embedded && "bg-white rounded-lg border border-neutral-200")}>
          <FilterContent />
        </div>
      </div>
    </>
  );
}
