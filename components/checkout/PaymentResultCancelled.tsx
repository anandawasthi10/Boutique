'use client';

import React from 'react';
import Link from 'next/link';
import { Ban, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Order } from '@/lib/types';
import { Button } from '@/components/ui/Button';

interface PaymentResultCancelledProps {
  order: Order;
}

export const PaymentResultCancelled: React.FC<PaymentResultCancelledProps> = ({
  order,
}) => {
  return (
    <div
      data-testid="payment-cancelled-view"
      className="max-w-xl mx-auto text-center px-4 py-12 md:py-16"
    >
      <div
        className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
      >
        <Ban
          className="w-8 h-8"
          style={{ color: 'var(--color-text-muted)' }}
          aria-hidden="true"
        />
      </div>

      <p
        className="text-xs uppercase tracking-widest mb-2 font-medium"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Order Incomplete
      </p>

      <h1
        className="font-serif text-3xl md:text-4xl font-normal mb-4"
        style={{ color: 'var(--color-text)' }}
      >
        Payment Was Cancelled
      </h1>

      <p
        className="text-base md:text-lg mb-6 leading-relaxed max-w-md mx-auto"
        style={{ color: 'var(--color-text-muted)' }}
      >
        You cancelled the payment session for Order{' '}
        <span className="font-semibold" style={{ color: 'var(--color-text)' }}>
          #{order.orderNumber}
        </span>
        . The order was not completed.
      </p>

      {/* Criterion 5: saying nothing was charged only if the API confirms it */}
      {order.paymentStatus === 'cancelled' && (
        <div
          className="p-4 rounded-lg mb-8 text-sm text-center max-w-md mx-auto"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
          }}
          data-testid="cancelled-no-charge-notice"
        >
          No charges were made to your account.
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link href="/cart" className="w-full sm:w-auto">
          <Button
            variant="primary"
            data-testid="cancelled-return-cart-btn"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Return to Cart
          </Button>
        </Link>
        <Link href="/shop" className="w-full sm:w-auto">
          <Button
            variant="secondary"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" aria-hidden="true" />
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
};
