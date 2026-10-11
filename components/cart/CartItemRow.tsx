'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { CartItem } from '@/lib/types';
import { formatCurrency } from '@/lib/format/currency';
import { QuantityStepper } from './QuantityStepper';

export interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (quantity: number) => Promise<void>;
  onRemove: () => Promise<void>;
  onAcknowledgeNotice?: () => void;
  isPending?: boolean;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
  onAcknowledgeNotice,
  isPending = false,
}) => {
  const [itemError, setItemError] = useState<string | null>(null);

  const handleIncrement = async () => {
    try {
      setItemError(null);
      await onUpdateQuantity(item.quantity + 1);
    } catch (err) {
      setItemError(err instanceof Error ? err.message : 'Could not increase quantity.');
    }
  };

  const handleDecrement = async () => {
    if (item.quantity <= 1) return;
    try {
      setItemError(null);
      await onUpdateQuantity(item.quantity - 1);
    } catch (err) {
      setItemError(err instanceof Error ? err.message : 'Could not decrease quantity.');
    }
  };

  const handleRemove = async () => {
    try {
      setItemError(null);
      await onRemove();
    } catch (err) {
      setItemError(err instanceof Error ? err.message : 'Could not remove item.');
    }
  };

  const hasNotice = Boolean(
    item.notice || item.status === 'price_changed' || item.status === 'unavailable'
  );

  return (
    <div
      data-testid={`cart-item-${item.id}`}
      className="py-4 border-b border-[var(--color-border)] last:border-b-0 flex flex-col gap-2.5"
    >
      <div className="flex gap-4">
        {/* Item Thumbnail */}
        <div className="relative w-16 h-16 rounded-[4px] overflow-hidden bg-[var(--color-surface-alt)] shrink-0 border border-[var(--color-border)]">
          <Image
            src={item.image || '/images/products/placeholder.svg'}
            alt=""
            fill
            sizes="64px"
            className="object-cover"
          />
        </div>

        {/* Item Info */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex justify-between items-start gap-2">
              <h4 className="text-sm font-medium text-[var(--color-text)] truncate">
                {item.productName}
              </h4>
              <button
                type="button"
                onClick={handleRemove}
                disabled={isPending}
                aria-label={`Remove ${item.productName} from cart`}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-error)] p-1 rounded-[3px] transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[var(--color-text-muted)]" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Selected Options Summary */}
            {item.selectedOptions && item.selectedOptions.length > 0 && (
              <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1 text-xs text-[var(--color-text-muted)]">
                {item.selectedOptions.map((opt) => (
                  <span key={opt.groupId} className="inline-block">
                    {opt.groupLabel}: <strong className="font-medium text-[var(--color-text)]">{opt.optionLabel}</strong>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Stepper & Line Price */}
          <div className="flex items-center justify-between mt-3">
            <QuantityStepper
              quantity={item.quantity}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              disabled={isPending || item.status === 'unavailable'}
              isLoading={isPending}
              itemName={item.productName}
            />

            <div className="text-right">
              <span className="text-sm font-semibold text-[var(--color-text)]">
                {formatCurrency(item.lineTotal)}
              </span>
              {item.quantity > 1 && (
                <div className="text-[11px] text-[var(--color-text-muted)]">
                  {formatCurrency(item.unitPrice)} each
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Item Availability / Price Changed Notice */}
      {hasNotice && (
        <div
          data-testid="item-notice-banner"
          className="flex items-start justify-between gap-2 p-2 rounded-[4px] bg-warning/10 border border-warning/20 text-xs text-[var(--color-text)]"
        >
          <div className="flex items-start gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-[var(--color-warning)] shrink-0 mt-0.5" />
            <span>
              {item.notice ||
                (item.status === 'unavailable'
                  ? 'This item is currently unavailable.'
                  : 'The price for this item has been updated.')}
            </span>
          </div>
          {onAcknowledgeNotice && item.status !== 'unavailable' && (
            <button
              type="button"
              onClick={onAcknowledgeNotice}
              className="text-[11px] underline font-medium text-[var(--color-text)] hover:opacity-75 whitespace-nowrap cursor-pointer"
            >
              Acknowledge
            </button>
          )}
        </div>
      )}

      {/* Item-level Error State */}
      {itemError && (
        <div className="text-xs text-[var(--color-error)] bg-error/10 p-2 rounded-[3px]">
          {itemError}
        </div>
      )}
    </div>
  );
};
