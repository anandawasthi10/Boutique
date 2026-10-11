'use client';

import React from 'react';
import { CategorySummary } from '@/lib/types';
import { Button } from '../ui/Button';

export interface FilterValues {
  category?: string;
  fabric?: string;
  priceRange?: string; // 'under-300' | '300-500' | 'above-500'
}

export interface FilterControlsProps {
  categories: CategorySummary[];
  values: FilterValues;
  onChange: (newValues: FilterValues) => void;
  onReset: () => void;
  className?: string;
}

export const FABRIC_OPTIONS = ['Floral', 'Corduroy', 'Check', 'Linen'];

export const PRICE_OPTIONS = [
  { id: 'under-300', label: 'Under ₹300', min: 0, max: 300 },
  { id: '300-500', label: '₹300 to ₹500', min: 300, max: 500 },
  { id: 'above-500', label: 'Above ₹500', min: 500, max: undefined },
];

export const FilterControls: React.FC<FilterControlsProps> = ({
  categories,
  values,
  onChange,
  onReset,
  className = '',
}) => {
  const handleCategoryClick = (catId?: string) => {
    onChange({
      ...values,
      category: values.category === catId ? undefined : catId,
    });
  };

  const handleFabricClick = (fabric: string) => {
    onChange({
      ...values,
      fabric: values.fabric === fabric ? undefined : fabric,
    });
  };

  const handlePriceClick = (priceId: string) => {
    onChange({
      ...values,
      priceRange: values.priceRange === priceId ? undefined : priceId,
    });
  };

  return (
    <div className={`flex flex-col gap-6 ${className}`.trim()}>
      {/* Category Filter */}
      {categories.length > 0 && (
        <fieldset className="flex flex-col gap-2.5">
          <legend className="text-label text-[var(--color-text)] font-semibold uppercase tracking-wider">
            Category
          </legend>
          <div className="flex flex-wrap gap-2 pt-1">
            {categories.map((cat) => {
              const selected = values.category?.toLowerCase() === cat.slug.toLowerCase() || values.category?.toLowerCase() === cat.id.toLowerCase();
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat.slug)}
                  aria-pressed={selected}
                  className={`px-3 py-1.5 text-body-small rounded-[4px] border transition-colors cursor-pointer select-none ${
                    selected
                      ? 'bg-[var(--color-primary)] text-[var(--color-primary-text)] border-[var(--color-primary)]'
                      : 'bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)] hover:bg-[var(--color-surface)]'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {/* Fabric Filter */}
      <fieldset className="flex flex-col gap-2.5">
        <legend className="text-label text-[var(--color-text)] font-semibold uppercase tracking-wider">
          Fabric
        </legend>
        <div className="flex flex-wrap gap-2 pt-1">
          {FABRIC_OPTIONS.map((fabric) => {
            const selected = values.fabric?.toLowerCase() === fabric.toLowerCase();
            return (
              <button
                key={fabric}
                type="button"
                onClick={() => handleFabricClick(fabric)}
                aria-pressed={selected}
                className={`px-3 py-1.5 text-body-small rounded-[4px] border transition-colors cursor-pointer select-none ${
                  selected
                    ? 'bg-[var(--color-primary)] text-[var(--color-primary-text)] border-[var(--color-primary)]'
                    : 'bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)] hover:bg-[var(--color-surface)]'
                }`}
              >
                {fabric}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Price Range Filter */}
      <fieldset className="flex flex-col gap-2.5">
        <legend className="text-label text-[var(--color-text)] font-semibold uppercase tracking-wider">
          Price Range
        </legend>
        <div className="flex flex-wrap gap-2 pt-1">
          {PRICE_OPTIONS.map((price) => {
            const selected = values.priceRange === price.id;
            return (
              <button
                key={price.id}
                type="button"
                onClick={() => handlePriceClick(price.id)}
                aria-pressed={selected}
                className={`px-3 py-1.5 text-body-small rounded-[4px] border transition-colors cursor-pointer select-none ${
                  selected
                    ? 'bg-[var(--color-primary)] text-[var(--color-primary-text)] border-[var(--color-primary)]'
                    : 'bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)] hover:bg-[var(--color-surface)]'
                }`}
              >
                {price.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Reset Action */}
      <div className="pt-2">
        <Button variant="secondary" onClick={onReset} className="w-full text-center">
          Reset all filters
        </Button>
      </div>
    </div>
  );
};
