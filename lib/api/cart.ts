import { apiFetch, ApiException } from './client';
import { setActiveSession } from './auth';
import type { Cart, AddToCartRequest, UpdateCartItemRequest } from '../types';

const EMPTY_GUEST_CART: Cart = {
  items: [],
  subtotal: 0,
  shipping: 0,
  total: 0,
  notices: [],
};

export async function getCart(): Promise<Cart> {
  try {
    return await apiFetch<Cart>('/cart', {
      method: 'GET',
    });
  } catch (err: unknown) {
    if (
      err instanceof ApiException &&
      (err.code === 'HTTP_401' ||
        err.code === 'UNAUTHORIZED' ||
        err.code === 'UNAUTHENTICATED')
    ) {
      // Stale session expired: clear active session indicator once without retry
      setActiveSession(false);
      return { ...EMPTY_GUEST_CART };
    }
    throw err;
  }
}

export async function addToCart(request: AddToCartRequest): Promise<Cart> {
  await apiFetch<unknown>('/cart/items', {
    method: 'POST',
    body: JSON.stringify(request),
  });
  setActiveSession(true);
  return await getCart();
}

export async function updateCartItem(
  itemId: string,
  request: UpdateCartItemRequest
): Promise<Cart> {
  try {
    await apiFetch<unknown>(`/cart/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(request),
    });
    return await getCart();
  } catch (err: unknown) {
    if (
      err instanceof ApiException &&
      (err.code === 'HTTP_401' ||
        err.code === 'UNAUTHORIZED' ||
        err.code === 'UNAUTHENTICATED')
    ) {
      setActiveSession(false);
    }
    throw err;
  }
}

export async function removeCartItem(itemId: string): Promise<Cart> {
  try {
    await apiFetch<unknown>(`/cart/items/${itemId}`, {
      method: 'DELETE',
    });
    return await getCart();
  } catch (err: unknown) {
    if (
      err instanceof ApiException &&
      (err.code === 'HTTP_401' ||
        err.code === 'UNAUTHORIZED' ||
        err.code === 'UNAUTHENTICATED')
    ) {
      setActiveSession(false);
    }
    throw err;
  }
}
