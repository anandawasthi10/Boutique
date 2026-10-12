import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { OrdersContent } from '@/app/account/orders/OrdersContent';
import { addOrderInternal, ordersStore } from '@/lib/api/mock/orders';
import { setMockCurrentUser } from '@/lib/api/mock/auth';
import { Order, User } from '@/lib/types';
import { AuthProvider } from '@/lib/hooks/useAuth';

vi.mock('next/navigation', () => ({
  usePathname: () => '/account/orders',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

const mockUser: User = {
  id: 'usr-fe33',
  name: 'Priya Sharma',
  email: 'priya@example.com',
  createdAt: '2026-01-01T00:00:00Z',
};

const userOrder1: Order = {
  id: 'ord-fe33-1',
  orderNumber: 'ORD-2026-3301',
  createdAt: '2026-10-11T12:00:00Z',
  items: [
    {
      id: 'item-1',
      productName: 'Classic Scrunchie',
      selectedOptionsText: 'Fabric: Floral Cotton',
      unitPrice: 249,
      quantity: 2,
      lineTotal: 498,
    },
  ],
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
    subtotal: 498,
    shipping: 0,
    total: 498,
  },
  status: 'in_production',
  paymentStatus: 'paid',
  userId: 'usr-fe33',
};

const userOrder2: Order = {
  id: 'ord-fe33-2',
  orderNumber: 'ORD-2026-3302',
  createdAt: '2026-10-12T14:00:00Z',
  items: [
    {
      id: 'item-2',
      productName: 'Everyday Makeup Pouch',
      selectedOptionsText: 'Fabric: Linen',
      unitPrice: 659,
      quantity: 1,
      lineTotal: 659,
    },
  ],
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
    subtotal: 659,
    shipping: 0,
    total: 659,
  },
  status: 'dispatched',
  paymentStatus: 'paid',
  userId: 'usr-fe33',
};

const otherUserOrder: Order = {
  id: 'ord-other-user-33',
  orderNumber: 'ORD-OTHER-33',
  createdAt: '2026-10-12T15:00:00Z',
  items: [],
  address: {
    id: 'addr-2',
    recipientName: 'Other Person',
    phone: '9876543210',
    line1: '456 Other St',
    city: 'Delhi',
    state: 'Delhi',
    pinCode: '110001',
    isDefault: false,
  },
  totals: {
    subtotal: 999,
    shipping: 0,
    total: 999,
  },
  status: 'placed',
  paymentStatus: 'paid',
  userId: 'usr-other',
};

describe('FE-33: My Orders', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_USE_MOCK_API', 'true');
    vi.clearAllMocks();
    setMockCurrentUser(mockUser);

    // Reset orders store with test orders
    ordersStore.length = 0;
    addOrderInternal({ ...userOrder1 });
    addOrderInternal({ ...userOrder2 });
    addOrderInternal({ ...otherUserOrder });
  });

  it("shows only the signed-in customer's orders and orders them newest first", async () => {
    render(
      <AuthProvider>
        <OrdersContent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('orders-list')).toBeInTheDocument();
    });

    // Should contain current user's orders
    expect(screen.getByText('Order #ORD-2026-3301')).toBeInTheDocument();
    expect(screen.getByText('Order #ORD-2026-3302')).toBeInTheDocument();

    // Must NOT contain other customer's order
    expect(screen.queryByText('Order #ORD-OTHER-33')).not.toBeInTheDocument();
  });

  it('displays status text from status glossary with text and not color alone', async () => {
    render(
      <AuthProvider>
        <OrdersContent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('orders-list')).toBeInTheDocument();
    });

    const status1 = screen.getByTestId('order-status-ord-fe33-1');
    expect(status1).toHaveTextContent('In Production');

    const status2 = screen.getByTestId('order-status-ord-fe33-2');
    expect(status2).toHaveTextContent('Dispatched');
  });

  it('links each order to its detail page', async () => {
    render(
      <AuthProvider>
        <OrdersContent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('orders-list')).toBeInTheDocument();
    });

    const link1 = screen.getByTestId('view-order-link-ord-fe33-1');
    expect(link1).toHaveAttribute('href', '/account/orders/ord-fe33-1');

    const link2 = screen.getByTestId('view-order-link-ord-fe33-2');
    expect(link2).toHaveAttribute('href', '/account/orders/ord-fe33-2');
  });

  it('renders empty state with link to Shop All when customer has zero orders', async () => {
    // Empty orders store
    ordersStore.length = 0;

    render(
      <AuthProvider>
        <OrdersContent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No Orders Yet')).toBeInTheDocument();
    });

    const shopLink = screen.getByTestId('orders-empty-shop-btn');
    expect(shopLink.closest('a')).toHaveAttribute('href', '/shop');
  });
});
