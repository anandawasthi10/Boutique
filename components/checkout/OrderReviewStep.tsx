'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Cart, Address } from '@/lib/types';
import { formatCurrency } from '@/lib/format/currency';
import { Button } from '@/components/ui/Button';
import { AlertCircle, ArrowLeft, Lock, MapPin, Edit2 } from 'lucide-react';

export interface OrderReviewStepProps {
  cart: Cart;
  deliveryAddress: Address;
  onChangeAddress: () => void;
  onPay: () => Promise<void>;
  isSubmitting?: boolean;
  checkoutError?: string | null;
}

export const OrderReviewStep: React.FC<OrderReviewStepProps> = ({
  cart,
  deliveryAddress,
  onChangeAddress,
  onPay,
  isSubmitting = false,
  checkoutError = null,
}) => {
  // Check for price changes or unavailable items
  const hasPriceNotice = Boolean(
    (cart.notices && cart.notices.length > 0) ||
      cart.items.some((i) => i.status === 'price_changed' || Boolean(i.notice))
  );
  const hasUnavailableItem = cart.items.some((i) => i.status === 'unavailable');
  const hasBlockingIssue = hasPriceNotice || hasUnavailableItem;

  return (
    <div className="space-y-6">
      {/* Blocking Notices Alert */}
      {hasBlockingIssue && (
        <div
          role="alert"
          data-testid="checkout-blocking-notice"
          className="p-4 rounded-[4px] bg-warning/10 border border-warning/30 flex items-start justify-between gap-4 text-xs text-[var(--color-warning)]"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-[var(--color-warning)]" />
            <div>
              <p className="font-semibold text-sm mb-1">
                Cart Updates Require Attention
              </p>
              {hasUnavailableItem ? (
                <p>
                  One or more items in your cart are no longer available. Please return to your cart and remove them before completing your order.
                </p>
              ) : (
                <p>
                  One or more item prices have changed. Please return to your cart to review and acknowledge the updated prices before proceeding.
                </p>
              )}
            </div>
          </div>
          <Link
            href="/cart"
            className="shrink-0 font-semibold underline hover:no-underline text-xs"
          >
            Review Cart
          </Link>
        </div>
      )}

      {/* Checkout Error Banner */}
      {checkoutError && (
        <div
          role="alert"
          data-testid="checkout-error-banner"
          className="p-4 rounded-[4px] bg-error/10 border border-error/20 flex items-start justify-between gap-4 text-xs text-[var(--color-error)]"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{checkoutError}</span>
          </div>
          <Button
            type="button"
            variant="text"
            size="sm"
            onClick={onPay}
            disabled={isSubmitting || hasBlockingIssue}
            className="text-xs h-auto p-0 font-semibold underline text-[var(--color-error)]"
          >
            Retry
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Delivery Address Summary & Items List */}
        <div className="lg:col-span-7 space-y-6">
          {/* Selected Delivery Address Box */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[4px] p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[var(--color-primary)]" />
                <h3 className="text-body font-semibold text-[var(--color-text)]">
                  Delivery Destination
                </h3>
              </div>
              <Button
                type="button"
                variant="text"
                size="sm"
                onClick={onChangeAddress}
                className="text-xs text-[var(--color-primary)] hover:underline"
                data-testid="change-address-btn"
              >
                <Edit2 className="w-3.5 h-3.5 mr-1" />
                <span>Change</span>
              </Button>
            </div>

            <div className="text-body-small text-[var(--color-text-muted)] space-y-1">
              <p className="font-semibold text-[var(--color-text)]">
                {deliveryAddress.recipientName}
              </p>
              <p className="text-[var(--color-text)]">{deliveryAddress.line1}</p>
              {deliveryAddress.line2 && <p>{deliveryAddress.line2}</p>}
              <p>
                {deliveryAddress.city}, {deliveryAddress.state} - {deliveryAddress.pinCode}
              </p>
              <p className="text-xs pt-1">Phone: {deliveryAddress.phone}</p>
            </div>
          </div>

          {/* Items Review List */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[4px] p-6 shadow-xs">
            <h3 className="text-body font-semibold text-[var(--color-text)] pb-4 mb-4 border-b border-[var(--color-border)]">
              Items in Order ({cart.items.length})
            </h3>

            <div className="divide-y divide-[var(--color-border)]">
              {cart.items.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
                  {item.image && (
                    <div className="relative w-16 h-16 rounded-[4px] bg-[var(--color-bg)] overflow-hidden shrink-0 border border-[var(--color-border)]">
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h4 className="text-body-small font-medium text-[var(--color-text)] truncate">
                      {item.productName}
                    </h4>

                    {item.selectedOptions && item.selectedOptions.length > 0 && (
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5 leading-relaxed">
                        {item.selectedOptions
                          .map((opt) => `${opt.groupLabel}: ${opt.optionLabel}`)
                          .join(', ')}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-2 text-xs">
                      <span className="text-[var(--color-text-muted)]">
                        Qty: {item.quantity}
                      </span>
                      <span className="font-semibold text-[var(--color-text)]">
                        {formatCurrency(item.lineTotal)}
                      </span>
                    </div>

                    {item.status !== 'available' && (
                      <span className="inline-block mt-1 text-[11px] text-[var(--color-warning)] font-medium">
                        {item.status === 'unavailable'
                          ? 'Item is no longer available'
                          : 'Price updated'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Pay Button */}
        <div className="lg:col-span-5">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[4px] p-6 shadow-xs sticky top-24">
            <h3 className="text-body font-semibold text-[var(--color-text)] pb-4 mb-4 border-b border-[var(--color-border)]">
              Order Summary
            </h3>

            {/* Totals directly from the API response */}
            <div className="space-y-3 text-body-small text-[var(--color-text-muted)]">
              <div className="flex justify-between items-center">
                <span>Items Subtotal</span>
                <span className="font-medium text-[var(--color-text)]" data-testid="checkout-subtotal">
                  {formatCurrency(cart.subtotal)}
                </span>
              </div>

              <div className="pt-3 border-t border-[var(--color-border)] flex justify-between items-baseline">
                <span className="text-body font-semibold text-[var(--color-text)]">
                  Total Payable
                </span>
                <span
                  className="text-h3 font-serif font-bold text-[var(--color-primary)]"
                  data-testid="checkout-total"
                >
                  {formatCurrency(cart.total)}
                </span>
              </div>
            </div>

            {/* Pay Button */}
            <div className="mt-6">
              <Button
                type="button"
                variant="primary"
                size="lg"
                disabled={isSubmitting || hasBlockingIssue}
                isLoading={isSubmitting}
                onClick={onPay}
                className="w-full justify-center tracking-wide font-medium uppercase text-sm"
                data-testid="checkout-pay-btn"
              >
                <Lock className="w-4 h-4 mr-2" />
                <span>Pay {formatCurrency(cart.total)}</span>
              </Button>

              {hasBlockingIssue && (
                <p className="text-[11px] text-[var(--color-warning)] text-center mt-2 font-medium">
                  Please resolve cart notices before continuing to payment.
                </p>
              )}
            </div>

            {/* Back Action */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={onChangeAddress}
                disabled={isSubmitting}
                className="inline-flex items-center text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Back to Delivery Address
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
