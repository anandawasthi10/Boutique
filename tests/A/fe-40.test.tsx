import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { productsApi, cartApi, authApi, addressesApi, checkoutApi, ordersApi } from '@/lib/api';
import { startPayment } from '@/lib/payment';

describe('FE-40: Frontend test suite - Full End-to-End Customer Journey', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_USE_MOCK_API', 'true');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('executes the full customer purchase journey end-to-end against the mock adapter', async () => {
    // 1. Browsing Catalogue
    const catalogue = await productsApi.getProducts({ page: 1, pageSize: 12 });
    expect(catalogue.items.length).toBeGreaterThan(0);
    const chosenSummary = catalogue.items[0];
    expect(chosenSummary.slug).toBeDefined();

    // 2. Load Detailed Product Shell & Option Groups
    const fullProduct = await productsApi.getProductBySlug(chosenSummary.slug);
    expect(fullProduct.id).toBe(chosenSummary.id);
    expect(fullProduct.optionGroups.length).toBeGreaterThan(0);

    // 3. Configure Options & Request Server-Side Price Quote
    const selectedOptionIds: string[] = fullProduct.optionGroups.map(
      (grp) => grp.defaultOptionId || grp.options[0].id
    );
    const quote = await productsApi.getPriceQuote(fullProduct.id, { selectedOptionIds });
    expect(quote.valid).toBe(true);
    expect(quote.total).toBeGreaterThanOrEqual(fullProduct.basePrice);

    // 4. Add Customised Accessory to Cart
    const updatedCart = await cartApi.addToCart({
      productId: fullProduct.id,
      selectedOptionIds,
      quantity: 1,
    });
    expect(updatedCart.items.length).toBeGreaterThan(0);
    const cartItem = updatedCart.items.find((item) => item.productId === fullProduct.id);
    expect(cartItem).toBeDefined();
    expect(updatedCart.total).toBeGreaterThan(0);

    // 5. Authenticate Customer
    const user = await authApi.login({
      email: 'customer@example.com',
      password: 'password123',
    });
    expect(user.id).toBeDefined();
    expect(user.email).toBe('customer@example.com');

    // 6. Select Shipping Address
    const addresses = await addressesApi.getAddresses();
    expect(addresses.length).toBeGreaterThan(0);
    const shippingAddress = addresses[0];
    expect(shippingAddress.pinCode).toMatch(/^\d{6}$/);

    // 7. Initiate Checkout
    const checkoutResult = await checkoutApi.createCheckout({
      addressId: shippingAddress.id,
    });
    expect(checkoutResult.order).toBeDefined();
    expect(checkoutResult.order.id).toBeDefined();
    expect(checkoutResult.paymentInfo).toBeDefined();
    expect(checkoutResult.paymentInfo.amount).toBe(checkoutResult.order.totals.total);

    // 8. Handoff to Payment Gateway & Execute Payment
    const paymentOutcome = await startPayment({
      orderId: checkoutResult.order.id,
      amount: checkoutResult.paymentInfo.amount,
      currency: checkoutResult.paymentInfo.currency,
      gatewayOrderId: checkoutResult.paymentInfo.gatewayOrderId,
      keyId: checkoutResult.paymentInfo.keyId,
    });
    expect(paymentOutcome.status).toBe('paid');

    // 9. Order Confirmation & Verification
    const confirmedOrder = await ordersApi.getOrderById(checkoutResult.order.id);
    expect(confirmedOrder.id).toBe(checkoutResult.order.id);
    expect(confirmedOrder.paymentStatus).toBe('paid');
    expect(confirmedOrder.items.length).toBeGreaterThan(0);
    expect(confirmedOrder.totals.total).toBe(checkoutResult.paymentInfo.amount);
  });
});
