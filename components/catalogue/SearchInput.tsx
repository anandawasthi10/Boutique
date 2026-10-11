'use client';

import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search by name or description...',
  debounceMs = 300,
  className = '',
}) => {
  const [prevValue, setPrevValue] = useState(value);
  const [localValue, setLocalValue] = useState(value);

  // Sync if external value changes (e.g. clear filters or browser navigation)
  if (prevValue !== value) {
    setPrevValue(value);
    setLocalValue(value);
  }

  useEffect(() => {
    if (localValue === value) return;

    const timer = setTimeout(() => {
      onChange(localValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, value, onChange, debounceMs]);

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div role="search" className={`relative flex items-center w-full ${className}`.trim()}>
      <Search
        className="absolute left-3.5 w-4 h-4 text-[var(--color-text-muted)] pointer-events-none"
        aria-hidden="true"
      />
      <input
        type="search"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Search accessories collection"
        className="w-full h-12 pl-10 pr-10 text-[16px] bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[4px] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] transition-colors"
      />
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search input"
          className="absolute right-3 p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-[4px] cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
