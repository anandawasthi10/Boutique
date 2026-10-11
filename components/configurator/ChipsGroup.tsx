import React from 'react';
import { Check } from 'lucide-react';
import { Option, OptionGroup } from '@/lib/types';
import { formatCurrency } from '@/lib/format/currency';

interface ChipsGroupProps {
  group: OptionGroup;
  selectedOptionId?: string;
  onChange: (optionId: string) => void;
  disabled?: boolean;
}

export const ChipsGroup: React.FC<ChipsGroupProps> = ({
  group,
  selectedOptionId,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="space-y-3">
      {/* Radio group of chips */}
      <div
        role="radiogroup"
        aria-label={group.label}
        className="flex flex-wrap gap-2.5"
      >
        {group.options.map((option: Option) => {
          const isSelected = option.id === selectedOptionId;
          const isAvailable = option.available;
          const priceDeltaText =
            option.priceDelta > 0
              ? `+${formatCurrency(option.priceDelta)}`
              : option.priceDelta < 0
              ? `-${formatCurrency(Math.abs(option.priceDelta))}`
              : null;

          const accessibleLabel = `${option.label}${
            option.detail ? ` (${option.detail})` : ''
          }${priceDeltaText ? ` - ${priceDeltaText}` : ''}${
            !isAvailable ? ` - Unavailable: ${option.unavailableReason || 'Out of stock'}` : ''
          }`;

          return (
            <div key={option.id} className="flex flex-col">
              <button
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-disabled={!isAvailable || disabled}
                disabled={!isAvailable || disabled}
                aria-label={accessibleLabel}
                onClick={() => {
                  if (isAvailable && !disabled) {
                    onChange(option.id);
                  }
                }}
                className={`min-h-[44px] px-4 py-2 rounded-sm border text-sm font-medium transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 ${
                  isSelected
                    ? 'border-primary bg-surface text-primary shadow-xs'
                    : 'border-border bg-bg text-text hover:border-text-muted hover:bg-surface/50'
                } ${
                  !isAvailable
                    ? 'opacity-40 cursor-not-allowed bg-surface-alt line-through'
                    : 'cursor-pointer'
                }`}
              >
                {/* Visual Checkmark indicator for selected state (Never colour alone) */}
                {isSelected && (
                  <Check className="w-4 h-4 text-primary stroke-[2.5]" aria-hidden="true" />
                )}

                <span>{option.label}</span>

                {/* Optional detail such as measurements */}
                {option.detail && (
                  <span className="text-xs text-text-muted font-normal">
                    ({option.detail})
                  </span>
                )}

                {/* Price change tag */}
                {priceDeltaText && (
                  <span className="text-xs font-normal text-text-muted">
                    {priceDeltaText}
                  </span>
                )}
              </button>

              {/* Unavailable reason hint if disabled */}
              {!isAvailable && option.unavailableReason && (
                <span className="text-[11px] text-error mt-1 leading-tight">
                  {option.unavailableReason}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
