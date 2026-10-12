/**
 * Payment Gateway Module Entry Point
 * Single point of entry for checkout handoff.
 * Shielded behind an isolated interface so the underlying provider can be swapped
 * without touching checkout UI components.
 */

import { PaymentStartParams, PaymentResult } from './types';
import {
  startMockPayment,
  setMockPaymentOutcome,
  getMockPaymentOutcome,
} from './mock';

export * from './types';
export { setMockPaymentOutcome, getMockPaymentOutcome };

/**
 * Initiates payment session with payment provider.
 * Never requests or exposes secret keys, and never captures sensitive card/UPI credentials.
 */
export async function startPayment(params: PaymentStartParams): Promise<PaymentResult> {
  // In the current architecture without an agreed real gateway, use the isolated mock adapter.
  return startMockPayment(params);
}
