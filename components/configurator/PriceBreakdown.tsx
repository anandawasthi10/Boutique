import React from 'react';
import { PriceQuote } from '@/lib/types';
import { formatCurrency } from '@/lib/format/currency';
import { Skeleton } from '@/components/ui/Skeleton';

export interface PriceBreakdownProps {
  quote: PriceQuote | null;
  basePrice?: number;
  isLoading?: boolean;
  isOutdated?: boolean;
  error?: string | null;
  className?: string;
}

export const PriceBreakdown: React.FC<PriceBreakdownProps> = ({
  quote,
  basePrice,
  isLoading = false,
  isOutdated = false,
  error = null,
  className = '',
}) => {
  return (
    <div
      data-testid="price-breakdown"
      className={`p-4 rounded-[4px] bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col gap-3 ${className}`}
    >
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
        <h2 className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text)]">
          Price Breakdown
        </h2>
        {isOutdated && !isLoading && (
          <span className="text-[11px] text-[var(--color-warning)] font-medium">
            Recalculating...
          </span>
        )}
      </div>

      {/* Screen Reader Live Region for price announcement */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {quote
          ? `Total price is ${formatCurrency(quote.total)}${isOutdated ? ', price updating' : ''}`
          : basePrice
          ? `Starting price is ${formatCurrency(basePrice)}`
          : ''}
      </div>

      {/* Error state */}
      {error && (
        <div className="text-xs text-[var(--color-error)] bg-error/10 p-2.5 rounded-[4px]">
          {error}
        </div>
      )}

      {/* Loading state without initial quote */}
      {isLoading && !quote ? (
        <div className="space-y-2 py-1">
          <Skeleton height={16} width="100%" />
          <Skeleton height={16} width="80%" />
          <div className="pt-2 border-t border-[var(--color-border)]">
            <Skeleton height={24} width="50%" />
          </div>
        </div>
      ) : quote ? (
        <div className="flex flex-col gap-2">
          {/* Quote line items */}
          <div className="flex flex-col gap-1.5 text-sm text-[var(--color-text-muted)]">
            {quote.lines.map((line, idx) => {
              const formattedAmount =
                line.amount < 0
                  ? `-${formatCurrency(Math.abs(line.amount))}`
                  : formatCurrency(line.amount);

              return (
                <div key={`${line.label}-${idx}`} className="flex justify-between items-center">
                  <span>{line.label}</span>
                  <span className="font-medium text-[var(--color-text)]">{formattedAmount}</span>
                </div>
              );
            })}
          </div>

          {/* Quote Total */}
          <div className="pt-3 border-t border-[var(--color-border)] flex justify-between items-baseline">
            <span className="text-sm font-semibold text-[var(--color-text)]">
              Total Price
            </span>
            <div className="flex items-baseline gap-2">
              <span
                data-testid="quote-total"
                className={`text-price font-bold text-[var(--color-text)] ${
                  isOutdated ? 'opacity-70' : ''
                }`}
              >
                {formatCurrency(quote.total)}
              </span>
            </div>
          </div>
        </div>
      ) : basePrice !== undefined ? (
        /* Fallback starting price before quote resolution */
        <div className="flex justify-between items-baseline pt-1">
          <span className="text-sm font-semibold text-[var(--color-text)]">Starting from</span>
          <span className="text-price font-bold text-[var(--color-text)]">
            {formatCurrency(basePrice)}
          </span>
        </div>
      ) : null}
    </div>
  );
};
