import React from 'react';
import { Check, Slash } from 'lucide-react';
import { Option, OptionGroup } from '@/lib/types';
import { formatCurrency } from '@/lib/format/currency';

interface ColourGroupProps {
  group: OptionGroup;
  selectedOptionId?: string;
  onChange: (optionId: string) => void;
  disabled?: boolean;
}

export const ColourGroup: React.FC<ColourGroupProps> = ({
  group,
  selectedOptionId,
  onChange,
  disabled = false,
}) => {
  const selectedOption = group.options.find((opt) => opt.id === selectedOptionId);

  return (
    <div className="space-y-3">
      {/* Selection indicator text */}
      <div className="text-sm text-text-muted">
        Selected: <span className="font-medium text-text">{selectedOption ? selectedOption.label : 'None'}</span>
      </div>

      {/* Colour dots radio group */}
      <div
        role="radiogroup"
        aria-label={group.label}
        className="flex flex-wrap items-center gap-3"
      >
        {group.options.map((option: Option) => {
          const isSelected = option.id === selectedOptionId;
          const isAvailable = option.available;
          const colourHex = option.colourValue || '#D9A5A0';
          const priceDeltaText =
            option.priceDelta > 0
              ? `+${formatCurrency(option.priceDelta)}`
              : option.priceDelta < 0
              ? `-${formatCurrency(Math.abs(option.priceDelta))}`
              : null;

          const accessibleLabel = `${option.label}${
            priceDeltaText ? ` (${priceDeltaText})` : ''
          }${!isAvailable ? ` - Unavailable: ${option.unavailableReason || 'Out of stock'}` : ''}`;

          return (
            <div key={option.id} className="relative flex flex-col items-center">
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
                className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 ${
                  isSelected
                    ? 'ring-2 ring-primary ring-offset-2 shadow-sm'
                    : 'border border-border hover:scale-105'
                } ${
                  !isAvailable
                    ? 'opacity-40 cursor-not-allowed'
                    : 'cursor-pointer'
                }`}
                style={{ backgroundColor: colourHex }}
              >
                {/* Visual Checkmark indicator for selected state (Never colour alone) */}
                {isSelected && (
                  <span
                    className="w-5 h-5 rounded-full bg-surface/90 text-primary flex items-center justify-center shadow-xs"
                    aria-hidden="true"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                )}

                {/* Strikethrough icon when unavailable */}
                {!isAvailable && !isSelected && (
                  <Slash className="w-5 h-5 text-error stroke-[2]" aria-hidden="true" />
                )}
              </button>

              {/* Unavailable reason hint if disabled */}
              {!isAvailable && option.unavailableReason && (
                <span className="text-[11px] text-error mt-1 text-center max-w-[64px] leading-tight">
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
