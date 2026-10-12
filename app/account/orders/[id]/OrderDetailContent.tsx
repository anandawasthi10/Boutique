'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Package, MapPin, AlertCircle, Clock, RotateCcw } from 'lucide-react';
import { ordersApi } from '@/lib/api';
import { Order } from '@/lib/types';
import { AccountLayout } from '@/components/account/AccountLayout';
import { OrderTimeline } from '@/components/account/OrderTimeline';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/format/currency';
import { formatOrderStatus, formatPaymentStatus } from '@/lib/format/status';

interface OrderDetailContentProps {
  orderId: string;
}

export const OrderDetailContent: React.FC<OrderDetailContentProps> = ({ orderId }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shouldNotFound, setShouldNotFound] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let ignore = false;
    ordersApi
      .getOrderById(orderId)
      .then((data) => {
        if (!ignore) {
          setOrder(data);
          setError(null);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const e = err as { code?: string; status?: number; message?: string };
          if (
            e.code === 'ORDER_NOT_FOUND' ||
            e.code === 'NOT_FOUND' ||
            e.status === 404 ||
            e.message?.toLowerCase().includes('not found')
          ) {
            setShouldNotFound(true);
          } else {
            setError(e.message || 'Unable to load order details. Please try again.');
          }
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [orderId]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    ordersApi
      .getOrderById(orderId)
      .then((data) => {
        setOrder(data);
        setError(null);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Unable to refresh order.';
        setError(msg);
      })
      .finally(() => {
        setIsRefreshing(false);
      });
  };

  if (shouldNotFound) {
    notFound();
  }

  if (isLoading) {
    return (
      <AccountLayout title="Order Details">
        <div data-testid="order-detail-loading" className="space-y-6">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </AccountLayout>
    );
  }

  if (error || !order) {
    return (
      <AccountLayout title="Order Details">
        <ErrorState
          title="Could Not Load Order"
          message={error || 'An unexpected error occurred while loading this order.'}
          onRetry={() => {
            setIsLoading(true);
            ordersApi.getOrderById(orderId).then(setOrder).catch(() => setShouldNotFound(true)).finally(() => setIsLoading(false));
          }}
        />
      </AccountLayout>
    );
  }

  const orderStatusMeta = formatOrderStatus(order.status);
  const paymentStatusMeta = formatPaymentStatus(order.paymentStatus);
  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <AccountLayout
      title={`Order #${order.orderNumber}`}
      description={`Placed on ${formattedDate}`}
    >
      <div data-testid="order-detail-view" className="space-y-8">
        {/* Back Link */}
        <div>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium transition-colors hover:underline"
            style={{ color: 'var(--color-primary)' }}
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back to My Orders</span>
          </Link>
        </div>

        {/* Status Header Banner */}
        <section
          aria-labelledby="order-status-banner-heading"
          className="rounded-xl p-5 sm:p-6"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--color-text-muted)' }}>
                Current Status
              </p>
              <h2
                id="order-status-banner-heading"
                className="font-serif text-2xl font-normal mt-1"
                style={{ color: 'var(--color-text)' }}
              >
                {orderStatusMeta.label}
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                {orderStatusMeta.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                data-testid="detail-order-status-badge"
                className="px-3 py-1 rounded-full text-xs font-medium border"
                style={orderStatusMeta.badgeStyle}
              >
                {orderStatusMeta.label}
              </span>
              <span
                data-testid="detail-payment-status-badge"
                className="px-3 py-1 rounded-full text-xs font-medium border"
                style={paymentStatusMeta.badgeStyle}
              >
                {paymentStatusMeta.label}
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <OrderTimeline status={order.status} />
          </div>
        </section>

        {/* Pending / Failed Explanations (Criterion 4) */}
        {order.paymentStatus === 'pending' && (
          <div
            data-testid="pending-payment-notice"
            className="p-5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={{
              backgroundColor: 'rgba(217, 164, 65, 0.1)',
              borderColor: 'rgba(217, 164, 65, 0.3)',
            }}
          >
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 mt-0.5 shrink-0" style={{ color: 'var(--color-warning)' }} aria-hidden="true" />
              <div>
                <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                  Payment Under Verification
                </h3>
                <p className="text-xs leading-relaxed mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  We are awaiting final confirmation from the payment gateway. Once verified, your piece will enter the atelier queue.
                </p>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              data-testid="detail-refresh-status-btn"
              className="shrink-0"
            >
              {isRefreshing ? 'Checking...' : 'Check Status'}
            </Button>
          </div>
        )}

        {order.paymentStatus === 'failed' && (
          <div
            data-testid="failed-payment-notice"
            className="p-5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={{
              backgroundColor: 'rgba(179, 70, 63, 0.08)',
              borderColor: 'rgba(179, 70, 63, 0.25)',
            }}
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: 'var(--color-error)' }} aria-hidden="true" />
              <div>
                <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                  Payment Was Not Completed
                </h3>
                <p className="text-xs leading-relaxed mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  The payment attempt for this order was unsuccessful. No funds were captured. You may return to checkout or select another payment method.
                </p>
              </div>
            </div>

            <Link href="/checkout">
              <Button
                variant="primary"
                size="sm"
                data-testid="detail-retry-payment-btn"
                className="shrink-0 inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Retry Checkout</span>
              </Button>
            </Link>
          </div>
        )}

        {/* Order Items */}
        <section
          aria-labelledby="detail-items-heading"
          className="rounded-xl p-6"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
            <h2
              id="detail-items-heading"
              className="font-serif text-xl font-medium"
              style={{ color: 'var(--color-text)' }}
            >
              Order Items ({order.items.reduce((s, i) => s + i.quantity, 0)})
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
                    Quantity: {item.quantity} × {formatCurrency(item.unitPrice)}
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

        {/* Address and Financial Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Delivery Address */}
          <section
            aria-labelledby="detail-address-heading"
            className="rounded-xl p-6"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
              <h2
                id="detail-address-heading"
                className="font-serif text-lg font-medium"
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

          {/* Totals Summary */}
          <section
            aria-labelledby="detail-totals-heading"
            className="rounded-xl p-6"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <h2
              id="detail-totals-heading"
              className="font-serif text-lg font-medium mb-3"
              style={{ color: 'var(--color-text)' }}
            >
              Order Summary
            </h2>

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between" style={{ color: 'var(--color-text-muted)' }}>
                <dt>Subtotal</dt>
                <dd>{formatCurrency(order.totals.subtotal)}</dd>
              </div>

              <div className="flex justify-between" style={{ color: 'var(--color-text-muted)' }}>
                <dt>Shipping</dt>
                <dd>
                  {order.totals.shipping === 0 ? 'Complimentary' : formatCurrency(order.totals.shipping)}
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
                <dt>Total Amount</dt>
                <dd data-testid="detail-total-amount">{formatCurrency(order.totals.total)}</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </AccountLayout>
  );
};
