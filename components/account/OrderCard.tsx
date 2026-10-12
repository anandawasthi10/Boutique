'use client';

import React from 'react';
import Link from 'next/link';
import { Package, ChevronRight, Calendar } from 'lucide-react';
import { Order } from '@/lib/types';
import { formatCurrency } from '@/lib/format/currency';
import { formatOrderStatus, formatPaymentStatus } from '@/lib/format/status';

interface OrderCardProps {
  order: Order;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const statusMeta = formatOrderStatus(order.status);
  const paymentMeta = formatPaymentStatus(order.paymentStatus);

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const itemCount = order.items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <article
      data-testid={`order-card-${order.id}`}
      className="rounded-xl p-5 sm:p-6 transition-all duration-150 hover:shadow-sm"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
            <h2 className="font-semibold text-base" style={{ color: 'var(--color-text)' }}>
              Order #{order.orderNumber}
            </h2>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
            <time dateTime={order.createdAt}>{formattedDate}</time>
          </div>
        </div>

        {/* Status badges with accessible text labels */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            data-testid={`order-status-${order.id}`}
            className="px-2.5 py-1 rounded-full text-xs font-medium border inline-flex items-center"
            style={statusMeta.badgeStyle}
          >
            {statusMeta.label}
          </span>
          {order.paymentStatus !== 'paid' && (
            <span
              data-testid={`order-payment-status-${order.id}`}
              className="px-2.5 py-1 rounded-full text-xs font-medium border inline-flex items-center"
              style={paymentMeta.badgeStyle}
            >
              {paymentMeta.label}
            </span>
          )}
        </div>
      </div>

      {/* Item Summary */}
      <div className="py-4 space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
          {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
        </p>
        <ul className="space-y-1.5 text-sm" style={{ color: 'var(--color-text)' }}>
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between items-start text-xs sm:text-sm">
              <span className="truncate pr-4">
                <span className="font-medium">{item.quantity}×</span> {item.productName}
                {item.selectedOptionsText && (
                  <span className="ml-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    ({item.selectedOptionsText})
                  </span>
                )}
              </span>
              <span className="shrink-0 font-medium">
                {formatCurrency(item.lineTotal)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer Total & Link to Detail */}
      <div className="pt-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
        <div>
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Total Amount:{' '}
          </span>
          <span className="font-semibold text-base" style={{ color: 'var(--color-text)' }}>
            {formatCurrency(order.totals.total)}
          </span>
        </div>

        <Link
          href={`/account/orders/${order.id}`}
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium transition-colors hover:underline"
          style={{ color: 'var(--color-primary)' }}
          data-testid={`view-order-link-${order.id}`}
        >
          <span>View Details</span>
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
};
