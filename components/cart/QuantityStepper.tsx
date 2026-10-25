'use client';

import React from 'react';
import { Minus, Plus } from 'lucide-react';

export interface QuantityStepperProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
  itemName?: string;
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  quantity,
  onIncrement,
  onDecrement,
  min = 1,
  max = 99,
  disabled = false,
  isLoading = false,
  className = '',
  itemName = 'item',
}) => {
  return (
    <div
      className={`inline-flex items-center border border-[var(--color-border)] rounded-[4px] bg-[var(--color-bg)] ${className}`}
    >
      <button
        type="button"
        onClick={onDecrement}
        disabled={disabled || isLoading || quantity <= min}
        aria-label={`Decrease quantity of ${itemName}`}
        className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-[var(--color-text)] hover:bg-[var(--color-surface)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-l-[3px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-focus)]"
      >
        <Minus className="w-4 h-4" />
      </button>

      <span
        aria-live="polite"
        className="px-2.5 text-xs font-semibold text-[var(--color-text)] min-w-[28px] text-center"
      >
        {quantity}
      </span>

      <button
        type="button"
        onClick={onIncrement}
        disabled={disabled || isLoading || quantity >= max}
        aria-label={`Increase quantity of ${itemName}`}
        className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-[var(--color-text)] hover:bg-[var(--color-surface)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-r-[3px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-focus)]"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};
