'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ShoppingBag, Package, MapPin } from 'lucide-react';
import { Order } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/format/currency';

interface PaymentResultSuccessProps {
  order: Order;
}

export const PaymentResultSuccess: React.FC<PaymentResultSuccessProps> = ({ order }) => {
  return (
    <div
      data-testid="payment-success-view"
      className="max-w-3xl mx-auto px-4 py-10 md:py-16"
    >
      {/* Header Banner */}
      <div className="text-center mb-10">
        <div
          className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: 'rgba(111, 132, 112, 0.15)',
            border: '1px solid var(--color-sage)',
          }}
        >
          <CheckCircle2
            className="w-8 h-8"
            style={{ color: 'var(--color-sage-deep)' }}
            aria-hidden="true"
          />
        </div>

        <p
          className="text-xs uppercase tracking-widest mb-1 font-medium"
          style={{ color: 'var(--color-sage-deep)' }}
        >
          Payment Received
        </p>

        <h1
          className="font-serif text-3xl md:text-4xl font-normal mb-3"
          style={{ color: 'var(--color-text)' }}
        >
          Thank You for Your Order
        </h1>

        <p
          className="text-base md:text-lg mb-2"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Order Reference:{' '}
          <span
            data-testid="order-number-display"
            className="font-semibold"
            style={{ color: 'var(--color-text)' }}
          >
            #{order.orderNumber}
          </span>
        </p>

        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          A confirmation has been recorded in your account.
        </p>
      </div>

      <div className="space-y-8">
        {/* Order Items Summary */}
        <section
          aria-labelledby="order-items-heading"
          className="rounded-xl p-6"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
            <h2
              id="order-items-heading"
              className="text-xl font-medium"
              style={{ color: 'var(--color-text)' }}
            >
              Purchased Accessories
            </h2>
          </div>

          <ul className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {order.items.map((item) => (
              <li key={item.id} className="py-4 first:pt-0 last:pb-0 flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="font-medium text-base" style={{ color: 'var(--color-text)' }}>
                    {item.productName}
                  </h3>
                  {item.selectedOptionsText && (
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      {item.selectedOptionsText}
                    </p>
                  )}
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
                    {formatCurrency(item.lineTotal)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Address and Totals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Delivery Address */}
          <section
            aria-labelledby="delivery-address-heading"
            className="rounded-xl p-6"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
              <h2
                id="delivery-address-heading"
                className="text-lg font-medium"
                style={{ color: 'var(--color-text)' }}
              >
                Delivery Address
              </h2>
            </div>

            <div className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
              <p className="font-semibold">{order.address.recipientName}</p>
              <p>{order.address.line1}</p>
              {order.address.line2 && <p>{order.address.line2}</p>}
              <p>
                {order.address.city}, {order.address.state} {order.address.pinCode}
              </p>
              <p className="mt-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Phone: {order.address.phone}
              </p>
            </div>
          </section>

          {/* Totals Breakdown */}
          <section
            aria-labelledby="order-totals-heading"
            className="rounded-xl p-6"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <h2
              id="order-totals-heading"
              className="text-lg font-medium mb-3"
              style={{ color: 'var(--color-text)' }}
            >
              Payment Summary
            </h2>

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between" style={{ color: 'var(--color-text-muted)' }}>
                <dt>Subtotal</dt>
                <dd>{formatCurrency(order.totals.subtotal)}</dd>
              </div>

              <div className="flex justify-between" style={{ color: 'var(--color-text-muted)' }}>
                <dt>Shipping</dt>
                <dd>
                  {formatCurrency(order.totals.shipping)}
                </dd>
              </div>

              {order.totals.tax !== undefined && order.totals.tax > 0 && (
                <div className="flex justify-between" style={{ color: 'var(--color-text-muted)' }}>
                  <dt>Taxes</dt>
                  <dd>{formatCurrency(order.totals.tax)}</dd>
                </div>
              )}

              <div
                className="flex justify-between pt-2 border-t font-semibold text-base"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              >
                <dt>Total Paid</dt>
                <dd data-testid="total-paid-display">{formatCurrency(order.totals.total)}</dd>
              </div>
            </dl>
          </section>
        </div>

        {/* What Happens Next Section */}
        <section
          aria-labelledby="what-next-heading"
          className="rounded-xl p-6"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div className="mb-2">
            <h2
              id="what-next-heading"
              className="text-lg font-medium"
              style={{ color: 'var(--color-text)' }}
            >
              What Happens Next
            </h2>
          </div>

          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            Your order has been received. You can track progress and updates anytime in your account.
          </p>
        </section>

        {/* Navigation Action Links */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href={`/account/orders/${order.id}`} className="w-full sm:w-auto">
            <Button
              variant="primary"
              data-testid="view-order-details-btn"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2"
            >
              View in My Orders
            </Button>
          </Link>
          <Link href="/shop" className="w-full sm:w-auto">
            <Button
              variant="secondary"
              data-testid="continue-shopping-btn"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" aria-hidden="true" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
