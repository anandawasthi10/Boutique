/**
 * Payment Module Types
 * Conforms to FE-30: Isolated, replaceable payment gateway abstraction
 */

export type PaymentOutcomeTrigger = 'paid' | 'pending' | 'failed' | 'cancelled';

export interface PaymentStartParams {
  orderId: string;
  amount: number;
  currency: string;
  gatewayOrderId?: string;
  keyId?: string;
  returnUrl?: string;
}

export interface PaymentResult {
  orderId: string;
  status: PaymentOutcomeTrigger;
  redirectUrl: string;
}

export interface PaymentGatewayModule {
  startPayment: (params: PaymentStartParams) => Promise<PaymentResult>;
  setTriggerOutcome?: (outcome: PaymentOutcomeTrigger) => void;
  getTriggerOutcome?: () => PaymentOutcomeTrigger;
}
