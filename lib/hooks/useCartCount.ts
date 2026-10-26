'use client';

import { useState, useEffect } from 'react';
import { cartApi, hasActiveSession } from '../api';

export function useCartCount() {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    async function loadCart() {
      if (!hasActiveSession()) {
        if (mounted) {
          setCount(0);
          setLoading(false);
        }
        return;
      }

      try {
        const cart = await cartApi.getCart();
        if (mounted) {
          const totalQty = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
          setCount(totalQty);
        }
      } catch {
        if (mounted) setCount(0);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadCart();

    const handleCartUpdated = () => {
      loadCart();
    };

    window.addEventListener('cart-updated', handleCartUpdated);
    return () => {
      mounted = false;
      window.removeEventListener('cart-updated', handleCartUpdated);
    };
  }, []);

  return { count, loading };
}
