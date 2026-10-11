import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CartPageContent } from '@/app/cart/CartPageContent';
import { CartProvider } from '@/lib/hooks/useCart';
import { Cart, Product } from '@/lib/types';
import { productsApi, cartApi } from '@/lib/api';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('FE-23: Cart page and edit configuration', () => {
  const mockProduct: Product = {
    id: 'prod-scrunchie',
    slug: 'classic-scrunchie',
    name: 'Classic Scrunchie',
    description: 'A softly gathered fabric scrunchie handcrafted by artisans.',
    category: {
      id: 'cat-scrunchies',
      name: 'Scrunchies',
    },
    basePrice: 249,
    images: [{ url: '/images/placeholders/scrunchie-1.svg', alt: 'Scrunchie', order: 1 }],
    optionGroups: [
      {
        id: 'group-fabric',
        label: 'Fabric Choice',
        type: 'swatch',
        required: true,
        options: [
          {
            id: 'opt-floral',
            label: 'Floral',
            priceDelta: 0,
            available: true,
            swatchImageUrl: '/images/placeholders/fabric-floral.svg',
          },
          {
            id: 'opt-linen',
            label: 'Natural Linen',
            priceDelta: 50,
            available: true,
            swatchImageUrl: '/images/placeholders/fabric-linen.svg',
          },
          {
            id: 'opt-velvet',
            label: 'Silk Velvet',
            priceDelta: 100,
            available: false, // unavailable option to test clearance
            unavailableReason: 'Out of stock for this season',
            swatchImageUrl: '/images/placeholders/fabric-velvet.svg',
          },
        ],
      },
    ],
  };

  const initialCart: Cart = {
    items: [
      {
        id: 'item-1',
        productId: 'prod-scrunchie',
        productSlug: 'classic-scrunchie',
        productName: 'Classic Scrunchie',
        image: '/images/placeholders/scrunchie-1.svg',
        selectedOptions: [
          {
            groupId: 'group-fabric',
            groupLabel: 'Fabric Choice',
            optionId: 'opt-floral',
            optionLabel: 'Floral',
          },
        ],
        quantity: 1,
        unitPrice: 249,
        lineTotal: 249,
        status: 'available',
      },
    ],
    subtotal: 249,
    total: 249,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(productsApi, 'getProductBySlug').mockResolvedValue(mockProduct);
    vi.spyOn(productsApi, 'getPriceQuote').mockImplementation(async (_id, req) => {
      const selectedId = req.selectedOptionIds[0];
      const delta = selectedId === 'opt-linen' ? 50 : 0;
      return {
        valid: true,
        basePrice: 249,
        lines: delta > 0 ? [{ label: 'Natural Linen', amount: delta }] : [],
        total: 249 + delta,
      };
    });
  });

  it('renders cart page with items, order summary, subtotal and total from API', () => {
    render(
      <CartProvider initialCart={initialCart}>
        <CartPageContent />
      </CartProvider>
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Shopping Bag' })).toBeInTheDocument();
    expect(screen.getByText('Classic Scrunchie')).toBeInTheDocument();
    expect(screen.getByTestId('cart-summary-subtotal')).toHaveTextContent('₹249');
    expect(screen.getByTestId('cart-summary-total')).toHaveTextContent('₹249');
    expect(screen.getByTestId('proceed-to-checkout-btn')).toBeEnabled();
  });

  it('renders friendly empty state with link to Shop All when cart has no items', () => {
    const emptyCart: Cart = { items: [], subtotal: 0, total: 0 };
    render(
      <CartProvider initialCart={emptyCart}>
        <CartPageContent />
      </CartProvider>
    );

    expect(screen.getByTestId('cart-page-empty')).toBeInTheDocument();
    expect(screen.getByText('Your shopping bag is empty')).toBeInTheDocument();
    const shopLink = screen.getByRole('link', { name: /Shop All Accessories/i });
    expect(shopLink).toHaveAttribute('href', '/shop');
  });

  it('opens edit configuration pre-filled from the cart item and canceling changes nothing', async () => {
    render(
      <CartProvider initialCart={initialCart}>
        <CartPageContent />
      </CartProvider>
    );

    const editBtn = screen.getByTestId('edit-config-btn-item-1');
    fireEvent.click(editBtn);

    // Expect modal to open and load product configurator
    await waitFor(() => {
      expect(screen.getByTestId('edit-configuration-modal-content')).toBeInTheDocument();
      expect(screen.getByTestId('product-configurator')).toBeInTheDocument();
    });

    // The option 'Floral' was previously selected and should be checked
    const floralRadio = screen.getByRole('radio', { name: /Floral/i });
    expect(floralRadio).toHaveAttribute('aria-checked', 'true');

    // Clicking Cancel closes modal without modifying cart
    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByTestId('product-configurator')).not.toBeInTheDocument();
    });
    expect(screen.getByTestId('cart-summary-total')).toHaveTextContent('₹249');
  });

  it('clears unavailable option if previously chosen option is no longer available and tells customer', async () => {
    const cartWithUnavailableChoice: Cart = {
      items: [
        {
          id: 'item-2',
          productId: 'prod-scrunchie',
          productSlug: 'classic-scrunchie',
          productName: 'Classic Scrunchie',
          image: '/images/placeholders/scrunchie-1.svg',
          selectedOptions: [
            {
              groupId: 'group-fabric',
              groupLabel: 'Fabric Choice',
              optionId: 'opt-velvet', // Silk Velvet is available: false in mockProduct
              optionLabel: 'Silk Velvet',
            },
          ],
          quantity: 1,
          unitPrice: 349,
          lineTotal: 349,
          status: 'available',
        },
      ],
      subtotal: 349,
      total: 349,
    };

    render(
      <CartProvider initialCart={cartWithUnavailableChoice}>
        <CartPageContent />
      </CartProvider>
    );

    const editBtn = screen.getByTestId('edit-config-btn-item-2');
    fireEvent.click(editBtn);

    await waitFor(() => {
      expect(screen.getByTestId('product-configurator')).toBeInTheDocument();
    });

    // Notice should tell customer that Silk Velvet is unavailable and deselected
    await waitFor(() => {
      const notice = screen.getByTestId('unavailable-notice');
      expect(notice).toHaveTextContent(/Silk Velvet is currently unavailable and has been deselected/i);
    });

    // Velvet radio is disabled
    const velvetRadio = screen.getByRole('radio', { name: /Silk Velvet/i });
    expect(velvetRadio).toBeDisabled();
    expect(velvetRadio).toHaveAttribute('aria-checked', 'false');
  });

  it('saving configuration sends new option IDs to API and shows updated price from response', async () => {
    const updatedCart: Cart = {
      items: [
        {
          id: 'item-1',
          productId: 'prod-scrunchie',
          productSlug: 'classic-scrunchie',
          productName: 'Classic Scrunchie',
          image: '/images/placeholders/scrunchie-1.svg',
          selectedOptions: [
            {
              groupId: 'group-fabric',
              groupLabel: 'Fabric Choice',
              optionId: 'opt-linen',
              optionLabel: 'Natural Linen',
            },
          ],
          quantity: 1,
          unitPrice: 299,
          lineTotal: 299,
          status: 'available',
        },
      ],
      subtotal: 299,
      total: 299,
    };

    const updateSpy = vi.spyOn(cartApi, 'updateCartItem').mockResolvedValue(updatedCart);

    render(
      <CartProvider initialCart={initialCart}>
        <CartPageContent />
      </CartProvider>
    );

    fireEvent.click(screen.getByTestId('edit-config-btn-item-1'));

    await waitFor(() => {
      expect(screen.getByTestId('product-configurator')).toBeInTheDocument();
    });

    // Select Natural Linen
    const linenRadio = screen.getByRole('radio', { name: /Natural Linen/i });
    fireEvent.click(linenRadio);

    // Save changes
    const saveBtn = screen.getByTestId('save-configuration-btn');
    await waitFor(() => {
      expect(saveBtn).toBeEnabled();
    });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith('item-1', {
        selectedOptionIds: ['opt-linen'],
      });
      // Modal closes
      expect(screen.queryByTestId('product-configurator')).not.toBeInTheDocument();
      // Price updates from response
      expect(screen.getByTestId('cart-summary-total')).toHaveTextContent('₹299');
    });
  });

  it('blocks proceed to checkout when items have unacknowledged notices or unavailable status', () => {
    const blockingCart: Cart = {
      items: [
        {
          id: 'item-blocked',
          productId: 'prod-scrunchie',
          productName: 'Classic Scrunchie',
          image: '/images/placeholders/scrunchie-1.svg',
          selectedOptions: [],
          quantity: 1,
          unitPrice: 249,
          lineTotal: 249,
          status: 'unavailable',
          notice: 'Fabric out of stock',
        },
      ],
      subtotal: 249,
      total: 249,
    };

    render(
      <CartProvider initialCart={blockingCart}>
        <CartPageContent />
      </CartProvider>
    );

    expect(screen.getByTestId('cart-blocking-notice')).toBeInTheDocument();
    expect(screen.getByTestId('proceed-to-checkout-btn')).toBeDisabled();
  });
});
