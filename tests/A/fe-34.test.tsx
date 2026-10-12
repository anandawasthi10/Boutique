import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { OrderDetailContent } from '@/app/account/orders/[id]/OrderDetailContent';
import { addOrderInternal, ordersStore } from '@/lib/api/mock/orders';
import { setMockCurrentUser } from '@/lib/api/mock/auth';
import { Order, User } from '@/lib/types';
import { AuthProvider } from '@/lib/hooks/useAuth';
import * as navigation from 'next/navigation';

vi.mock('next/navigation', () => {
  const notFoundMock = vi.fn();
  return {
    usePathname: () => '/account/orders/ord-fe34-1',
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
    notFound: notFoundMock,
  };
});

const mockUser: User = {
  id: 'usr-fe34',
  name: 'Priya Sharma',
  email: 'priya@example.com',
  createdAt: '2026-01-01T00:00:00Z',
};

const sampleOrder: Order = {
  id: 'ord-fe34-1',
  orderNumber: 'ORD-2026-FE34',
  createdAt: '2026-10-12T10:00:00Z',
  items: [
    {
      id: 'item-341',
      productName: 'Everyday Makeup Pouch',
      selectedOptionsText: 'Fabric: Corduroy, Zipper: Antique Brass',
      unitPrice: 669,
      quantity: 1,
      lineTotal: 669,
    },
  ],
  address: {
    id: 'addr-34',
    recipientName: 'Priya Sharma',
    phone: '9876543210',
    line1: '123 Market St',
    line2: 'Apartment 4B',
    city: 'Bengaluru',
    state: 'Karnataka',
    pinCode: '560001',
    isDefault: true,
  },
  totals: {
    subtotal: 669,
    shipping: 0,
    total: 669,
  },
  status: 'in_production',
  paymentStatus: 'paid',
  userId: 'usr-fe34',
};

const pendingPaymentOrder: Order = {
  ...sampleOrder,
  id: 'ord-fe34-pending',
  orderNumber: 'ORD-PEND-FE34',
  paymentStatus: 'pending',
};

const failedPaymentOrder: Order = {
  ...sampleOrder,
  id: 'ord-fe34-failed',
  orderNumber: 'ORD-FAIL-FE34',
  status: 'cancelled',
  paymentStatus: 'failed',
};

describe('FE-34: Order details and status', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_USE_MOCK_API', 'true');
    vi.clearAllMocks();
    setMockCurrentUser(mockUser);
    ordersStore.length = 0;
    addOrderInternal({ ...sampleOrder });
    addOrderInternal({ ...pendingPaymentOrder });
    addOrderInternal({ ...failedPaymentOrder });
  });

  it('renders order details, items with options, address, and totals from API', async () => {
    render(
      <AuthProvider>
        <OrderDetailContent orderId="ord-fe34-1" />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('order-detail-view')).toBeInTheDocument();
    });

    // Order number and items
    expect(screen.getByText('Everyday Makeup Pouch')).toBeInTheDocument();
    expect(screen.getByText('Fabric: Corduroy, Zipper: Antique Brass')).toBeInTheDocument();

    // Delivery address
    expect(screen.getAllByText('Priya Sharma').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('123 Market St')).toBeInTheDocument();
    expect(screen.getByText('Apartment 4B')).toBeInTheDocument();

    // Totals
    expect(screen.getByTestId('detail-total-amount')).toHaveTextContent('₹669');

    // Status badges
    expect(screen.getByTestId('detail-order-status-badge')).toHaveTextContent('In Production');
    expect(screen.getByTestId('detail-payment-status-badge')).toHaveTextContent('Paid');
  });

  it('renders accessible status timeline with screen reader indications', async () => {
    render(
      <AuthProvider>
        <OrderDetailContent orderId="ord-fe34-1" />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('order-detail-view')).toBeInTheDocument();
    });

    const timeline = screen.getByTestId('order-timeline');
    expect(timeline).toBeInTheDocument();

    // "In Production" is active step (current)
    const currentStep = screen.getByRole('listitem', { current: 'step' });
    expect(currentStep).toHaveTextContent(/In Production/i);
    expect(currentStep).toHaveTextContent(/\(Current step\)/i);
  });

  it('explains next step when payment is pending with refresh option', async () => {
    render(
      <AuthProvider>
        <OrderDetailContent orderId="ord-fe34-pending" />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('pending-payment-notice')).toBeInTheDocument();
    });

    expect(screen.getByText(/Payment Under Verification/i)).toBeInTheDocument();
    expect(screen.getByTestId('detail-refresh-status-btn')).toBeInTheDocument();
  });

  it('explains next step when payment failed with retry checkout action', async () => {
    render(
      <AuthProvider>
        <OrderDetailContent orderId="ord-fe34-failed" />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('failed-payment-notice')).toBeInTheDocument();
    });

    expect(screen.getByText(/Payment Was Not Completed/i)).toBeInTheDocument();
    const retryBtn = screen.getByTestId('detail-retry-payment-btn');
    expect(retryBtn.closest('a')).toHaveAttribute('href', '/checkout');
  });

  it('triggers notFound when order does not exist or belongs to another customer', async () => {
    render(
      <AuthProvider>
        <OrderDetailContent orderId="ord-other-user" />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(navigation.notFound).toHaveBeenCalled();
    });
  });
});
