import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { productsApi, cartApi, authApi, addressesApi, checkoutApi, ordersApi } from '@/lib/api';
import { startPayment, setMockPaymentOutcome, PaymentOutcomeTrigger } from '@/lib/payment';

describe('FE-40: Frontend test suite - Full End-to-End Customer Journey', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_USE_MOCK_API', 'true');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('checks the detailed result of every step across the customer purchase journey', async () => {
    // -------------------------------------------------------------------------
    // Step 1: Browse Product Catalogue & Validate Pagination / Filtering
    // -------------------------------------------------------------------------
    const catalogue = await productsApi.getProducts({ page: 1, pageSize: 6 });
    expect(catalogue).toBeDefined();
    expect(catalogue.items.length).toBeGreaterThan(0);
    expect(catalogue.page).toBe(1);
    expect(catalogue.pageSize).toBe(6);
    expect(catalogue.total).toBeGreaterThanOrEqual(catalogue.items.length);
    expect(catalogue.totalPages).toBeGreaterThanOrEqual(1);

    const chosenSummary = catalogue.items[0];
    expect(chosenSummary.id).toBeTruthy();
    expect(chosenSummary.slug).toBeTruthy();
    expect(chosenSummary.name).toBeTruthy();
    expect(chosenSummary.basePrice).toBeGreaterThan(0);

    // -------------------------------------------------------------------------
    // Step 2: Load Detailed Product Configuration & Option Groups
    // -------------------------------------------------------------------------
    const product = await productsApi.getProductBySlug(chosenSummary.slug);
    expect(product.id).toBe(chosenSummary.id);
    expect(product.slug).toBe(chosenSummary.slug);
    expect(product.optionGroups).toBeDefined();
    expect(product.optionGroups.length).toBeGreaterThan(0);

    // Verify option groups structure and default options
    product.optionGroups.forEach((grp) => {
      expect(grp.id).toBeTruthy();
      expect(grp.label).toBeTruthy();
      expect(grp.options.length).toBeGreaterThan(0);
      grp.options.forEach((opt) => {
        expect(opt.id).toBeTruthy();
        expect(opt.label).toBeTruthy();
        expect(typeof opt.priceDelta).toBe('number');
      });
    });

    // -------------------------------------------------------------------------
    // Step 3: Configure Accessory & Fetch Server Price Quote
    // -------------------------------------------------------------------------
    const selectedOptionIds = product.optionGroups.map(
      (grp) => grp.defaultOptionId || grp.options[0].id
    );

    // Calculate expected price delta sum
    let expectedDeltaSum = 0;
    product.optionGroups.forEach((grp) => {
      const selected = grp.options.find((opt) => selectedOptionIds.includes(opt.id));
      if (selected) {
        expectedDeltaSum += selected.priceDelta;
      }
    });

    const quote = await productsApi.getPriceQuote(product.id, { selectedOptionIds });
    expect(quote.valid).toBe(true);
    expect(quote.total).toBe(product.basePrice + expectedDeltaSum);
    expect(quote.lines).toBeDefined();
    expect(quote.lines.length).toBeGreaterThanOrEqual(1);
    expect(quote.lines[0].label).toBe('Base Price');
    expect(quote.lines[0].amount).toBe(product.basePrice);

    // -------------------------------------------------------------------------
    // Step 4: Add to Cart, Verify Totals, and Edit Quantity
    // -------------------------------------------------------------------------
    const initialCart = await cartApi.addToCart({
      productId: product.id,
      selectedOptionIds,
      quantity: 1,
    });

    expect(initialCart.items.length).toBeGreaterThan(0);
    const addedItem = initialCart.items.find((item) => item.productId === product.id);
    expect(addedItem).toBeDefined();
    expect(addedItem!.quantity).toBe(1);
    expect(addedItem!.unitPrice).toBe(quote.total);
    expect(addedItem!.lineTotal).toBe(quote.total * 1);
    expect(initialCart.subtotal).toBeGreaterThanOrEqual(addedItem!.lineTotal);
    expect(initialCart.total).toBe(initialCart.subtotal);

    // Update quantity in cart to 2 and assert recalculation
    const updatedCart = await cartApi.updateCartItem(addedItem!.id, { quantity: 2 });
    const recheckedItem = updatedCart.items.find((item) => item.id === addedItem!.id);
    expect(recheckedItem).toBeDefined();
    expect(recheckedItem!.quantity).toBe(2);
    expect(recheckedItem!.lineTotal).toBe(recheckedItem!.unitPrice * 2);

    // -------------------------------------------------------------------------
    // Step 5: Authenticate Customer (Sign In)
    // -------------------------------------------------------------------------
    const authResult = await authApi.login({
      email: 'customer@example.com',
      password: 'password123',
    });
    expect(authResult.id).toBeTruthy();
    expect(authResult.email).toBe('customer@example.com');
    expect(authResult.name).toBeTruthy();

    const currentUser = await authApi.getCurrentUser();
    expect(currentUser).not.toBeNull();
    expect(currentUser!.email).toBe('customer@example.com');

    // -------------------------------------------------------------------------
    // Step 6: Address Management & Verification
    // -------------------------------------------------------------------------
    const newAddress = await addressesApi.addAddress({
      recipientName: 'Priya Sharma',
      line1: 'Flat 402, Lotus Residency',
      line2: 'Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pinCode: '400050',
      phone: '9876543210',
      isDefault: true,
    });
    expect(newAddress.id).toBeTruthy();
    expect(newAddress.pinCode).toBe('400050');
    expect(newAddress.phone).toBe('9876543210');
    expect(newAddress.city).toBe('Mumbai');

    const addressList = await addressesApi.getAddresses();
    const persisted = addressList.find((a) => a.id === newAddress.id);
    expect(persisted).toBeDefined();
    expect(persisted!.city).toBe('Mumbai');

    // -------------------------------------------------------------------------
    // Step 7: Initiate Checkout with Selected Address
    // -------------------------------------------------------------------------
    const checkoutResult = await checkoutApi.createCheckout({
      addressId: newAddress.id,
    });
    expect(checkoutResult.order).toBeDefined();
    expect(checkoutResult.order.id).toBeTruthy();
    expect(checkoutResult.order.address.pinCode).toBe('400050');
    expect(checkoutResult.order.address.city).toBe('Mumbai');
    expect(checkoutResult.order.totals.total).toBeGreaterThan(0);
    expect(checkoutResult.paymentInfo).toBeDefined();
    expect(checkoutResult.paymentInfo.gatewayOrderId).toBeTruthy();
    expect(checkoutResult.paymentInfo.amount).toBe(checkoutResult.order.totals.total);
    expect(checkoutResult.paymentInfo.currency).toBe('INR');

    // -------------------------------------------------------------------------
    // Step 8: Payment Gateway Handoff & Success Outcome
    // -------------------------------------------------------------------------
    const paymentResult = await startPayment({
      orderId: checkoutResult.order.id,
      amount: checkoutResult.paymentInfo.amount,
      currency: checkoutResult.paymentInfo.currency,
      gatewayOrderId: checkoutResult.paymentInfo.gatewayOrderId,
      keyId: checkoutResult.paymentInfo.keyId,
    });
    expect(paymentResult.status).toBe('paid');
    expect(paymentResult.orderId).toBe(checkoutResult.order.id);

    // -------------------------------------------------------------------------
    // Step 9: Order Retrieval & Status Verification in My Orders
    // -------------------------------------------------------------------------
    const finalOrder = await ordersApi.getOrderById(checkoutResult.order.id);
    expect(finalOrder.id).toBe(checkoutResult.order.id);
    expect(finalOrder.paymentStatus).toBe('paid');
    expect(finalOrder.items.length).toBeGreaterThan(0);
    expect(finalOrder.totals.total).toBe(checkoutResult.paymentInfo.amount);

    const userOrders = await ordersApi.getOrders();
    expect(userOrders.items.length).toBeGreaterThan(0);
    const inOrderList = userOrders.items.find((o) => o.id === finalOrder.id);
    expect(inOrderList).toBeDefined();
    expect(inOrderList!.paymentStatus).toBe('paid');
  });

  it('checks all four payment outcomes through checkout and payment flow', async () => {
    const outcomes: Array<{ simulated: PaymentOutcomeTrigger; expected: string }> = [
      { simulated: 'paid', expected: 'paid' },
      { simulated: 'pending', expected: 'pending' },
      { simulated: 'failed', expected: 'failed' },
      { simulated: 'cancelled', expected: 'cancelled' },
    ];

    const catalogue = await productsApi.getProducts();
    const product = catalogue.items[0];

    for (const testCase of outcomes) {
      // Ensure cart has an item before checkout
      await cartApi.addToCart({
        productId: product.id,
        selectedOptionIds: [],
        quantity: 1,
      });

      const addresses = await addressesApi.getAddresses();
      const checkout = await checkoutApi.createCheckout({
        addressId: addresses[0].id,
      });

      setMockPaymentOutcome(testCase.simulated);

      const outcome = await startPayment({
        orderId: checkout.order.id,
        amount: checkout.paymentInfo.amount,
        currency: checkout.paymentInfo.currency,
        gatewayOrderId: checkout.paymentInfo.gatewayOrderId,
        keyId: checkout.paymentInfo.keyId,
      });

      expect(outcome.status).toBe(testCase.expected);
      const order = await ordersApi.getOrderById(checkout.order.id);
      expect(order.paymentStatus).toBe(testCase.expected);
    }
  });
});
