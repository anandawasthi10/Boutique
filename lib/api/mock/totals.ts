/**
 * Shared mock calculation helper for cart, checkout, and order creation.
 * Ensures cart total, review total, pay button amount, and created order total always agree.
 */

// placeholder rule, not agreed with the client
export const MOCK_SHIPPING_CONFIG = {
  standardRate: 50,
  subtotalThreshold: 1000,
} as const;

export interface CalculatedTotals {
  subtotal: number;
  shipping: number;
  total: number;
}

/**
 * Calculates subtotal, shipping, and total for mock cart and checkout.
 * Subtotal is the sum of item line totals.
 * Shipping is ₹0 if subtotal is 0 or exceeds the threshold; otherwise standardRate.
 * Components do not calculate this; they display only the values returned here.
 */
export function calculateMockTotals(subtotal: number): CalculatedTotals {
  if (subtotal <= 0) {
    return {
      subtotal: 0,
      shipping: 0,
      total: 0,
    };
  }

  const shipping =
    subtotal >= MOCK_SHIPPING_CONFIG.subtotalThreshold
      ? 0
      : MOCK_SHIPPING_CONFIG.standardRate;
  const total = subtotal + shipping;

  return {
    subtotal,
    shipping,
    total,
  };
}
