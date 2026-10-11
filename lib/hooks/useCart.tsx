'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Cart, AddToCartRequest } from '@/lib/types';
import { cartApi } from '@/lib/api';

export type CartActionType = 'add' | 'update' | 'remove' | 'refresh';

export interface PendingAction {
  type: CartActionType;
  itemId?: string;
}

export interface CartContextValue {
  cart: Cart | null;
  itemCount: number;
  isLoading: boolean;
  error: string | null;
  pendingAction: PendingAction | null;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  refreshCart: () => Promise<Cart | null>;
  addToCart: (request: AddToCartRequest) => Promise<Cart>;
  updateQuantity: (itemId: string, quantity: number) => Promise<Cart>;
  updateConfiguration: (itemId: string, selectedOptionIds: string[]) => Promise<Cart>;
  removeItem: (itemId: string) => Promise<Cart>;
  clearError: () => void;
  isItemPending: (itemId: string) => boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode; initialCart?: Cart }> = ({
  children,
  initialCart,
}) => {
  const [cart, setCart] = useState<Cart | null>(initialCart ?? null);
  const [isLoading, setIsLoading] = useState<boolean>(!initialCart);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const clearError = useCallback(() => setError(null), []);

  const dispatchCartEvent = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cart-updated'));
    }
  }, []);

  // Fetch initial cart from API on mount
  const refreshCart = useCallback(async (): Promise<Cart | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedCart = await cartApi.getCart();
      setCart(updatedCart);
      dispatchCartEvent();
      return updatedCart;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch cart';
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [dispatchCartEvent]);

  useEffect(() => {
    if (!initialCart) {
      let active = true;
      cartApi
        .getCart()
        .then((updatedCart) => {
          if (active) {
            setCart(updatedCart);
            setError(null);
            setIsLoading(false);
            dispatchCartEvent();
          }
        })
        .catch((err) => {
          if (active) {
            const msg = err instanceof Error ? err.message : 'Failed to fetch cart';
            setError(msg);
            setIsLoading(false);
          }
        });

      return () => {
        active = false;
      };
    }
  }, [initialCart, dispatchCartEvent]);

  // Add product to cart
  const addToCart = useCallback(
    async (request: AddToCartRequest): Promise<Cart> => {
      if (pendingAction) {
        throw new Error('Another cart action is currently in progress.');
      }

      setPendingAction({ type: 'add' });
      setError(null);

      try {
        const updatedCart = await cartApi.addToCart(request);
        setCart(updatedCart);
        dispatchCartEvent();
        return updatedCart;
      } catch (err) {
        // Leave previous cart in place and expose error message
        const msg = err instanceof Error ? err.message : 'Failed to add item to cart.';
        setError(msg);
        throw err;
      } finally {
        setPendingAction(null);
      }
    },
    [pendingAction, dispatchCartEvent]
  );

  // Update quantity for a cart item
  const updateQuantity = useCallback(
    async (itemId: string, quantity: number): Promise<Cart> => {
      if (pendingAction?.itemId === itemId) {
        throw new Error('Item update already in progress.');
      }

      setPendingAction({ type: 'update', itemId });
      setError(null);

      try {
        const updatedCart = await cartApi.updateCartItem(itemId, { quantity });
        setCart(updatedCart);
        dispatchCartEvent();
        return updatedCart;
      } catch (err) {
        // Leave previous cart in place and expose error
        const msg = err instanceof Error ? err.message : 'Failed to update item quantity.';
        setError(msg);
        throw err;
      } finally {
        setPendingAction(null);
      }
    },
    [pendingAction, dispatchCartEvent]
  );

  // Change configuration for a cart item
  const updateConfiguration = useCallback(
    async (itemId: string, selectedOptionIds: string[]): Promise<Cart> => {
      if (pendingAction?.itemId === itemId) {
        throw new Error('Item update already in progress.');
      }

      setPendingAction({ type: 'update', itemId });
      setError(null);

      try {
        const updatedCart = await cartApi.updateCartItem(itemId, { selectedOptionIds });
        setCart(updatedCart);
        dispatchCartEvent();
        return updatedCart;
      } catch (err) {
        // Leave previous cart in place and expose error
        const msg = err instanceof Error ? err.message : 'Failed to update item configuration.';
        setError(msg);
        throw err;
      } finally {
        setPendingAction(null);
      }
    },
    [pendingAction, dispatchCartEvent]
  );

  // Remove item from cart
  const removeItem = useCallback(
    async (itemId: string): Promise<Cart> => {
      if (pendingAction?.itemId === itemId) {
        throw new Error('Item removal already in progress.');
      }

      setPendingAction({ type: 'remove', itemId });
      setError(null);

      try {
        const updatedCart = await cartApi.removeCartItem(itemId);
        setCart(updatedCart);
        dispatchCartEvent();
        return updatedCart;
      } catch (err) {
        // Leave previous cart in place and expose error
        const msg = err instanceof Error ? err.message : 'Failed to remove item from cart.';
        setError(msg);
        throw err;
      } finally {
        setPendingAction(null);
      }
    },
    [pendingAction, dispatchCartEvent]
  );

  const itemCount = useMemo(() => {
    return cart?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;
  }, [cart]);

  const isItemPending = useCallback(
    (itemId: string) => {
      return pendingAction?.itemId === itemId;
    },
    [pendingAction]
  );

  const contextValue = useMemo<CartContextValue>(
    () => ({
      cart,
      itemCount,
      isLoading,
      error,
      pendingAction,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      refreshCart,
      addToCart,
      updateQuantity,
      updateConfiguration,
      removeItem,
      clearError,
      isItemPending,
    }),
    [
      cart,
      itemCount,
      isLoading,
      error,
      pendingAction,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      refreshCart,
      addToCart,
      updateQuantity,
      updateConfiguration,
      removeItem,
      clearError,
      isItemPending,
    ]
  );

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
};

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    return {
      cart: null,
      itemCount: 0,
      isLoading: false,
      error: null,
      pendingAction: null,
      isDrawerOpen: false,
      openDrawer: () => {},
      closeDrawer: () => {},
      refreshCart: async () => null,
      addToCart: async () => {
        throw new Error('No CartProvider found in component tree');
      },
      updateQuantity: async () => {
        throw new Error('No CartProvider found in component tree');
      },
      updateConfiguration: async () => {
        throw new Error('No CartProvider found in component tree');
      },
      removeItem: async () => {
        throw new Error('No CartProvider found in component tree');
      },
      clearError: () => {},
      isItemPending: () => false,
    };
  }
  return context;
}

