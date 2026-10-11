import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCart, CartProvider } from '@/lib/hooks/useCart';
import { cartApi } from '@/lib/api';
import { Cart } from '@/lib/types';

describe('FE-21: Cart state and operations', () => {
  const initialMockCart: Cart = {
    items: [
      {
        id: 'item-1',
        productId: 'prod-1',
        productName: 'Classic Linen Scrunchie',
        image: '/img/1.svg',
        selectedOptions: [],
        quantity: 1,
        unitPrice: 249,
        lineTotal: 249,
        status: 'available',
      },
    ],
    subtotal: 249,
    total: 249,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <CartProvider initialCart={initialMockCart}>{children}</CartProvider>
  );

  it('loads and exposes the cart and derived item count strictly from API object', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.cart).toEqual(initialMockCart);
    expect(result.current.itemCount).toBe(1);
    // Subtotal and total come unmodified from the API response
    expect(result.current.cart?.subtotal).toBe(249);
    expect(result.current.cart?.total).toBe(249);
  });

  it('add to cart calls API layer, prevents double submission, and updates store from API response', async () => {
    const updatedCartFromApi: Cart = {
      items: [
        initialMockCart.items[0],
        {
          id: 'item-2',
          productId: 'prod-2',
          productName: 'Everyday Zip Pouch',
          image: '/img/2.svg',
          selectedOptions: [],
          quantity: 2,
          unitPrice: 499,
          lineTotal: 998,
          status: 'available',
        },
      ],
      subtotal: 1247,
      total: 1247,
    };

    let resolveApi!: (cart: Cart) => void;
    const pendingPromise = new Promise<Cart>((res) => {
      resolveApi = res;
    });

    const addSpy = vi.spyOn(cartApi, 'addToCart').mockReturnValue(pendingPromise);

    const { result } = renderHook(() => useCart(), { wrapper });

    // Initiate add
    let addPromise: Promise<Cart>;
    act(() => {
      addPromise = result.current.addToCart({
        productId: 'prod-2',
        selectedOptionIds: [],
        quantity: 2,
      });
    });

    // Check pending action is tracked
    expect(result.current.pendingAction?.type).toBe('add');

    // Attempting a second click while pending must reject / prevent double submission
    await expect(
      result.current.addToCart({
        productId: 'prod-2',
        selectedOptionIds: [],
        quantity: 2,
      })
    ).rejects.toThrow(/action is currently in progress/i);

    // Resolve API response
    await act(async () => {
      resolveApi(updatedCartFromApi);
      await addPromise;
    });

    expect(addSpy).toHaveBeenCalledWith({
      productId: 'prod-2',
      selectedOptionIds: [],
      quantity: 2,
    });
    expect(result.current.cart).toEqual(updatedCartFromApi);
    expect(result.current.itemCount).toBe(3); // 1 + 2
    expect(result.current.pendingAction).toBeNull();
  });

  it('updates quantity and configuration through API layer without client-side price math', async () => {
    const updatedQtyCart: Cart = {
      items: [
        {
          ...initialMockCart.items[0],
          quantity: 3,
          lineTotal: 747, // server returned
        },
      ],
      subtotal: 747,
      total: 747,
    };

    const updateSpy = vi.spyOn(cartApi, 'updateCartItem').mockResolvedValue(updatedQtyCart);

    const { result } = renderHook(() => useCart(), { wrapper });

    await act(async () => {
      await result.current.updateQuantity('item-1', 3);
    });

    expect(updateSpy).toHaveBeenCalledWith('item-1', { quantity: 3 });
    expect(result.current.cart?.items[0].quantity).toBe(3);
    expect(result.current.cart?.total).toBe(747);
  });

  it('removes item through API layer and updates cart', async () => {
    const emptyCart: Cart = {
      items: [],
      subtotal: 0,
      total: 0,
    };

    const removeSpy = vi.spyOn(cartApi, 'removeCartItem').mockResolvedValue(emptyCart);

    const { result } = renderHook(() => useCart(), { wrapper });

    await act(async () => {
      await result.current.removeItem('item-1');
    });

    expect(removeSpy).toHaveBeenCalledWith('item-1');
    expect(result.current.cart?.items).toHaveLength(0);
    expect(result.current.itemCount).toBe(0);
  });

  it('failed update leaves previous cart intact and exposes error message', async () => {
    vi.spyOn(cartApi, 'updateCartItem').mockRejectedValue(
      new Error('Requested fabric is currently out of stock')
    );

    const { result } = renderHook(() => useCart(), { wrapper });

    await act(async () => {
      try {
        await result.current.updateQuantity('item-1', 10);
      } catch {
        // Expected rejected promise
      }
    });

    // Previous cart remains in place!
    expect(result.current.cart).toEqual(initialMockCart);
    expect(result.current.cart?.items[0].quantity).toBe(1);
    // Error is exposed in store state
    expect(result.current.error).toBe('Requested fabric is currently out of stock');
    expect(result.current.pendingAction).toBeNull();
  });
});
