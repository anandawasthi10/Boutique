import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddToCartBar } from '@/components/product/AddToCartBar';
import { CartProvider } from '@/lib/hooks/useCart';
import { Product, Cart } from '@/lib/types';
import * as currentUserHook from '@/lib/hooks/useCurrentUser';
import { cartApi } from '@/lib/api';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('FE-19: Add-to-cart bar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockProduct: Product = {
    id: 'prod-scrunchie',
    slug: 'classic-scrunchie',
    name: 'Classic Linen Scrunchie',
    basePrice: 249,
    description: 'A handmade linen scrunchie.',
    images: [{ url: '/img/1.svg', alt: 'Scrunchie', order: 1 }],
    category: { id: 'cat-1', name: 'Hair' },
    optionGroups: [
      {
        id: 'grp-fabric',
        label: 'Fabric',
        type: 'swatch',
        required: true,
        options: [
          { id: 'opt-linen', label: 'Linen', priceDelta: 0, available: true },
        ],
      },
    ],
  };

  it('button is disabled with a visible reason until configuration is complete and valid', () => {
    render(
      <CartProvider>
        <AddToCartBar
          product={mockProduct}
          selectedOptionIds={{}}
          isComplete={false}
          isValid={false}
          canAddToCart={false}
          missingRequiredGroups={[mockProduct.optionGroups[0]]}
        />
      </CartProvider>
    );

    const button = screen.getByRole('button', { name: /add to cart/i });
    expect(button).toBeDisabled();

    // Visible reason shown
    expect(screen.getByTestId('disabled-reason-notice')).toHaveTextContent(
      'Please select Fabric'
    );
  });

  it('on success, sends option IDs only, updates cart, and opens drawer', async () => {
    vi.spyOn(currentUserHook, 'useCurrentUser').mockReturnValue({
      user: { id: 'usr-1', email: 'test@example.com', name: 'Tester' },
      loading: false,
    });

    const addSpy = vi.spyOn(cartApi, 'addToCart').mockResolvedValue({
      items: [
        {
          id: 'item-1',
          productId: 'prod-scrunchie',
          productName: 'Classic Linen Scrunchie',
          image: '/img/1.svg',
          selectedOptions: [],
          quantity: 2,
          unitPrice: 249,
          lineTotal: 498,
          status: 'available',
        },
      ],
      subtotal: 498,
      total: 498,
    });

    render(
      <CartProvider>
        <AddToCartBar
          product={mockProduct}
          selectedOptionIds={{ 'grp-fabric': 'opt-linen' }}
          isComplete={true}
          isValid={true}
          canAddToCart={true}
        />
      </CartProvider>
    );

    // Increase quantity to 2
    const incButton = screen.getByRole('button', {
      name: /increase quantity of Classic Linen Scrunchie/i,
    });
    fireEvent.click(incButton);
    expect(screen.getByText('2')).toBeInTheDocument();

    const addButton = screen.getByRole('button', { name: /add to cart/i });
    expect(addButton).toBeEnabled();

    fireEvent.click(addButton);

    await waitFor(() => {
      // Configuration sent must contain option IDs only!
      expect(addSpy).toHaveBeenCalledWith({
        productId: 'prod-scrunchie',
        selectedOptionIds: ['opt-linen'],
        quantity: 2,
      });
    });
  });

  it('second click while loading does nothing (prevents double submission)', async () => {
    vi.spyOn(currentUserHook, 'useCurrentUser').mockReturnValue({
      user: { id: 'usr-1', email: 'test@example.com', name: 'Tester' },
      loading: false,
    });

    let resolveApi!: () => void;
    const pendingPromise = new Promise<Cart>((resolve) => {
      resolveApi = () =>
        resolve({
          items: [],
          subtotal: 0,
          total: 0,
        });
    });

    const addSpy = vi.spyOn(cartApi, 'addToCart').mockReturnValue(pendingPromise);

    render(
      <CartProvider>
        <AddToCartBar
          product={mockProduct}
          selectedOptionIds={{ 'grp-fabric': 'opt-linen' }}
          isComplete={true}
          isValid={true}
          canAddToCart={true}
        />
      </CartProvider>
    );

    const addButton = screen.getByRole('button', { name: /add to cart/i });

    // First click
    fireEvent.click(addButton);
    expect(addSpy).toHaveBeenCalledTimes(1);

    // Immediate second click while in loading state
    fireEvent.click(addButton);
    // Should still only have called API once!
    expect(addSpy).toHaveBeenCalledTimes(1);

    resolveApi();
  });

  it('on failure, keeps configuration and offers retry', async () => {
    vi.spyOn(currentUserHook, 'useCurrentUser').mockReturnValue({
      user: { id: 'usr-1', email: 'test@example.com', name: 'Tester' },
      loading: false,
    });

    const addSpy = vi
      .spyOn(cartApi, 'addToCart')
      .mockRejectedValue(new Error('Network timeout adding to cart'));

    render(
      <CartProvider>
        <AddToCartBar
          product={mockProduct}
          selectedOptionIds={{ 'grp-fabric': 'opt-linen' }}
          isComplete={true}
          isValid={true}
          canAddToCart={true}
        />
      </CartProvider>
    );

    const addButton = screen.getByRole('button', { name: /add to cart/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(addSpy).toHaveBeenCalled();
      expect(screen.getByTestId('add-to-cart-error')).toHaveTextContent(
        'Network timeout adding to cart'
      );
      // Retry action is offered
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    // Configuration is preserved and intact
    expect(addButton).toBeInTheDocument();
  });

  it('guest add to cart redirects to login preserving selection in return query', () => {
    // Guest (user === null)
    vi.spyOn(currentUserHook, 'useCurrentUser').mockReturnValue({
      user: null,
      loading: false,
    });

    render(
      <CartProvider>
        <AddToCartBar
          product={mockProduct}
          selectedOptionIds={{ 'grp-fabric': 'opt-linen' }}
          isComplete={true}
          isValid={true}
          canAddToCart={true}
        />
      </CartProvider>
    );

    const addButton = screen.getByRole('button', { name: /add to cart/i });
    fireEvent.click(addButton);

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('/login?returnTo=')
    );
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('classic-scrunchie')
    );
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('opt-linen')
    );
  });
});
