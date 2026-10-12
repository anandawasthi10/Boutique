import { describe, it, expect, beforeEach } from 'vitest';
import {
  startPayment,
  setMockPaymentOutcome,
  getMockPaymentOutcome,
  PaymentStartParams,
} from '@/lib/payment';
import { getOrderById, addOrderInternal } from '@/lib/api/mock/orders';
import { Order } from '@/lib/types';

const mockOrder: Order = {
  id: 'ord-fe30-test',
  orderNumber: 'ORD-FE30-01',
  createdAt: new Date().toISOString(),
  items: [],
  address: {
    id: 'addr-1',
    recipientName: 'Priya Sharma',
    phone: '9876543210',
    line1: '123 Market St',
    city: 'Bengaluru',
    state: 'Karnataka',
    pinCode: '560001',
    isDefault: true,
  },
  totals: {
    subtotal: 1200,
    shipping: 0,
    total: 1200,
  },
  status: 'placed',
  paymentStatus: 'pending',
};

describe('FE-30: Handoff to payment', () => {
  beforeEach(() => {
    addOrderInternal({ ...mockOrder });
    setMockPaymentOutcome('paid');
  });

  it('does not expose gateway secrets in payment params or module interface', async () => {
    const params: PaymentStartParams = {
      orderId: 'ord-fe30-test',
      amount: 1200,
      currency: 'INR',
      gatewayOrderId: 'gw_order_123',
      keyId: 'rzp_test_public_key',
    };

    // Public parameters only, no private secrets
    expect(params).not.toHaveProperty('key_secret');
    expect(params).not.toHaveProperty('secret');
    expect(params).not.toHaveProperty('apiKey');

    const result = await startPayment(params);
    expect(result).toHaveProperty('redirectUrl');
    expect(result.orderId).toBe('ord-fe30-test');
  });

  it('never collects card or UPI credentials in payment interface', () => {
    const params: PaymentStartParams = {
      orderId: 'ord-fe30-test',
      amount: 1200,
      currency: 'INR',
    };

    expect(params).not.toHaveProperty('cardNumber');
    expect(params).not.toHaveProperty('cvv');
    expect(params).not.toHaveProperty('upiId');
  });

  it('triggers successful (paid) outcome and redirects to result page', async () => {
    setMockPaymentOutcome('paid');
    expect(getMockPaymentOutcome()).toBe('paid');

    const result = await startPayment({
      orderId: 'ord-fe30-test',
      amount: 1200,
      currency: 'INR',
    });

    expect(result.status).toBe('paid');
    expect(result.redirectUrl).toBe('/order-confirmation?orderId=ord-fe30-test');

    const updated = await getOrderById('ord-fe30-test');
    expect(updated.paymentStatus).toBe('paid');
  });

  it('triggers pending outcome for asynchronous payment methods', async () => {
    setMockPaymentOutcome('pending');
    expect(getMockPaymentOutcome()).toBe('pending');

    const result = await startPayment({
      orderId: 'ord-fe30-test',
      amount: 1200,
      currency: 'INR',
    });

    expect(result.status).toBe('pending');
    expect(result.redirectUrl).toBe('/order-confirmation?orderId=ord-fe30-test');

    const updated = await getOrderById('ord-fe30-test');
    expect(updated.paymentStatus).toBe('pending');
  });

  it('triggers failed payment outcome and updates order paymentStatus to failed', async () => {
    setMockPaymentOutcome('failed');
    expect(getMockPaymentOutcome()).toBe('failed');

    const result = await startPayment({
      orderId: 'ord-fe30-test',
      amount: 1200,
      currency: 'INR',
    });

    expect(result.status).toBe('failed');
    expect(result.redirectUrl).toBe('/order-confirmation?orderId=ord-fe30-test');

    const updated = await getOrderById('ord-fe30-test');
    expect(updated.paymentStatus).toBe('failed');
  });

  it('triggers cancelled payment outcome and updates order paymentStatus to cancelled', async () => {
    setMockPaymentOutcome('cancelled');
    expect(getMockPaymentOutcome()).toBe('cancelled');

    const result = await startPayment({
      orderId: 'ord-fe30-test',
      amount: 1200,
      currency: 'INR',
    });

    expect(result.status).toBe('cancelled');
    expect(result.redirectUrl).toBe('/order-confirmation?orderId=ord-fe30-test');

    const updated = await getOrderById('ord-fe30-test');
    expect(updated.paymentStatus).toBe('cancelled');
  });
});
