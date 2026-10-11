'use client';

import React from 'react';
import { X } from 'lucide-react';

export interface FilterChipItem {
  id: string;
  label: string;
  onRemove: () => void;
}

export interface FilterChipsProps {
  chips: FilterChipItem[];
  onClearAll: () => void;
  className?: string;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  chips,
  onClearAll,
  className = '',
}) => {
  if (chips.length === 0) return null;

  return (
    <div
      aria-label="Active filters"
      className={`flex items-center flex-wrap gap-2 py-3 ${className}`.trim()}
    >
      <span className="text-body-small text-[var(--color-text-muted)] mr-1 font-medium">
        Filters:
      </span>
      {chips.map((chip) => (
        <span
          key={chip.id}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--color-surface)] border border-[var(--color-border)] text-body-small text-[var(--color-text)] rounded-full transition-colors"
        >
          <span>{chip.label}</span>
          <button
            type="button"
            onClick={chip.onRemove}
            aria-label={`Remove filter: ${chip.label}`}
            className="p-0.5 hover:text-[var(--color-error)] rounded-full transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="text-body-small text-[var(--color-text-muted)] hover:text-[var(--color-text)] underline-offset-4 hover:underline ml-2 transition-colors cursor-pointer"
      >
        Clear all
      </button>
    </div>
  );
};
