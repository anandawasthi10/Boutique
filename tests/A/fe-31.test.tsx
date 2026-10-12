import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { OrderConfirmationContent } from '@/app/order-confirmation/OrderConfirmationContent';
import { addOrderInternal, updateOrderStatusInternal } from '@/lib/api/mock/orders';
import { Order } from '@/lib/types';
import * as navigation from 'next/navigation';

// Mock next/navigation
vi.mock('next/navigation', () => {
  const notFoundMock = vi.fn();
  return {
    useSearchParams: vi.fn(),
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    }),
    notFound: notFoundMock,
  };
});

const baseOrder: Order = {
  id: 'ord-test-31',
  orderNumber: 'ORD-2026-3101',
  createdAt: '2026-10-12T10:00:00Z',
  items: [
    {
      id: 'item-311',
      productName: 'Silk Velvet Scrunchie',
      selectedOptionsText: 'Fabric: Dusty Rose, Size: Regular',
      unitPrice: 299,
      quantity: 2,
      lineTotal: 598,
    },
  ],
  address: {
    id: 'addr-31',
    recipientName: 'Priya Sharma',
    phone: '9876543210',
    line1: '123 Market St',
    city: 'Bengaluru',
    state: 'Karnataka',
    pinCode: '560001',
    isDefault: true,
  },
  totals: {
    subtotal: 598,
    shipping: 0,
    total: 598,
  },
  status: 'placed',
  paymentStatus: 'paid',
};

describe('FE-31: Payment result screens', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_USE_MOCK_API', 'true');
    vi.clearAllMocks();
  });

  it('renders paid (success) state with order number, link to order and continue shopping', async () => {
    addOrderInternal({
      ...baseOrder,
      id: 'ord-paid-31',
      orderNumber: 'ORD-PAID-31',
      paymentStatus: 'paid',
    });

    vi.mocked(navigation.useSearchParams).mockReturnValue(
      new URLSearchParams('orderId=ord-paid-31') as unknown as ReturnType<typeof navigation.useSearchParams>
    );

    render(<OrderConfirmationContent />);

    await waitFor(() => {
      expect(screen.getByTestId('payment-success-view')).toBeInTheDocument();
    });

    expect(screen.getByTestId('order-number-display')).toHaveTextContent('#ORD-PAID-31');
    expect(screen.getByTestId('view-order-details-btn')).toBeInTheDocument();
    expect(screen.getByTestId('continue-shopping-btn')).toBeInTheDocument();
  });

  it('renders pending state with waiting message and auto-polls status checks', async () => {
    vi.useFakeTimers();

    addOrderInternal({
      ...baseOrder,
      id: 'ord-pending-31',
      orderNumber: 'ORD-PEND-31',
      paymentStatus: 'pending',
    });

    vi.mocked(navigation.useSearchParams).mockReturnValue(
      new URLSearchParams('orderId=ord-pending-31') as unknown as ReturnType<typeof navigation.useSearchParams>
    );

    render(<OrderConfirmationContent />);

    // Fast-forward initial async fetch
    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });

    expect(screen.getByTestId('payment-pending-view')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Awaiting Payment Confirmation/i })).toBeInTheDocument();
    expect(screen.getByTestId('payment-pending-view')).toHaveTextContent('ORD-PEND-31');

    // Fast forward through poll attempts to reach poll limit
    for (let i = 0; i < 5; i++) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(3000);
      });
    }

    // After poll limit is reached, manual refresh button is displayed
    expect(screen.getByTestId('manual-refresh-button')).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('updates pending view to paid if payment succeeds during polling', async () => {
    vi.useFakeTimers();

    addOrderInternal({
      ...baseOrder,
      id: 'ord-pending-to-paid',
      orderNumber: 'ORD-P2P-31',
      paymentStatus: 'pending',
    });

    vi.mocked(navigation.useSearchParams).mockReturnValue(
      new URLSearchParams('orderId=ord-pending-to-paid') as unknown as ReturnType<typeof navigation.useSearchParams>
    );

    render(<OrderConfirmationContent />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });

    expect(screen.getByTestId('payment-pending-view')).toBeInTheDocument();

    // Simulate backend payment success transition
    updateOrderStatusInternal('ord-pending-to-paid', 'placed', 'paid');

    // Advance timer to trigger next poll
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });

    expect(screen.getByTestId('payment-success-view')).toBeInTheDocument();
    expect(screen.getByTestId('order-number-display')).toHaveTextContent('#ORD-P2P-31');

    vi.useRealTimers();
  });

  it('renders failed payment state with clear error, retry and return to cart options', async () => {
    addOrderInternal({
      ...baseOrder,
      id: 'ord-failed-31',
      orderNumber: 'ORD-FAIL-31',
      paymentStatus: 'failed',
      status: 'cancelled',
    });

    vi.mocked(navigation.useSearchParams).mockReturnValue(
      new URLSearchParams('orderId=ord-failed-31') as unknown as ReturnType<typeof navigation.useSearchParams>
    );

    render(<OrderConfirmationContent />);

    await waitFor(() => {
      expect(screen.getByTestId('payment-failed-view')).toBeInTheDocument();
    });

    expect(screen.getByText(/Payment Could Not Be Processed/i)).toBeInTheDocument();
    expect(screen.getByTestId('retry-payment-button')).toBeInTheDocument();
    expect(screen.getByTestId('return-to-cart-button')).toBeInTheDocument();
  });

  it('renders cancelled payment state and confirms no charges were made', async () => {
    addOrderInternal({
      ...baseOrder,
      id: 'ord-cancelled-31',
      orderNumber: 'ORD-CANC-31',
      paymentStatus: 'cancelled',
      status: 'cancelled',
    });

    vi.mocked(navigation.useSearchParams).mockReturnValue(
      new URLSearchParams('orderId=ord-cancelled-31') as unknown as ReturnType<typeof navigation.useSearchParams>
    );

    render(<OrderConfirmationContent />);

    await waitFor(() => {
      expect(screen.getByTestId('payment-cancelled-view')).toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: /Payment Was Cancelled/i })).toBeInTheDocument();
    expect(screen.getByTestId('cancelled-no-charge-notice')).toHaveTextContent('No charges were made to your account.');
    expect(screen.getByTestId('cancelled-return-cart-btn')).toBeInTheDocument();
  });

  it('triggers notFound when order does not exist or orderId is missing', async () => {
    vi.mocked(navigation.useSearchParams).mockReturnValue(
      new URLSearchParams('') as unknown as ReturnType<typeof navigation.useSearchParams>
    );

    render(<OrderConfirmationContent />);

    await waitFor(() => {
      expect(navigation.notFound).toHaveBeenCalled();
    });
  });

  it('triggers notFound when order belongs to another customer', async () => {
    vi.mocked(navigation.useSearchParams).mockReturnValue(
      new URLSearchParams('orderId=ord-other-user') as unknown as ReturnType<typeof navigation.useSearchParams>
    );

    render(<OrderConfirmationContent />);

    await waitFor(() => {
      expect(navigation.notFound).toHaveBeenCalled();
    });
  });
});
