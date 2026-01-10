'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
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
}

export function ProductFilters({ filters, className, basePath = '/catalog' }: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [isMounted, setIsMounted] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState<Record<string, boolean>>({});
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);
    
    // Cleanup debounce timer on unmount
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
    
    // Handle other filters
    searchParams.forEach((value, key) => {
      if (key.startsWith('filter_') && !key.includes('price_min') && !key.includes('price_max')) {
        const filterKey = key.replace('filter_', '');
        // Always treat filter values as arrays for multi-select support
        if (value.includes(',')) {
          params[filterKey] = value.split(',');
        } else {
          params[filterKey] = [value]; // Wrap single values in array
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
    
    // If debounce is true, wait before updating URL
    if (debounce) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        updateURL(newFilters);
      }, 300); // 300ms delay
    } else {
      updateURL(newFilters);
    }
  };

  const updateURL = (filters: Record<string, any>) => {
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
        // Special handling for price range
        params.set('filter_price_min', value[0].toString());
        params.set('filter_price_max', value[1].toString());
      } else if (Array.isArray(value) && value.length > 0) {
        // For multi-select filters (like brands)
        params.set(`filter_${key}`, value.join(','));
      } else if (!Array.isArray(value)) {
        params.set(`filter_${key}`, value);
      }
    });

    router.push(`${basePath}?${params.toString()}`, { scroll: false });
  };

  const clearAllFilters = () => {
    if (!isMounted) return;
    
    setActiveFilters({});
    const params = new URLSearchParams(searchParams);
    Array.from(params.keys()).forEach(key => {
      if (key.startsWith('filter_')) {
        params.delete(key);
      }
    });
    router.push(`${basePath}?${params.toString()}`, { scroll: false });
  };

  const getActiveFilterCount = () => {
    return Object.keys(activeFilters).length;
  };

  const renderFilter = (filter: FilterGroup) => {
    if (!isMounted) return null;
    
    switch (filter.type) {
      case 'checkbox':
        // Сортируем опции по количеству (по убыванию) и фильтруем нулевые
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
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${filter.id}-${option.id}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      const current = activeFilters[filter.id] || [];
                      const currentArray = Array.isArray(current) ? current : [];
                      
                      if (checked) {
                        // Добавляем элемент, если его еще нет
                        if (!currentArray.includes(option.id)) {
                          const newValue = [...currentArray, option.id];
                          updateFilter(filter.id, newValue);
                        }
                      } else {
                        // Удаляем элемент
                        const newValue = currentArray.filter((v: string) => v !== option.id);
                        updateFilter(filter.id, newValue.length > 0 ? newValue : null);
                      }
                    }}
                  />
                  <Label htmlFor={`${filter.id}-${option.id}`} className="text-sm font-normal cursor-pointer flex-1 flex items-center justify-between">
                    <span>{option.name}</span>
                    {option.count !== undefined && (
                      <Badge variant="secondary" className="text-xs">
                        {option.count}
                      </Badge>
                    )}
                  </Label>
                </div>
              );
            })}
            {hasMoreThan5 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setExpandedFilters(prev => ({ ...prev, [filter.id]: !isExpanded }))}
              >
                {isExpanded ? (
                  <>
                    Свернуть <ChevronUp className="h-3 w-3 ml-1" />
                  </>
                ) : (
                  <>
                    Показать все ({validOptions.length}) <ChevronDown className="h-3 w-3 ml-1" />
                  </>
                )}
              </Button>
            )}
          </div>
        );

      case 'range':
        const rangeValue = activeFilters[filter.id] || [filter.min || 0, filter.max || 1000];
        const [localMin, setLocalMin] = useState(rangeValue[0]);
        const [localMax, setLocalMax] = useState(rangeValue[1]);
        
        useEffect(() => {
          setLocalMin(rangeValue[0]);
          setLocalMax(rangeValue[1]);
        }, [rangeValue[0], rangeValue[1]]);
        
        const applyPriceFilter = () => {
          const min = parseInt(localMin.toString()) || filter.min || 0;
          const max = parseInt(localMax.toString()) || filter.max || 1000;
          if (min >= (filter.min || 0) && max <= (filter.max || 1000) && min <= max) {
            updateFilter(filter.id, [min, max]);
          }
        };
        
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor={`${filter.id}-min`} className="text-xs text-muted-foreground">
                  От
                </Label>
                <Input
                  id={`${filter.id}-min`}
                  type="number"
                  value={localMin}
                  onChange={(e) => setLocalMin(e.target.value)}
                  min={filter.min || 0}
                  max={filter.max || 1000}
                  className="h-9"
                  placeholder={`${filter.min || 0} ₽`}
                />
              </div>
              <div>
                <Label htmlFor={`${filter.id}-max`} className="text-xs text-muted-foreground">
                  До
                </Label>
                <Input
                  id={`${filter.id}-max`}
                  type="number"
                  value={localMax}
                  onChange={(e) => setLocalMax(e.target.value)}
                  min={filter.min || 0}
                  max={filter.max || 1000}
                  className="h-9"
                  placeholder={`${filter.max || 1000} ₽`}
                />
              </div>
            </div>
            <Button 
              onClick={applyPriceFilter} 
              size="sm" 
              className="w-full"
              variant="secondary"
            >
              Применить
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {getActiveFilterCount() > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Активных фильтров: {getActiveFilterCount()}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Очистить все
          </Button>
        </div>
      )}

      {filters.map((filter, index) => {
        // Check if filter has any options with count > 0
        const hasResults = filter.options 
          ? filter.options.some(option => (option.count ?? 0) > 0)
          : true; // Show filters without options (like price range)
        
        // Don't render filter if it has no results
        if (!hasResults) return null;

        // Make the first filter (Category) sticky
        const isSticky = index === 0 && filter.id === 'category';

        return (
          <div 
            key={filter.id} 
            className={cn(
              isSticky && "lg:sticky lg:top-0 lg:z-10 lg:bg-white lg:shadow-md lg:rounded-lg lg:p-2 lg:-m-2"
            )}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">{filter.name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {renderFilter(filter)}
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );

  if (!isMounted) {
    return (
      <div className={cn("hidden lg:block", className)}>
        <div className="space-y-6">
          {filters.map((filter) => (
            <Card key={filter.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">{filter.name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {filter.options?.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <div className="h-4 w-4 border rounded animate-pulse bg-muted" />
                      <div className="flex-1 flex items-center justify-between">
                        <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                        <div className="h-4 w-8 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
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
            <Filter className="h-4 w-4 mr-2" />
            Фильтры
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFilterCount()}
              </Badge>
            )}
          </span>
        </Button>
      </div>

      {/* Mobile Filter Panel */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-50 bg-background"
          onClick={(e) => {
            // Prevent closing when clicking inside the panel
            if (e.target === e.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
              <h2 className="text-lg font-semibold">Фильтры</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div 
              className="flex-1 overflow-y-auto p-4"
              onWheel={(e) => {
                // Prevent page scroll when scrolling filters on mobile
                e.stopPropagation();
              }}
              onTouchMove={(e) => {
                // Prevent page scroll on touch devices
                e.stopPropagation();
              }}
            >
              <FilterContent />
            </div>
            <div className="p-4 border-t flex-shrink-0">
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
        <FilterContent />
      </div>
    </>
  );
}
