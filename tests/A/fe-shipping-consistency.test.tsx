import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OrderReviewStep } from '@/components/checkout/OrderReviewStep';
import { calculateMockTotals, MOCK_SHIPPING_CONFIG } from '@/lib/api/mock/totals';
import { createCheckout } from '@/lib/api/mock/checkout';
import * as cartMock from '@/lib/api/mock/cart';
import { Cart, Address } from '@/lib/types';
import { formatCurrency } from '@/lib/format/currency';

const mockAddress: Address = {
  id: 'addr-test',
  recipientName: 'Test Recipient',
  phone: '9876543210',
  line1: '123 Atelier Street',
  city: 'Bengaluru',
  state: 'Karnataka',
  pinCode: '560001',
  isDefault: true,
};

describe('Shipping and Total Consistency (Task 1)', () => {
  it('calculates totals identically across below-threshold cart, review, pay button, and created order', async () => {
    // 1. Below threshold (subtotal 499 < 1000)
    const subtotalBelow = 499;
    const totalsBelow = calculateMockTotals(subtotalBelow);

    expect(totalsBelow.shipping).toBe(MOCK_SHIPPING_CONFIG.standardRate);
    expect(totalsBelow.total).toBe(subtotalBelow + MOCK_SHIPPING_CONFIG.standardRate);

    const cartBelow: Cart = {
      items: [
        {
          id: 'item-1',
          productId: 'p1',
          productName: 'Scrunchie',
          image: '/test.jpg',
          selectedOptions: [],
          quantity: 1,
          unitPrice: subtotalBelow,
          lineTotal: subtotalBelow,
          status: 'available',
        },
      ],
      subtotal: totalsBelow.subtotal,
      shipping: totalsBelow.shipping,
      total: totalsBelow.total,
    };

    // Render OrderReviewStep with cartBelow
    const { unmount } = render(
      <OrderReviewStep
        cart={cartBelow}
        deliveryAddress={mockAddress}
        onChangeAddress={vi.fn()}
        onPay={vi.fn()}
      />
    );

    const reviewTotalEl = screen.getByTestId('checkout-total');
    expect(reviewTotalEl).toHaveTextContent(formatCurrency(cartBelow.total));

    const reviewShippingEl = screen.getByTestId('checkout-shipping');
    expect(reviewShippingEl).toHaveTextContent(formatCurrency(totalsBelow.shipping));

    const payButton = screen.getByTestId('checkout-pay-btn');
    expect(payButton).toHaveTextContent(`Pay ${formatCurrency(cartBelow.total)}`);

    // Verify mock checkout creation uses the exact same totals
    vi.spyOn(cartMock, 'getCart').mockResolvedValueOnce(cartBelow);
    const checkoutResult = await createCheckout({ addressId: mockAddress.id });

    expect(checkoutResult.order.totals.subtotal).toBe(cartBelow.subtotal);
    expect(checkoutResult.order.totals.shipping).toBe(cartBelow.shipping);
    expect(checkoutResult.order.totals.total).toBe(cartBelow.total);
    expect(checkoutResult.paymentInfo.amount).toBe(cartBelow.total);

    // Cart total, review total, pay button amount, and created order total are all strictly equal
    expect(cartBelow.total).toBe(checkoutResult.order.totals.total);
    expect(cartBelow.total).toBe(checkoutResult.paymentInfo.amount);

    unmount();
  });

  it('calculates totals identically across above-threshold cart, review, pay button, and created order', async () => {
    // 2. Above threshold (subtotal 1500 >= 1000)
    const subtotalAbove = 1500;
    const totalsAbove = calculateMockTotals(subtotalAbove);

    expect(totalsAbove.shipping).toBe(0);
    expect(totalsAbove.total).toBe(subtotalAbove);

    const cartAbove: Cart = {
      items: [
        {
          id: 'item-2',
          productId: 'p2',
          productName: 'Tote Bag',
          image: '/test2.jpg',
          selectedOptions: [],
          quantity: 1,
          unitPrice: subtotalAbove,
          lineTotal: subtotalAbove,
          status: 'available',
        },
      ],
      subtotal: totalsAbove.subtotal,
      shipping: totalsAbove.shipping,
      total: totalsAbove.total,
    };

    render(
      <OrderReviewStep
        cart={cartAbove}
        deliveryAddress={mockAddress}
        onChangeAddress={vi.fn()}
        onPay={vi.fn()}
      />
    );

    const reviewTotalEl = screen.getByTestId('checkout-total');
    expect(reviewTotalEl).toHaveTextContent(formatCurrency(cartAbove.total));

    const reviewShippingEl = screen.getByTestId('checkout-shipping');
    expect(reviewShippingEl).toHaveTextContent('₹0');

    const payButton = screen.getByTestId('checkout-pay-btn');
    expect(payButton).toHaveTextContent(`Pay ${formatCurrency(cartAbove.total)}`);

    // Verify mock checkout creation
    vi.spyOn(cartMock, 'getCart').mockResolvedValueOnce(cartAbove);
    const checkoutResult = await createCheckout({ addressId: mockAddress.id });

    expect(checkoutResult.order.totals.subtotal).toBe(cartAbove.subtotal);
    expect(checkoutResult.order.totals.shipping).toBe(0);
    expect(checkoutResult.order.totals.total).toBe(cartAbove.total);
    expect(checkoutResult.paymentInfo.amount).toBe(cartAbove.total);

    // Cart total, review total, pay button amount, and created order total are all strictly equal
    expect(cartAbove.total).toBe(checkoutResult.order.totals.total);
    expect(cartAbove.total).toBe(checkoutResult.paymentInfo.amount);
  });
});
