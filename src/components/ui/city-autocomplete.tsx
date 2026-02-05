'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from './input';
import { Loader2 } from 'lucide-react';

export interface CitySuggestion {
  value: string; // "[190000], г, Санкт-Петербург"
  data: {
    code: number; // CDEK city code
    city: string;
    region: string;
    postal_code?: string;
    country_code: string;
    fias_city_guid?: string;
    kladr_code?: string;
  };
}

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (suggestion: CitySuggestion) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  country?: string; // По умолчанию 'RU'
}

export function CityAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = 'Начните вводить название города',
  className,
  id,
  country = 'RU',
}: CityAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const justSelectedValueRef = useRef<string | null>(null);

  // Обработка клика вне компонента
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Автокомплит с debounce
  useEffect(() => {
    const trimmedValue = value.trim();

    // Только что выбрали город из подсказки — не показывать подсказки снова и не искать
    if (justSelectedValueRef.current !== null && trimmedValue === justSelectedValueRef.current.trim()) {
      justSelectedValueRef.current = null;
      setSuggestions([]);
      setShowSuggestions(false);
      setError(null);
      return;
    }

    // Не ищем, если меньше 2 символов
    if (trimmedValue.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setError(null);
      return;
    }

    // Debounce 300ms
    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/cdek/cities?query=${encodeURIComponent(trimmedValue)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Ошибка запроса');
        }

        const data = await response.json();
        
        if (data.error) {
          setError(data.error);
          setSuggestions([]);
        } else {
          setSuggestions(data.cities || []);
          setShowSuggestions(data.cities && data.cities.length > 0);
        }
      } catch (err) {
        console.error('City autocomplete error:', err);
        setError('Не удалось загрузить города, попробуйте ещё раз');
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [value, country]);

  const handleSelect = (suggestion: CitySuggestion) => {
    justSelectedValueRef.current = suggestion.value;
    onChange(suggestion.value);
    if (onSelect) {
      onSelect(suggestion);
    }
    setShowSuggestions(false);
    setError(null);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          className={className}
          autoComplete="off"
        />
        
        {isLoading && value.trim().length >= 2 && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
      
      {error && (
        <div className="absolute z-50 w-full mt-1 p-2 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
          {error}
        </div>
      )}
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.data.code}-${index}`}
              type="button"
              onClick={() => handleSelect(suggestion)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors"
            >
              <div className="text-sm text-gray-900">{suggestion.value}</div>
              {suggestion.data.region && (
                <div className="text-xs text-gray-500 mt-0.5">
                  {suggestion.data.region}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
      
      {showSuggestions && suggestions.length === 0 && !isLoading && value.trim().length >= 2 && !error && (
        <div className="absolute z-50 w-full mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-500">
          Ничего не найдено
        </div>
      )}
    </div>
  );
}
