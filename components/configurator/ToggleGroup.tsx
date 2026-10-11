import React from 'react';
import { Check } from 'lucide-react';
import { OptionGroup } from '@/lib/types';
import { formatCurrency } from '@/lib/format/currency';

interface ToggleGroupProps {
  group: OptionGroup;
  selectedOptionId?: string;
  onChange: (optionId: string) => void;
  disabled?: boolean;
}

export const ToggleGroup: React.FC<ToggleGroupProps> = ({
  group,
  selectedOptionId,
  onChange,
  disabled = false,
}) => {
  // If group has options, find the togglable option (or primary option)
  const activeOption = group.options[0];
  if (!activeOption) {
    return null;
  }

  const isSelected = selectedOptionId === activeOption.id;
  const isAvailable = activeOption.available;

  const priceDeltaText =
    activeOption.priceDelta > 0
      ? `+${formatCurrency(activeOption.priceDelta)}`
      : activeOption.priceDelta < 0
      ? `-${formatCurrency(Math.abs(activeOption.priceDelta))}`
      : null;

  const accessibleLabel = `${activeOption.label}${
    priceDeltaText ? ` (${priceDeltaText})` : ''
  }${!isAvailable ? ` - Unavailable: ${activeOption.unavailableReason || 'Out of stock'}` : ''}`;

  const handleToggle = () => {
    if (!isAvailable || disabled) return;
    if (isSelected) {
      // Toggle off
      onChange('');
    } else {
      // Toggle on
      onChange(activeOption.id);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between p-3 rounded-sm border border-border bg-bg hover:bg-surface/30 transition-colors">
        <div className="flex flex-col pr-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-text">
              {activeOption.label}
            </span>
            {priceDeltaText && (
              <span className="text-xs text-text-muted">
                ({priceDeltaText})
              </span>
            )}
          </div>
          {activeOption.detail && (
            <span className="text-xs text-text-muted mt-0.5">
              {activeOption.detail}
            </span>
          )}
          {!isAvailable && activeOption.unavailableReason && (
            <span className="text-xs text-error mt-1">
              {activeOption.unavailableReason}
            </span>
          )}
        </div>

        {/* Switch element */}
        <button
          type="button"
          role="switch"
          aria-checked={isSelected}
          aria-disabled={!isAvailable || disabled}
          disabled={!isAvailable || disabled}
          aria-label={accessibleLabel}
          onClick={handleToggle}
          className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 ${
            isSelected ? 'bg-primary' : 'bg-surface-alt border border-border'
          } ${
            !isAvailable
              ? 'opacity-40 cursor-not-allowed'
              : 'cursor-pointer'
          }`}
        >
          <span
            className={`inline-flex items-center justify-center h-5 w-5 rounded-full bg-white shadow-xs transition-transform ${
              isSelected ? 'translate-x-6' : 'translate-x-1'
            }`}
          >
            {isSelected && (
              <Check className="w-3.5 h-3.5 text-primary stroke-[3]" aria-hidden="true" />
            )}
          </span>
        </button>
      </div>
    </div>
  );
};
