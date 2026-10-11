import React from 'react';
import Image from 'next/image';
import { Check } from 'lucide-react';
import { Option, OptionGroup } from '@/lib/types';
import { formatCurrency } from '@/lib/format/currency';

interface SwatchGroupProps {
  group: OptionGroup;
  selectedOptionId?: string;
  onChange: (optionId: string) => void;
  disabled?: boolean;
}

export const SwatchGroup: React.FC<SwatchGroupProps> = ({
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

      {/* Radio group of swatches */}
      <div
        role="radiogroup"
        aria-label={group.label}
        className="flex flex-wrap gap-3"
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
                className={`relative w-12 h-12 rounded-full overflow-hidden transition-all flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 ${
                  isSelected
                    ? 'ring-2 ring-primary ring-offset-2 shadow-sm'
                    : 'border border-border hover:border-text-muted'
                } ${
                  !isAvailable
                    ? 'opacity-40 cursor-not-allowed bg-surface-alt'
                    : 'cursor-pointer'
                }`}
              >
                {/* Texture Image or neutral fallback swatch */}
                {option.swatchImageUrl ? (
                  <Image
                    src={option.swatchImageUrl}
                    alt=""
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full bg-surface-alt flex items-center justify-center text-xs text-text-muted"
                    aria-hidden="true"
                  >
                    {option.label.slice(0, 2).toUpperCase()}
                  </div>
                )}

                {/* Selected Checkmark overlay (Never rely on colour alone) */}
                {isSelected && (
                  <span
                    className="absolute inset-0 bg-primary/40 flex items-center justify-center text-primary-text"
                    aria-hidden="true"
                  >
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  </span>
                )}
              </button>

              {/* Unavailable reason hint if option is disabled */}
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
