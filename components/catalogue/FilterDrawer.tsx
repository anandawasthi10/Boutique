'use client';

import React from 'react';
import { Drawer } from '../ui/Drawer';
import { FilterControls, FilterValues } from './FilterControls';
import { CategorySummary } from '@/lib/types';
import { Button } from '../ui/Button';

export interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategorySummary[];
  values: FilterValues;
  onChange: (newValues: FilterValues) => void;
  onReset: () => void;
  activeCount?: number;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  categories,
  values,
  onChange,
  onReset,
  activeCount = 0,
}) => {
  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Filters${activeCount > 0 ? ` (${activeCount})` : ''}`}
      side="right"
    >
      <div className="py-4 flex flex-col gap-6">
        <FilterControls
          categories={categories}
          values={values}
          onChange={onChange}
          onReset={onReset}
        />

        <div className="pt-4 border-t border-[var(--color-border)]">
          <Button variant="primary" onClick={onClose} className="w-full">
            View Results
          </Button>
        </div>
      </div>
    </Drawer>
  );
};
