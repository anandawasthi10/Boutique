import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { CheckoutContent } from '@/app/checkout/CheckoutContent';
import CheckoutPage from '@/app/checkout/page';
import { AuthProvider } from '@/lib/hooks/useAuth';
import { CartProvider } from '@/lib/hooks/useCart';
import { addressesApi, checkoutApi, ApiException } from '@/lib/api';
import { Address, Cart, User, CheckoutResponse } from '@/lib/types';

const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: vi.fn(),
  }),
  usePathname: () => '/checkout',
  useSearchParams: () => new URLSearchParams(),
}));

const mockUser: User = {
  id: 'usr-1',
  name: 'Ananya Roy',
  email: 'ananya@example.com',
};

const mockAddress: Address = {
  id: 'addr-1',
  recipientName: 'Ananya Roy',
  phone: '9876543210',
  line1: 'Flat 401, Rosewood Manor',
  city: 'Bengaluru',
  state: 'Karnataka',
  pinCode: '560001',
  isDefault: true,
};

const mockSecondAddress: Address = {
  id: 'addr-2',
  recipientName: 'Vikram Roy',
  phone: '9812345678',
  line1: 'House 12, Indiranagar',
  city: 'Bengaluru',
  state: 'Karnataka',
  pinCode: '560038',
  isDefault: false,
};

const mockCart: Cart = {
  items: [
    {
      id: 'cart-item-1',
      productId: 'prod-scrunchie',
      productName: 'Silk Scrunchie',
      image: '/images/products/scrunchie.jpg',
      selectedOptions: [
        {
          groupId: 'grp-fabric',
          groupLabel: 'Fabric',
          optionId: 'opt-silk',
          optionLabel: 'Mulberry Silk',
        },
      ],
      quantity: 2,
      unitPrice: 500,
      lineTotal: 1000,
      status: 'available',
    },
  ],
  subtotal: 1000,
  total: 1000,
  notices: [],
};

