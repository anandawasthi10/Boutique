import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  productsApi,
  categoriesApi,
  cartApi,
  authApi,
  addressesApi,
  ordersApi,
  ApiException,
} from '@/lib/api';

describe('FE-07: Mock API adapter', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_USE_MOCK_API', 'true');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('loads categories and products without a backend when flag is on', async () => {
    const categories = await categoriesApi.getCategories();
    expect(categories.length).toBeGreaterThanOrEqual(3);

    const products = await productsApi.getProducts();
    expect(products.items.length).toBe(4);
    expect(products.total).toBe(4);
  });

  it('covers 4 products with distinct option structures in mock catalog', async () => {
    // 1. Fabric and size only
    const scrunchie = await productsApi.getProductBySlug('classic-scrunchie');
    expect(scrunchie.optionGroups.map((g) => g.type)).toEqual(['swatch', 'chips']);

    // 2. Fabric, size, and zipper colour
    const pouch = await productsApi.getProductBySlug('makeup-pouch');
    expect(pouch.optionGroups.map((g) => g.type)).toEqual(['swatch', 'chips', 'colour']);

    // 3. Fabric and closure
    const eyewear = await productsApi.getProductBySlug('eyewear-sleeve');
    expect(eyewear.optionGroups.map((g) => g.type)).toEqual(['swatch', 'chips']);

    // 4. Product with toggles
    const laptop = await productsApi.getProductBySlug('laptop-sleeve');
    expect(laptop.optionGroups.map((g) => g.type)).toEqual(['swatch', 'chips', 'toggle', 'toggle']);
  });

  it('calculates price quotes dynamically with base price and option deltas', async () => {
    const scrunchie = await productsApi.getProductBySlug('classic-scrunchie');
    // basePrice is 249, Corduroy is +50, Large size is +50 => 349
    const quote = await productsApi.getPriceQuote(scrunchie.id, {
      selectedOptionIds: ['opt-corduroy', 'opt-size-large'],
    });

    expect(quote.valid).toBe(true);
    expect(quote.total).toBe(349);
    expect(quote.lines).toEqual([
      { label: 'Base Price', amount: 249 },
      { label: 'Fabric Choice: Corduroy', amount: 50 },
      { label: 'Size: Large', amount: 50 },
    ]);
  });

  it('flags quote as invalid when required option group is missing', async () => {
    const scrunchie = await productsApi.getProductBySlug('classic-scrunchie');
    // Missing size selection
    const quote = await productsApi.getPriceQuote(scrunchie.id, {
      selectedOptionIds: ['opt-floral'],
    });

    expect(quote.valid).toBe(false);
    expect(quote.problems).toBeDefined();
    expect(quote.problems?.[0].groupId).toBe('group-size');
  });

  it('persists cart state in memory across add, update, and remove', async () => {
    const initialCart = await cartApi.getCart();
    const initialCount = initialCart.items.length;

    // Add item
    const updatedCart = await cartApi.addToCart({
      productId: 'prod-scrunchie',
      selectedOptionIds: ['opt-floral', 'opt-size-regular'],
      quantity: 2,
    });
    expect(updatedCart.items.length).toBe(initialCount + 1);
    const addedItem = updatedCart.items[updatedCart.items.length - 1];
    expect(addedItem.quantity).toBe(2);
    expect(addedItem.unitPrice).toBe(249);
    expect(addedItem.lineTotal).toBe(498);

    // Update quantity
    const cartAfterQty = await cartApi.updateCartItem(addedItem.id, { quantity: 3 });
    const targetItem = cartAfterQty.items.find((i) => i.id === addedItem.id);
    expect(targetItem?.quantity).toBe(3);
    expect(targetItem?.lineTotal).toBe(747);

    // Remove item
    const cartAfterRemove = await cartApi.removeCartItem(addedItem.id);
    expect(cartAfterRemove.items.find((i) => i.id === addedItem.id)).toBeUndefined();
  });

  it('triggers selectable mock error for product that fails to load', async () => {
    await expect(productsApi.getProductBySlug('error-fail-to-load')).rejects.toThrowError(
      ApiException
    );

    try {
      await productsApi.getProductBySlug('error-fail-to-load');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(ApiException);
      const apiErr = err as ApiException;
      expect(apiErr.code).toBe('PRODUCT_LOAD_FAILED');
    }
  });

  it('exercises mock auth, address, and order operations', async () => {
    const user = await authApi.getCurrentUser();
    expect(user).toBeDefined();

    const addresses = await addressesApi.getAddresses();
    expect(addresses.length).toBeGreaterThan(0);

    const orders = await ordersApi.getOrders();
    expect(orders.items.length).toBeGreaterThan(0);
  });

  it('switches to real client when NEXT_PUBLIC_USE_MOCK_API is false', async () => {
    vi.stubEnv('NEXT_PUBLIC_USE_MOCK_API', 'false');
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        items: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
      }),
    });

    await productsApi.getProducts();
    expect(global.fetch).toHaveBeenCalled();
    global.fetch = originalFetch;
  });
});
