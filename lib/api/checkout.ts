import { apiFetch } from './client';
import type { CheckoutRequest, CheckoutResponse } from '../types';

export async function createCheckout(request: CheckoutRequest): Promise<CheckoutResponse> {
  return apiFetch<CheckoutResponse>('/checkout', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}
