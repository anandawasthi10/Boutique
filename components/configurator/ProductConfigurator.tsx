import React from 'react';
import { Product } from '@/lib/types';
import { useConfigurator } from '@/lib/hooks/useConfigurator';
import { OptionGroupRenderer } from './OptionGroupRenderer';
import { ConfiguratorPreview } from './ConfiguratorPreview';
import { SelectionSummary } from './SelectionSummary';
import { PriceBreakdown } from './PriceBreakdown';
import { AlertCircle, X } from 'lucide-react';

export interface ProductConfiguratorProps {
  product: Product;
  initialSelections?: Record<string, string>;
  onSelectionChange?: (selectedIds: Record<string, string>) => void;
  renderAddToCart?: (state: ReturnType<typeof useConfigurator>) => React.ReactNode;
  showPreview?: boolean;
}

export const ProductConfigurator: React.FC<ProductConfiguratorProps> = ({
  product,
  initialSelections,
  onSelectionChange,
  renderAddToCart,
  showPreview = false,
}) => {
  const configurator = useConfigurator({
    product,
    initialSelections,
  });

  const {
    selectedOptionIds,
    selectOption,
    clearOption,
    quote,
    isLoadingQuote,
    isQuoteOutdated,
    quoteError,
    missingRequiredGroups,
    unavailableNotice,
    clearUnavailableNotice,
  } = configurator;

  // Notify parent if callback provided
  React.useEffect(() => {
    onSelectionChange?.(selectedOptionIds);
  }, [selectedOptionIds, onSelectionChange]);

  return (
    <div data-testid="product-configurator" className="flex flex-col gap-6">
      {/* Optional In-Configurator Preview (e.g. for Build-Your-Own or sidebar) */}
      {showPreview && (
        <ConfiguratorPreview
          product={product}
          selectedOptionIds={selectedOptionIds}
          className="mb-2"
        />
      )}

      {/* Unavailable selection notice */}
      {unavailableNotice && (
        <div
          data-testid="unavailable-notice"
          className="flex items-center justify-between p-3 rounded-[4px] bg-error/10 border border-error/20 text-xs text-error"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{unavailableNotice}</span>
          </div>
          <button
            type="button"
            onClick={clearUnavailableNotice}
            aria-label="Dismiss notice"
            className="p-1 hover:opacity-75 transition-opacity"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Option Groups */}
      <div className="flex flex-col gap-6">
        {product.optionGroups.map((group) => (
          <div
            key={group.id}
            className="border-b border-[var(--color-border)] pb-6 last:border-b-0"
          >
            <OptionGroupRenderer
              group={group}
              selectedOptionId={selectedOptionIds[group.id]}
              onChange={(optId) => {
                if (optId === '') {
                  clearOption(group.id);
                } else {
                  selectOption(group.id, optId);
                }
              }}
              disabled={isLoadingQuote}
            />
          </div>
        ))}
      </div>

      {/* Selection Summary */}
      <SelectionSummary
        product={product}
        selectedOptionIds={selectedOptionIds}
        missingRequiredGroups={missingRequiredGroups}
      />

      {/* Live Price Breakdown */}
      <PriceBreakdown
        quote={quote}
        basePrice={product.basePrice}
        isLoading={isLoadingQuote}
        isOutdated={isQuoteOutdated}
        error={quoteError}
      />

      {/* Add To Cart Slot (FE-19) */}
      {renderAddToCart && renderAddToCart(configurator)}
    </div>
  );
};
