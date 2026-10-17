import React from 'react';
import { Product, OptionGroup } from '@/lib/types';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export interface SelectionSummaryProps {
  product: Product;
  selectedOptionIds: Record<string, string>;
  missingRequiredGroups: OptionGroup[];
  className?: string;
}

export const SelectionSummary: React.FC<SelectionSummaryProps> = ({
  product,
  selectedOptionIds,
  missingRequiredGroups,
  className = '',
}) => {
  // Collect chosen options
  const chosenItems: { groupLabel: string; optionLabel: string }[] = [];

  product.optionGroups.forEach((group) => {
    const selectedId = selectedOptionIds[group.id];
    if (selectedId) {
      const option = group.options.find((opt) => opt.id === selectedId);
      if (option) {
        chosenItems.push({
          groupLabel: group.label,
          optionLabel: option.label,
        });
      }
    }
  });

  const hasMissing = missingRequiredGroups.length > 0;

  return (
    <div
      data-testid="selection-summary"
      className={`p-4 rounded-[4px] bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col gap-3 ${className}`}
    >
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
        <h2 className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text)]">
          Your Bespoke Selection
        </h2>
        {hasMissing ? (
          <span className="flex items-center gap-1 text-[11px] text-[var(--color-warning)] font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            Incomplete
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[11px] text-[var(--color-success)] font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Complete
          </span>
        )}
      </div>

      {/* Chosen options list */}
      {chosenItems.length > 0 ? (
        <ul className="flex flex-col gap-1.5 text-sm text-[var(--color-text)]">
          {chosenItems.map((item, idx) => (
            <li key={`${item.groupLabel}-${idx}`} className="flex justify-between items-center">
              <span className="text-[var(--color-text-muted)]">{item.groupLabel}:</span>
              <span className="font-medium">{item.optionLabel}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-[var(--color-text-muted)] italic">
          No options selected yet.
        </p>
      )}

      {/* Missing required choices indicator */}
      {hasMissing && (
        <div
          data-testid="missing-required-alert"
          className="mt-1 p-2.5 rounded-[4px] bg-warning/10 border border-warning/20 text-xs text-[var(--color-text)] flex items-start gap-2"
        >
          <AlertCircle className="w-4 h-4 text-[var(--color-warning)] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[var(--color-warning)]">
              Required choices still missing:{' '}
            </span>
            <span>{missingRequiredGroups.map((g) => g.label).join(', ')}</span>
          </div>
        </div>
      )}
    </div>
  );
};
