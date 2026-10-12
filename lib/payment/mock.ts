import { PaymentStartParams, PaymentResult, PaymentOutcomeTrigger } from './types';
import { updateOrderStatusInternal } from '../api/mock/orders';

let mockOutcomeState: PaymentOutcomeTrigger = 'paid';

/**
 * Configure the next simulated payment outcome.
 * Used for testing pending, success (paid), failed, and cancelled payment flows.
 */
export function setMockPaymentOutcome(outcome: PaymentOutcomeTrigger): void {
  mockOutcomeState = outcome;
}

export function getMockPaymentOutcome(): PaymentOutcomeTrigger {
  return mockOutcomeState;
}

/**
 * Isolated mock payment adapter.
 * Simulates external gateway redirect and returns the customer to the site's result screen.
 * Never stores or requests payment secrets, cards, or UPI numbers.
 */
export async function startMockPayment(params: PaymentStartParams): Promise<PaymentResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const outcome = mockOutcomeState;

      // Update mock order status to match simulated outcome
      if (outcome === 'paid') {
        updateOrderStatusInternal(params.orderId, 'placed', 'paid');
      } else if (outcome === 'pending') {
        updateOrderStatusInternal(params.orderId, 'placed', 'pending');
      } else if (outcome === 'failed') {
        updateOrderStatusInternal(params.orderId, 'cancelled', 'failed');
      } else if (outcome === 'cancelled') {
        updateOrderStatusInternal(params.orderId, 'cancelled', 'cancelled');
      }

      const returnUrl =
        params.returnUrl ||
        `/order-confirmation?orderId=${encodeURIComponent(params.orderId)}`;

      resolve({
        orderId: params.orderId,
        status: outcome,
        redirectUrl: returnUrl,
      });
    }, 15);
  });
}
