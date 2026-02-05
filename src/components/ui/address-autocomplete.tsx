'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from './input';

/** Ответ бэкенда: DaData возвращает нормализованные объекты, fallback СДЭК — value + data */
type ApiSuggestion =
  | {
      display: string;
      full?: string;
      postalCode?: string | null;
      city?: string | null;
      street?: string | null;
      house?: string | null;
      flat?: string | null;
      geo?: { lat: string | null; lon: string | null };
    }
  | {
      value: string;
      data: {
        type?: 'pvz' | 'city';
        code?: string | number;
        name?: string;
        address?: string;
        city?: string;
        region?: string;
      };
    };

/** Нормализованный адрес для onSelect (улица, дом, квартира, гео) */
export interface NormalizedAddress {
  display: string;
  full?: string;
  postalCode?: string | null;
  city?: string | null;
  street?: string | null;
  house?: string | null;
  flat?: string | null;
  geo?: { lat: string | null; lon: string | null };
}

function isNormalized(s: ApiSuggestion): s is ApiSuggestion & { display: string } {
  return 'display' in s && typeof (s as { display?: string }).display === 'string';
}

function toDisplay(s: ApiSuggestion): string {
  return isNormalized(s) ? s.display : s.value;
}

function toNormalized(s: ApiSuggestion): NormalizedAddress {
  if (isNormalized(s)) {
    return {
      display: s.display,
      full: s.full,
      postalCode: s.postalCode ?? undefined,
      city: s.city ?? undefined,
      street: s.street ?? undefined,
      house: s.house ?? undefined,
      flat: s.flat ?? undefined,
      geo: s.geo,
    };
  }
  const d = s.data;
  const display = s.value;
  return {
    display,
    full: display,
    city: d?.city ?? undefined,
    street: d?.address ?? undefined,
    house: undefined,
    flat: undefined,
  };
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (address: NormalizedAddress) => void;
  city?: string;
  placeholder?: string;
  className?: string;
  id?: string;
}

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 3;
const SUGGEST_COUNT = 10;

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  city,
  placeholder = 'Улица, дом, квартира',
  className,
  id,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<ApiSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const prevCityRef = useRef<string | undefined>(undefined);
  /** Значение, только что установленное выбором из списка — не показывать список снова */
  const lastSelectedValueRef = useRef<string | null>(null);

  // При смене города — очистить подсказки и поле (родитель обычно сбрасывает value)
  useEffect(() => {
    if (prevCityRef.current !== undefined && prevCityRef.current !== (city ?? undefined)) {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    prevCityRef.current = city ?? undefined;
  }, [city]);

  useEffect(() => {
    const trimmedValue = value.trim();

    if (trimmedValue.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/address/suggest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: trimmedValue,
            city: city?.trim() || undefined,
            count: SUGGEST_COUNT,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const list = data.suggestions ?? [];
          setSuggestions(Array.isArray(list) ? list : []);
          const shouldShow =
            Array.isArray(list) &&
            list.length > 0 &&
            trimmedValue !== lastSelectedValueRef.current;
          if (trimmedValue === lastSelectedValueRef.current) {
            lastSelectedValueRef.current = null;
          }
          setShowSuggestions(shouldShow);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error('Address autocomplete error:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [value, city]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (suggestion: ApiSuggestion) => {
    const display = toDisplay(suggestion);
    lastSelectedValueRef.current = display;
    onChange(display);
    onSelect?.(toNormalized(suggestion));
    setShowSuggestions(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          if (suggestions.length > 0) setShowSuggestions(true);
        }}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(suggestion)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors"
            >
              <div className="text-sm text-gray-900">{toDisplay(suggestion)}</div>
              {!isNormalized(suggestion) && suggestion.data?.type && (
                <div className="text-xs text-gray-500 mt-1">
                  {suggestion.data.type === 'pvz' ? 'ПВЗ' : 'Город'}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
      {isLoading && value.trim().length >= MIN_QUERY_LENGTH && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
        </div>
      )}
    </div>
  );
}
