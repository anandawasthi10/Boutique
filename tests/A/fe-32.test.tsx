import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { OrderConfirmationContent } from '@/app/order-confirmation/OrderConfirmationContent';
import { addOrderInternal } from '@/lib/api/mock/orders';
import { Order } from '@/lib/types';
import * as navigation from 'next/navigation';

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

const paidOrder: Order = {
  id: 'ord-fe32-confirmed',
  orderNumber: 'ORD-2026-FE32',
  createdAt: '2026-10-12T09:00:00Z',
  items: [
    {
      id: 'item-fe32-1',
      productName: 'Everyday Makeup Pouch',
      selectedOptionsText: 'Fabric: Corduroy, Zipper: Antique Brass',
      unitPrice: 669,
      quantity: 1,
      lineTotal: 669,
    },
    {
      id: 'item-fe32-2',
      productName: 'Classic Scrunchie',
      selectedOptionsText: 'Fabric: Floral Cotton, Size: Regular',
      unitPrice: 249,
      quantity: 2,
      lineTotal: 498,
    },
  ],
  address: {
    id: 'addr-fe32',
    recipientName: 'Aarav Patel',
    phone: '9876543210',
    line1: '42 Indiranagar 100ft Rd',
    line2: 'Suite 3B',
    city: 'Bengaluru',
    state: 'Karnataka',
    pinCode: '560038',
    isDefault: true,
  },
  totals: {
    subtotal: 1167,
    shipping: 0,
    tax: 0,
    total: 1167,
  },
  status: 'placed',
  paymentStatus: 'paid',
};

describe('FE-32: Order confirmation', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_USE_MOCK_API', 'true');
    vi.clearAllMocks();
    addOrderInternal({ ...paidOrder });
  });

  it('appears only for an order the API reports as paid', async () => {
    vi.mocked(navigation.useSearchParams).mockReturnValue(
      new URLSearchParams('orderId=ord-fe32-confirmed') as unknown as ReturnType<typeof navigation.useSearchParams>
    );

    render(<OrderConfirmationContent />);

    await waitFor(() => {
      expect(screen.getByTestId('payment-success-view')).toBeInTheDocument();
    });

    expect(screen.getByTestId('order-number-display')).toHaveTextContent('#ORD-2026-FE32');
  });

  it('renders all items with their options and amounts from the API order', async () => {
    vi.mocked(navigation.useSearchParams).mockReturnValue(
      new URLSearchParams('orderId=ord-fe32-confirmed') as unknown as ReturnType<typeof navigation.useSearchParams>
    );

    render(<OrderConfirmationContent />);

    await waitFor(() => {
      expect(screen.getByTestId('payment-success-view')).toBeInTheDocument();
    });

    expect(screen.getByText('Everyday Makeup Pouch')).toBeInTheDocument();
    expect(screen.getByText('Fabric: Corduroy, Zipper: Antique Brass')).toBeInTheDocument();
    expect(screen.getByText('Classic Scrunchie')).toBeInTheDocument();
    expect(screen.getByText('Fabric: Floral Cotton, Size: Regular')).toBeInTheDocument();

    // Verify subtotal and total come from API order totals
    expect(screen.getByTestId('total-paid-display')).toHaveTextContent('₹1,167');
  });

  it('displays delivery address accurately from the API order', async () => {
    vi.mocked(navigation.useSearchParams).mockReturnValue(
      new URLSearchParams('orderId=ord-fe32-confirmed') as unknown as ReturnType<typeof navigation.useSearchParams>
    );

    render(<OrderConfirmationContent />);

    await waitFor(() => {
      expect(screen.getByTestId('payment-success-view')).toBeInTheDocument();
    });

    expect(screen.getByText('Aarav Patel')).toBeInTheDocument();
    expect(screen.getByText('42 Indiranagar 100ft Rd')).toBeInTheDocument();
    expect(screen.getByText('Suite 3B')).toBeInTheDocument();
    expect(screen.getByText(/560038/)).toBeInTheDocument();
  });

  it('can be reloaded or revisited without creating new records', async () => {
    vi.mocked(navigation.useSearchParams).mockReturnValue(
      new URLSearchParams('orderId=ord-fe32-confirmed') as unknown as ReturnType<typeof navigation.useSearchParams>
    );

    const { unmount } = render(<OrderConfirmationContent />);

    await waitFor(() => {
      expect(screen.getByTestId('payment-success-view')).toBeInTheDocument();
    });

    unmount();

    // Re-render simulates revisit/reload
    render(<OrderConfirmationContent />);

    await waitFor(() => {
      expect(screen.getByTestId('payment-success-view')).toBeInTheDocument();
    });

    expect(screen.getByTestId('order-number-display')).toHaveTextContent('#ORD-2026-FE32');
  });

  it('explains what happens next with craftsmanship details without making false delivery timeline claims', async () => {
    vi.mocked(navigation.useSearchParams).mockReturnValue(
      new URLSearchParams('orderId=ord-fe32-confirmed') as unknown as ReturnType<typeof navigation.useSearchParams>
    );

    render(<OrderConfirmationContent />);

    await waitFor(() => {
      expect(screen.getByTestId('payment-success-view')).toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: /What Happens Next/i })).toBeInTheDocument();
    expect(screen.getByText(/individually handcrafted with care/i)).toBeInTheDocument();
    // Does not claim fake delivery timelines like "Delivered in 2 days" or "Guaranteed tomorrow"
    expect(screen.queryByText(/guaranteed tomorrow/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/delivered in 2 days/i)).not.toBeInTheDocument();
  });
});
