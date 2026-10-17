import { describe, it, expect, beforeEach } from 'vitest';
import { addToCart, getCart } from '@/lib/api/mock/cart';

describe('TASK 10: Cart item merging in mock', () => {
  beforeEach(async () => {
    // Clear localStorage cart
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
    }
    // Re-initialize cart
    const cart = await getCart();
    cart.items.length = 0;
    cart.subtotal = 0;
    cart.shipping = 0;
    cart.total = 0;
  });

  it('merges identical cart items (same product and same options ignoring order)', async () => {
    // 1. Add classic scrunchie with options [opt-floral, opt-size-regular]
    const cartAfterFirst = await addToCart({
      productId: 'prod-scrunchie',
      selectedOptionIds: ['opt-floral', 'opt-size-regular'],
      quantity: 1,
    });

    expect(cartAfterFirst.items).toHaveLength(1);
    const firstItem = cartAfterFirst.items[0];
    expect(firstItem.quantity).toBe(1);
    const unitPrice = firstItem.unitPrice;
    expect(firstItem.lineTotal).toBe(unitPrice * 1);

    // 2. Add same product with same options in exact same order
    const cartAfterSecond = await addToCart({
      productId: 'prod-scrunchie',
      selectedOptionIds: ['opt-floral', 'opt-size-regular'],
      quantity: 2,
    });

    expect(cartAfterSecond.items).toHaveLength(1);
    expect(cartAfterSecond.items[0].id).toBe(firstItem.id);
    expect(cartAfterSecond.items[0].quantity).toBe(3);
    expect(cartAfterSecond.items[0].lineTotal).toBe(unitPrice * 3);

    // 3. Add same product with same options in REVERSED order
    const cartAfterThird = await addToCart({
      productId: 'prod-scrunchie',
      selectedOptionIds: ['opt-size-regular', 'opt-floral'],
      quantity: 1,
    });

    expect(cartAfterThird.items).toHaveLength(1);
    expect(cartAfterThird.items[0].id).toBe(firstItem.id);
    expect(cartAfterThird.items[0].quantity).toBe(4);
    expect(cartAfterThird.items[0].lineTotal).toBe(unitPrice * 4);
  });

  it('creates a separate row when selected options differ', async () => {
    // Add floral regular
    await addToCart({
      productId: 'prod-scrunchie',
      selectedOptionIds: ['opt-floral', 'opt-size-regular'],
      quantity: 1,
    });

    // Add corduroy regular
    const cart = await addToCart({
      productId: 'prod-scrunchie',
      selectedOptionIds: ['opt-corduroy', 'opt-size-regular'],
      quantity: 1,
    });

    expect(cart.items).toHaveLength(2);
    expect(cart.items[0].selectedOptions.some((o) => o.optionId === 'opt-floral')).toBe(true);
    expect(cart.items[1].selectedOptions.some((o) => o.optionId === 'opt-corduroy')).toBe(true);
  });
});
