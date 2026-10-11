import { describe, it, expect } from 'vitest';
import type {
  Product,
  OptionGroup,
  Option,
  PriceQuote,
  Cart,
  CartItem,
  Address,
  Order,
  User,
  ApiError,
  OptionGroupType,
} from '@/lib/types';

describe('FE-05: API TypeScript types', () => {
  it('validates OptionGroupType allows only the four display types', () => {
    const validTypes: OptionGroupType[] = ['swatch', 'colour', 'chips', 'toggle'];
    expect(validTypes).toHaveLength(4);
  });

  it('validates Product, OptionGroup, and Option structures conform to specification', () => {
    const opt: Option = {
      id: 'opt-floral',
      label: 'Floral',
      priceDelta: 0,
      available: true,
      swatchImageUrl: '/swatches/floral.jpg',
    };

    const grp: OptionGroup = {
      id: 'grp-fabric',
      label: 'Fabric',
      type: 'swatch',
      required: true,
      options: [opt],
    };

    const product: Product = {
      id: 'prod-1',
      slug: 'classic-scrunchie',
      name: 'Classic Fabric Scrunchie',
      description: 'Handmade with premium floral cotton.',
      category: { id: 'cat-1', name: 'Scrunchies' },
      basePrice: 299,
      images: [{ url: '/placeholder-1.jpg', alt: 'Classic Scrunchie', order: 1 }],
      optionGroups: [grp],
    };

    expect(product.id).toBe('prod-1');
    expect(product.optionGroups[0].type).toBe('swatch');
  });

  it('validates PriceQuote structure conforms to specification', () => {
    const quote: PriceQuote = {
      valid: true,
      lines: [
        { label: 'Base Price', amount: 299 },
        { label: 'Corduroy Fabric', amount: 50 },
      ],
      total: 349,
    };

    expect(quote.valid).toBe(true);
    expect(quote.total).toBe(349);
  });

  it('validates Cart and CartItem structure conforms to specification', () => {
    const item: CartItem = {
      id: 'cart-item-1',
      productId: 'prod-1',
      productName: 'Classic Scrunchie',
      image: '/placeholder.jpg',
      selectedOptions: [
        {
          groupId: 'grp-fabric',
          groupLabel: 'Fabric',
          optionId: 'opt-corduroy',
          optionLabel: 'Corduroy',
        },
      ],
      quantity: 2,
      unitPrice: 349,
      lineTotal: 698,
      status: 'available',
    };

    const cart: Cart = {
      items: [item],
      subtotal: 698,
      total: 698,
    };

    expect(cart.items).toHaveLength(1);
    expect(cart.total).toBe(698);
  });

  it('validates Address structure with Indian address fields', () => {
    const address: Address = {
      id: 'addr-1',
      recipientName: 'Anvi Sharma',
      phone: '9876543210',
      line1: '12 Rosewood Lane',
      line2: 'Apartment 4B',
      city: 'Bengaluru',
      state: 'Karnataka',
      pinCode: '560001',
      isDefault: true,
    };

    expect(address.pinCode).toBe('560001');
  });

  it('validates Order, User, and ApiError structures', () => {
    const user: User = {
      id: 'usr-1',
      name: 'Anvi Sharma',
      email: 'anvi@example.com',
    };

    const order: Order = {
      id: 'ord-1',
      orderNumber: 'ORD-1001',
      createdAt: '2026-10-12T00:00:00Z',
      items: [
        {
          id: 'item-1',
          productName: 'Classic Scrunchie',
          selectedOptionsText: 'Fabric: Floral (Regular)',
          unitPrice: 299,
          quantity: 1,
          lineTotal: 299,
        },
      ],
      address: {
        id: 'addr-1',
        recipientName: 'Anvi Sharma',
        phone: '9876543210',
        line1: '12 Rosewood Lane',
        city: 'Bengaluru',
        state: 'Karnataka',
        pinCode: '560001',
        isDefault: true,
      },
      totals: {
        subtotal: 299,
        shipping: 50,
        total: 349,
      },
      status: 'confirmed',
      paymentStatus: 'paid',
    };

    const error: ApiError = {
      code: 'VALIDATION_ERROR',
      message: 'Invalid phone number format',
      fieldErrors: { phone: 'Please provide a valid 10-digit number' },
    };

    expect(user.id).toBe('usr-1');
    expect(order.orderNumber).toBe('ORD-1001');
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.fieldErrors?.phone).toBeDefined();
  });
});
