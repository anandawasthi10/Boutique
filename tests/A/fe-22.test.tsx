import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CartDrawer } from '@/components/cart';
import { CartProvider } from '@/lib/hooks/useCart';
import { Cart } from '@/lib/types';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('FE-22: Cart drawer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const emptyCart: Cart = {
    items: [],
    subtotal: 0,
    total: 0,
  };

  const cartWithItems: Cart = {
    items: [
      {
        id: 'cart-1',
        productId: 'prod-scrunchie',
        productName: 'Classic Linen Scrunchie',
        image: '/images/products/scrunchie.svg',
        selectedOptions: [
          {
            groupId: 'fabric',
            groupLabel: 'Fabric',
            optionId: 'opt-linen',
            optionLabel: 'Natural Linen',
          },
        ],
        quantity: 2,
        unitPrice: 249,
        lineTotal: 498,
        status: 'available',
      },
    ],
    subtotal: 498,
    total: 498,
  };

  const cartWithNotice: Cart = {
    items: [
      {
        id: 'cart-notice-1',
        productId: 'prod-pouch',
        productName: 'Bespoke Makeup Pouch',
        image: '/images/products/pouch.svg',
        selectedOptions: [],
        quantity: 1,
        unitPrice: 699,
        lineTotal: 699,
        status: 'price_changed',
        notice: 'The price for this item increased by ₹100.',
      },
    ],
    subtotal: 699,
    total: 699,
  };

  const cartWithUnavailable: Cart = {
    items: [
      {
        id: 'cart-unavail-1',
        productId: 'prod-sleeve',
        productName: 'Padded Laptop Sleeve',
        image: '/images/products/sleeve.svg',
        selectedOptions: [],
        quantity: 1,
        unitPrice: 899,
        lineTotal: 899,
        status: 'unavailable',
        notice: 'Fabric out of stock.',
      },
    ],
    subtotal: 899,
    total: 899,
  };

  it('renders empty state with a clear link to Shop All when cart has no items', () => {
    render(
      <CartProvider initialCart={emptyCart}>
        <CartDrawer isOpen={true} />
      </CartProvider>
    );

    expect(screen.getByText(/your shopping bag is empty/i)).toBeInTheDocument();
    const shopAllLink = screen.getByRole('link', { name: /shop all accessories/i });
    expect(shopAllLink).toBeInTheDocument();
    expect(shopAllLink).toHaveAttribute('href', '/shop');
  });

  it('renders items with image, options, quantity, line total, and subtotal/total from API', () => {
    render(
      <CartProvider initialCart={cartWithItems}>
        <CartDrawer isOpen={true} />
      </CartProvider>
    );

    // Item details
    expect(screen.getByText('Classic Linen Scrunchie')).toBeInTheDocument();
    expect(screen.getByText('Natural Linen')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // quantity

    // Subtotal and Total strictly from API
    expect(screen.getByText('Subtotal')).toBeInTheDocument();
    expect(screen.getAllByText('₹498').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Total')).toBeInTheDocument();

    // Checkout button is active when no notices block it
    const checkoutButton = screen.getByRole('button', { name: /proceed to checkout/i });
    expect(checkoutButton).toBeEnabled();
  });

  it('blocks Checkout when an item has an unacknowledged price notice, and unblocks upon acknowledgement', () => {
    render(
      <CartProvider initialCart={cartWithNotice}>
        <CartDrawer isOpen={true} />
      </CartProvider>
    );

    // Notice banner is visible
    expect(
      screen.getByText(/the price for this item increased by ₹100/i)
    ).toBeInTheDocument();

    // Checkout blocked indicator
    expect(screen.getByTestId('checkout-blocked-notice')).toBeInTheDocument();
    const checkoutButton = screen.getByRole('button', { name: /proceed to checkout/i });
    expect(checkoutButton).toBeDisabled();

    // Acknowledge notice
    const ackButton = screen.getByRole('button', { name: /acknowledge/i });
    fireEvent.click(ackButton);

    // Checkout is now unblocked
    expect(checkoutButton).toBeEnabled();
    expect(screen.queryByTestId('checkout-blocked-notice')).not.toBeInTheDocument();
  });

  it('blocks Checkout when an item is unavailable', () => {
    render(
      <CartProvider initialCart={cartWithUnavailable}>
        <CartDrawer isOpen={true} />
      </CartProvider>
    );

    expect(screen.getByText(/fabric out of stock/i)).toBeInTheDocument();
    expect(screen.getByTestId('checkout-blocked-notice')).toBeInTheDocument();
    const checkoutButton = screen.getByRole('button', { name: /proceed to checkout/i });
    expect(checkoutButton).toBeDisabled();
  });

  it('closes properly and executes close callback', () => {
    const handleClose = vi.fn();
    render(
      <CartProvider initialCart={cartWithItems}>
        <CartDrawer isOpen={true} onClose={handleClose} />
      </CartProvider>
    );

    const closeButton = screen.getByRole('button', { name: /close drawer/i });
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
