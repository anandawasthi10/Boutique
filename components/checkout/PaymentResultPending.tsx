'use client';

import React from 'react';
import Link from 'next/link';
import { Loader2, RefreshCw } from 'lucide-react';
import { Order } from '@/lib/types';
import { Button } from '@/components/ui/Button';

interface PaymentResultPendingProps {
  order: Order;
  isPolling: boolean;
  pollCount: number;
  maxPolls: number;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const PaymentResultPending: React.FC<PaymentResultPendingProps> = ({
  order,
  isPolling,
  pollCount,
  maxPolls,
  onRefresh,
  isRefreshing,
}) => {
  const hasReachedLimit = pollCount >= maxPolls;

  return (
    <div
      data-testid="payment-pending-view"
      className="max-w-xl mx-auto text-center px-4 py-12 md:py-16"
    >
      <div
        className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
      >
        <Loader2
          className="w-8 h-8 animate-spin"
          style={{ color: 'var(--color-primary)' }}
          aria-hidden="true"
        />
      </div>

      <p
        className="text-xs uppercase tracking-widest mb-2 font-medium"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Payment Status
      </p>

      <h1
        className="font-serif text-3xl md:text-4xl font-normal mb-4"
        style={{ color: 'var(--color-text)' }}
      >
        Awaiting Payment Confirmation
      </h1>

      <p
        className="text-base md:text-lg mb-6 leading-relaxed max-w-md mx-auto"
        style={{ color: 'var(--color-text-muted)' }}
      >
        We are waiting for confirmation from your payment provider for Order{' '}
        <span className="font-semibold" style={{ color: 'var(--color-text)' }}>
          #{order.orderNumber}
        </span>
        . This usually takes just a few moments.
      </p>

      {isPolling && !hasReachedLimit ? (
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-8"
          style={{
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-muted)',
            border: '1px solid var(--color-border)',
          }}
          aria-live="polite"
        >
          <RefreshCw className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
          <span>Checking payment status automatically... ({pollCount + 1}/{maxPolls})</span>
        </div>
      ) : (
        <div className="mb-8 space-y-3">
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Still waiting? You can check again manually or view your order in your account.
          </p>
          <Button
            variant="secondary"
            onClick={onRefresh}
            disabled={isRefreshing}
            data-testid="manual-refresh-button"
            className="inline-flex items-center gap-2"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            {isRefreshing ? 'Checking...' : 'Refresh Status'}
          </Button>
        </div>
      )}

      <div className="pt-6 border-t flex flex-col sm:flex-row items-center justify-center gap-4" style={{ borderColor: 'var(--color-border)' }}>
        <Link href={`/account/orders/${order.id}`} className="w-full sm:w-auto">
          <Button variant="secondary" className="w-full sm:w-auto">
            View in My Orders
          </Button>
        </Link>
        <Link href="/shop" className="w-full sm:w-auto">
          <Button variant="text" className="w-full sm:w-auto">
            Continue Browsing
          </Button>
        </Link>
      </div>
    </div>
  );
};