describe('FE-29: Checkout flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Access Control', () => {
    it('sends signed-out visitors to login preserving checkout return destination', async () => {
      render(
        <AuthProvider initialUser={null}>
          <CartProvider initialCart={mockCart}>
            <CheckoutPage />
          </CartProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/login?returnTo=%2Fcheckout');
      });
    });
  });

  describe('Address Selection and Shared Form', () => {
    it('allows selecting a saved address and continuing to order review', async () => {
      vi.spyOn(addressesApi, 'getAddresses').mockResolvedValue([
        mockAddress,
        mockSecondAddress,
      ]);

      render(
        <AuthProvider initialUser={mockUser}>
          <CartProvider initialCart={mockCart}>
            <CheckoutContent />
          </CartProvider>
        </AuthProvider>
      );

      // 1. Wait for addresses to load
      await waitFor(() => {
        expect(screen.getByText('Ananya Roy')).toBeInTheDocument();
      });

      expect(screen.getByText('Vikram Roy')).toBeInTheDocument();

      // 2. Click second address radio
      const secondAddressOption = screen.getByLabelText(/Vikram Roy/i);
      fireEvent.click(secondAddressOption);

      // 3. Continue to review
      const continueBtn = screen.getByTestId('continue-to-review-btn');
      fireEvent.click(continueBtn);

      // 4. In review step, Vikram Roy is displayed as delivery destination
      expect(screen.getByText('Order Summary')).toBeInTheDocument();
      expect(screen.getByText('House 12, Indiranagar')).toBeInTheDocument();
    });

    it('allows adding a new address with the shared AddressForm component and auto-selects it', async () => {
      vi.spyOn(addressesApi, 'getAddresses').mockResolvedValue([mockAddress]);
      const addSpy = vi.spyOn(addressesApi, 'addAddress').mockResolvedValue({
        id: 'addr-new-3',
        recipientName: 'Kavita Joshi',
        phone: '9876543210',
        line1: 'B-104, Sunrise Apartments',
        city: 'Mumbai',
        state: 'Maharashtra',
        pinCode: '400001',
        isDefault: false,
      });

      render(
        <AuthProvider initialUser={mockUser}>
          <CartProvider initialCart={mockCart}>
            <CheckoutContent />
          </CartProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('checkout-add-address-btn')).toBeInTheDocument();
      });

      // Open add address modal
      fireEvent.click(screen.getByTestId('checkout-add-address-btn'));
      expect(screen.getByText('Add Delivery Address')).toBeInTheDocument();

      // Fill in address form
      fireEvent.change(screen.getByLabelText(/Full Name \/ Recipient/i), {
        target: { value: 'Kavita Joshi' },
      });
      fireEvent.change(screen.getByLabelText(/^Phone Number/i), {
        target: { value: '9876543210' },
      });
      fireEvent.change(screen.getByLabelText(/Line 1/i), {
        target: { value: 'B-104, Sunrise Apartments' },
      });
      fireEvent.change(screen.getByLabelText(/City \/ Town/i), {
        target: { value: 'Mumbai' },
      });
      fireEvent.change(screen.getByLabelText(/State/i), {
        target: { value: 'Maharashtra' },
      });
      fireEvent.change(screen.getByLabelText(/6-Digit PIN Code/i), {
        target: { value: '400001' },
      });

      // Submit
      fireEvent.click(screen.getByTestId('address-submit-btn'));

      await waitFor(() => {
        expect(addSpy).toHaveBeenCalled();
        expect(screen.getByText('Kavita Joshi')).toBeInTheDocument();
      });
    });
  });

  describe('Order Review, Pricing, and Payment Handoff', () => {
    it('lists items with options and totals from API without calculating in frontend', async () => {
      vi.spyOn(addressesApi, 'getAddresses').mockResolvedValue([mockAddress]);

      render(
        <AuthProvider initialUser={mockUser}>
          <CartProvider initialCart={mockCart}>
            <CheckoutContent />
          </CartProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('continue-to-review-btn')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('continue-to-review-btn'));

      // Check item details
      expect(screen.getByText('Silk Scrunchie')).toBeInTheDocument();
      expect(screen.getByText('Fabric: Mulberry Silk')).toBeInTheDocument();
      expect(screen.getByText('Qty: 2')).toBeInTheDocument();

      // Check totals from API
      expect(screen.getByTestId('checkout-subtotal')).toHaveTextContent(/1,000/);
      expect(screen.getByTestId('checkout-total')).toHaveTextContent(/1,000/);
    });

    it('blocks checkout and disables Pay button when an item is unavailable or has price notices', async () => {
      const cartWithNotice: Cart = {
        ...mockCart,
        items: [
          {
            ...mockCart.items[0],
            status: 'unavailable',
            notice: 'This fabric is out of stock',
          },
        ],
        notices: ['Silk Scrunchie is currently unavailable.'],
      };

      vi.spyOn(addressesApi, 'getAddresses').mockResolvedValue([mockAddress]);

      render(
        <AuthProvider initialUser={mockUser}>
          <CartProvider initialCart={cartWithNotice}>
            <CheckoutContent />
          </CartProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('continue-to-review-btn')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('continue-to-review-btn'));

      expect(screen.getByTestId('checkout-blocking-notice')).toBeInTheDocument();
      expect(screen.getByTestId('checkout-pay-btn')).toBeDisabled();
    });

    it('pay button shows loading and prevents double submission', async () => {
      vi.spyOn(addressesApi, 'getAddresses').mockResolvedValue([mockAddress]);

      let resolvePromise: (val: CheckoutResponse) => void;
      const promise = new Promise<CheckoutResponse>((resolve) => {
        resolvePromise = resolve;
      });

      const checkoutSpy = vi
        .spyOn(checkoutApi, 'createCheckout')
        .mockReturnValue(promise);

      render(
        <AuthProvider initialUser={mockUser}>
          <CartProvider initialCart={mockCart}>
            <CheckoutContent />
          </CartProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('continue-to-review-btn')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('continue-to-review-btn'));

      const payBtn = screen.getByTestId('checkout-pay-btn');
      fireEvent.click(payBtn);

      expect(payBtn).toBeDisabled();
      fireEvent.click(payBtn);

      expect(checkoutSpy).toHaveBeenCalledTimes(1);

      // Resolve
      resolvePromise!({
        order: {
          id: 'ord-12345',
          orderNumber: 'ORD-12345',
          createdAt: new Date().toISOString(),
          items: [],
          address: mockAddress,
          totals: { subtotal: 1000, shipping: 0, total: 1000 },
          status: 'placed',
          paymentStatus: 'paid',
        },
        paymentInfo: {
          gateway: 'mock',
          amount: 1000,
          currency: 'INR',
        },
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/order-confirmation?orderId=ord-12345');
      });
    });

    it('keeps the cart and shows retry option when starting checkout fails', async () => {
      vi.spyOn(addressesApi, 'getAddresses').mockResolvedValue([mockAddress]);
      vi.spyOn(checkoutApi, 'createCheckout').mockRejectedValue(
        new ApiException({
          code: 'PAYMENT_INITIATION_FAILED',
          message: 'Unable to initiate payment session with provider.',
        })
      );

      render(
        <AuthProvider initialUser={mockUser}>
          <CartProvider initialCart={mockCart}>
            <CheckoutContent />
          </CartProvider>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('continue-to-review-btn')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('continue-to-review-btn'));

      const payBtn = screen.getByTestId('checkout-pay-btn');
      fireEvent.click(payBtn);

      await waitFor(() => {
        expect(screen.getByTestId('checkout-error-banner')).toBeInTheDocument();
      });

      // Cart items remain displayed (cart was not cleared)
      expect(screen.getByText('Silk Scrunchie')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^Retry$/i })).toBeInTheDocument();
    });
  });
});
