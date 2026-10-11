'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ArrowRight, AlertCircle } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency } from '@/lib/format/currency';
import { useCart } from '@/lib/hooks/useCart';
import { usePreferences } from '@/lib/hooks/usePreferences';
import { CartItemRow } from './CartItemRow';

export interface CartDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
}) => {
  const router = useRouter();
  const { cart, isDrawerOpen, closeDrawer, updateQuantity, removeItem, isItemPending } = useCart();
  const { reducedMotion } = usePreferences();
  const [acknowledgedNotices, setAcknowledgedNotices] = useState<Record<string, boolean>>({});

  const isOpen = propIsOpen !== undefined ? propIsOpen : isDrawerOpen;
  const handleClose = propOnClose || closeDrawer;

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  // Check if any item has an unacknowledged notice or is unavailable
  const hasBlockingNotice = items.some((item) => {
    if (item.status === 'unavailable') return true;
    if ((item.status === 'price_changed' || item.notice) && !acknowledgedNotices[item.id]) {
      return true;
    }
    return false;
  });

  const handleAcknowledge = (itemId: string) => {
    setAcknowledgedNotices((prev) => ({
      ...prev,
      [itemId]: true,
    }));
  };

  const handleProceedToCheckout = () => {
    if (hasBlockingNotice) return;
    handleClose();
    router.push('/checkout');
  };

  const handleViewCart = () => {
    handleClose();
    router.push('/cart');
  };

  const drawerFooter = !isEmpty && cart && (
    <div className="flex flex-col gap-3">
      {/* Warning message if checkout is blocked */}
      {hasBlockingNotice && (
        <div
          data-testid="checkout-blocked-notice"
          className="flex items-center gap-2 p-2.5 rounded-[4px] bg-error/10 border border-error/20 text-xs text-error font-medium"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Please resolve unavailable items or acknowledge price notices before checkout.</span>
        </div>
      )}

      {/* Subtotal and Total strictly from API */}
      <div className="flex flex-col gap-1.5 text-sm text-[var(--color-text-muted)]">
        <div className="flex justify-between items-center">
          <span>Subtotal</span>
          <span className="font-semibold text-[var(--color-text)]">
            {formatCurrency(cart.subtotal)}
          </span>
        </div>
        <div className="flex justify-between items-baseline pt-2 border-t border-[var(--color-border)]">
          <span className="font-semibold text-[var(--color-text)]">Total</span>
          <span className="text-price font-bold text-[var(--color-text)]">
            {formatCurrency(cart.total)}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <Button
          variant="primary"
          onClick={handleProceedToCheckout}
          disabled={hasBlockingNotice}
          className={`w-full justify-center ${reducedMotion ? 'transition-none' : ''}`}
        >
          Proceed to Checkout
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>

        <Button
          variant="secondary"
          onClick={handleViewCart}
          className="w-full justify-center"
        >
          View Full Cart
        </Button>
      </div>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={handleClose}
      title="Shopping Bag"
      side="right"
      footer={drawerFooter}
    >
      <div data-testid="cart-drawer-content" className="flex flex-col h-full">
        {isEmpty ? (
          <div className="py-12 flex flex-col items-center justify-center my-auto">
            <EmptyState
              icon={<ShoppingBag className="w-12 h-12 text-[var(--color-text-muted)]" />}
              title="Your shopping bag is empty"
              description="Discover our collection of handcrafted bespoke accessories."
            >
              <Link
                href="/shop"
                onClick={handleClose}
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-[4px] bg-[var(--color-primary)] text-[var(--color-primary-text)] font-medium text-sm hover:opacity-90 transition-opacity"
              >
                Shop All Accessories
              </Link>
            </EmptyState>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                onUpdateQuantity={async (qty) => {
                  await updateQuantity(item.id, qty);
                }}
                onRemove={async () => {
                  await removeItem(item.id);
                }}
                onAcknowledgeNotice={() => handleAcknowledge(item.id)}
                isPending={isItemPending(item.id)}
              />
            ))}
          </div>
        )}
      </div>
    </Drawer>
  );
};
