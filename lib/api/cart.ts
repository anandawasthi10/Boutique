import { apiFetch } from './client';
import type { Cart, AddToCartRequest, UpdateCartItemRequest } from '../types';

export async function getCart(): Promise<Cart> {
  return apiFetch<Cart>('/cart', {
    method: 'GET',
  });
}

export async function addToCart(request: AddToCartRequest): Promise<Cart> {
  return apiFetch<Cart>('/cart/items', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function updateCartItem(
  itemId: string,
  request: UpdateCartItemRequest
): Promise<Cart> {
  return apiFetch<Cart>(`/cart/items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify(request),
  });
}

export async function removeCartItem(itemId: string): Promise<Cart> {
  return apiFetch<Cart>(`/cart/items/${itemId}`, {
    method: 'DELETE',
  });
}
