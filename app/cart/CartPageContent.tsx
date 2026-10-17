'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, AlertTriangle } from 'lucide-react';
import { useCart } from '@/lib/hooks/useCart';
import { formatCurrency } from '@/lib/format/currency';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { CartItemRow } from '@/components/cart/CartItemRow';
import { EditConfigurationModal } from '@/components/cart/EditConfigurationModal';
import { CartItem } from '@/lib/types';

export const CartPageContent: React.FC = () => {
  const router = useRouter();
  const {
    cart,
    itemCount,
    isLoading,
    error,
    refreshCart,
    updateQuantity,
    removeItem,
    isItemPending,
  } = useCart();

  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const [acknowledgedItems, setAcknowledgedItems] = useState<Set<string>>(new Set());

  const handleAcknowledgeNotice = (itemId: string) => {
    setAcknowledgedItems((prev) => new Set(prev).add(itemId));
  };

  const items = cart?.items ?? [];
  const isEmpty = !isLoading && items.length === 0;

  // Determine if any item has an unacknowledged notice or is unavailable
  const hasBlockingIssues = items.some(
    (item) =>
      item.status === 'unavailable' ||
      ((item.status === 'price_changed' || Boolean(item.notice)) &&
        !acknowledgedItems.has(item.id))
  );

  return (
    <div className="bg-[var(--color-bg)] min-h-[calc(100vh-200px)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Shopping Bag' },
          ]}
        />

        {/* Page Title & Count */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[var(--color-border)] pb-6 mb-8">
          <h1 className="text-h1 font-serif text-[var(--color-text)]">
            Shopping Bag
          </h1>
          {!isEmpty && !isLoading && (
            <span
              data-testid="cart-page-item-count"
              className="text-sm font-medium text-[var(--color-text-muted)]"
            >
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>

        {/* Loading State */}
        {isLoading && !cart && (
          <div data-testid="cart-page-loading" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 flex flex-col gap-4">
              <Skeleton className="h-28 w-full rounded-[4px]" />
              <Skeleton className="h-28 w-full rounded-[4px]" />
              <Skeleton className="h-28 w-full rounded-[4px]" />
            </div>
            <div className="lg:col-span-4">
              <Skeleton className="h-64 w-full rounded-[4px]" />
            </div>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && !cart && (
          <ErrorState
            title="Unable to load your shopping bag"
            message={error}
            onRetry={refreshCart}
            retryLabel="Reload Bag"
          />
        )}

        {/* Empty State */}
        {isEmpty && (
          <div data-testid="cart-page-empty" className="py-16">
            <EmptyState
              icon={<ShoppingBag className="w-16 h-16 text-[var(--color-text-muted)]" />}
              title="Your shopping bag is empty"
              headingLevel="h2"
              description="Discover our collection of handcrafted bespoke accessories made to order."
            >
              <Link
                href="/shop"
                className="inline-flex items-center justify-center px-8 py-3 rounded-[4px] bg-[var(--color-primary)] text-[var(--color-primary-text)] font-medium text-sm hover:opacity-90 transition-opacity"
              >
                Shop All Accessories
              </Link>
            </EmptyState>
          </div>
        )}

        {/* Populated Cart Content */}
        {!isEmpty && cart && (
          <div data-testid="cart-page-content" className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left: Item List */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* Global cart notices if any */}
              {cart.notices && cart.notices.length > 0 && (
                <div
                  data-testid="cart-global-notices"
                  className="p-4 rounded-[4px] bg-warning/10 border border-warning/20 text-sm text-[var(--color-text)] flex flex-col gap-1.5"
                >
                  {cart.notices.map((n, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-[var(--color-warning)] shrink-0" />
                      <span>{n}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Items Card */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[4px] p-6 shadow-xs">
                <div className="divide-y divide-[var(--color-border)]">
                  {items.map((item) => (
                    <CartItemRow
                      key={item.id}
                      item={item}
                      onUpdateQuantity={async (quantity) => {
                        await updateQuantity(item.id, quantity);
                      }}
                      onRemove={async () => {
                        await removeItem(item.id);
                      }}
                      onEditConfiguration={() => setEditingItem(item)}
                      onAcknowledgeNotice={() => handleAcknowledgeNotice(item.id)}
                      isPending={isItemPending(item.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Continue Shopping Link */}
              <div className="flex justify-start">
                <Link
                  href="/shop"
                  className="text-sm font-medium text-[var(--color-primary)] hover:underline inline-flex items-center gap-1.5"
                >
                  <span>&larr; Continue Shopping</span>
                </Link>
              </div>
            </div>

            {/* Right: Order Summary Sidebar */}
            <div className="lg:col-span-4 sticky top-24">
              <div
                data-testid="cart-order-summary"
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[4px] p-6 shadow-xs flex flex-col gap-6"
              >
                <h2 className="text-h3 font-serif text-[var(--color-text)] border-b border-[var(--color-border)] pb-3">
                  Order Summary
                </h2>

                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex justify-between items-center text-[var(--color-text)]">
                    <span>Subtotal</span>
                    <span
                      data-testid="cart-summary-subtotal"
                      className="font-medium"
                    >
                      {formatCurrency(cart.subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[var(--color-text)]">
                    <span>Shipping</span>
                    <span
                      data-testid="cart-summary-shipping"
                      className="font-medium"
                    >
                      {formatCurrency(cart.shipping ?? 0)}
                    </span>
                  </div>

                  <div className="border-t border-[var(--color-border)] pt-3 flex justify-between items-baseline">
                    <span className="text-base font-semibold text-[var(--color-text)]">
                      Total
                    </span>
                    <span
                      data-testid="cart-summary-total"
                      className="text-lg font-bold text-[var(--color-text)]"
                    >
                      {formatCurrency(cart.total)}
                    </span>
                  </div>
                </div>

                {/* Blocking notice if applicable */}
                {hasBlockingIssues && (
                  <div
                    data-testid="cart-blocking-notice"
                    className="p-3 rounded-[4px] bg-warning/10 border border-warning/20 text-xs text-[var(--color-text)] flex items-start gap-2"
                  >
                    <AlertTriangle className="w-4 h-4 text-[var(--color-warning)] shrink-0 mt-0.5" />
                    <span>
                      Please acknowledge price changes or remove unavailable items before proceeding.
                    </span>
                  </div>
                )}

                {/* Checkout CTA */}
                <Button
                  variant="primary"
                  size="lg"
                  disabled={hasBlockingIssues || items.length === 0}
                  onClick={() => router.push('/checkout')}
                  className="w-full justify-center text-sm font-medium tracking-wide uppercase"
                  data-testid="proceed-to-checkout-btn"
                >
                  <span>Proceed to Checkout</span>
                </Button>

                {/* Editorial Trust Markers */}
                <div className="flex flex-col gap-2.5 pt-4 border-t border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
                  <span>Handmade accessories</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Configuration Modal */}
        <EditConfigurationModal
          isOpen={Boolean(editingItem)}
          onClose={() => setEditingItem(null)}
          item={editingItem}
        />
      </div>
    </div>
  );
};
