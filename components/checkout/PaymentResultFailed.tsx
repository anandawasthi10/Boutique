'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, RotateCcw } from 'lucide-react';
import { Order } from '@/lib/types';
import { Button } from '@/components/ui/Button';

interface PaymentResultFailedProps {
  order: Order;
  onRetryPayment?: () => void;
}

export const PaymentResultFailed: React.FC<PaymentResultFailedProps> = ({
  order,
  onRetryPayment,
}) => {
  return (
    <div
      data-testid="payment-failed-view"
      className="max-w-xl mx-auto text-center px-4 py-12 md:py-16"
    >
      <div
        className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
        style={{
          backgroundColor: 'rgba(179, 70, 63, 0.1)',
          border: '1px solid rgba(179, 70, 63, 0.25)',
        }}
      >
        <AlertCircle
          className="w-8 h-8"
          style={{ color: 'var(--color-error)' }}
          aria-hidden="true"
        />
      </div>

      <p
        className="text-xs uppercase tracking-widest mb-2 font-medium"
        style={{ color: 'var(--color-error)' }}
      >
        Payment Unsuccessful
      </p>

      <h1
        className="font-serif text-3xl md:text-4xl font-normal mb-4"
        style={{ color: 'var(--color-text)' }}
      >
        Payment Could Not Be Processed
      </h1>

      <p
        className="text-base md:text-lg mb-6 leading-relaxed max-w-md mx-auto"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Your payment attempt for Order{' '}
        <span className="font-semibold" style={{ color: 'var(--color-text)' }}>
          #{order.orderNumber}
        </span>{' '}
        did not go through. Your card or account was not charged.
      </p>

      <div
        className="p-4 rounded-lg mb-8 text-sm text-left max-w-md mx-auto"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
      >
        <p className="font-medium mb-1" style={{ color: 'var(--color-text)' }}>
          What happened?
        </p>
        <p style={{ color: 'var(--color-text-muted)' }}>
          The payment provider declined or failed the transaction. You can retry checkout with an alternate payment method, or return to your cart.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {onRetryPayment ? (
          <Button
            variant="primary"
            onClick={onRetryPayment}
            data-testid="retry-payment-button"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            Retry Payment
          </Button>
        ) : (
          <Link href="/checkout" className="w-full sm:w-auto">
            <Button
              variant="primary"
              data-testid="retry-payment-button"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              Return to Checkout
            </Button>
          </Link>
        )}

        <Link href="/cart" className="w-full sm:w-auto">
          <Button
            variant="secondary"
            data-testid="return-to-cart-button"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Return to Cart
          </Button>
        </Link>
      </div>
    </div>
  );
};
