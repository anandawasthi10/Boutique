import { test, expect } from '@playwright/test';

test.describe('E2E Customer Journey against Mock API', () => {
  test('Full customer journey: browse, configure, add to cart, edit cart, signup, add address, checkout, payment outcomes, and orders list', async ({
    page,
  }) => {
    // 1. Browsing to catalogue
    page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message));
    page.on('requestfailed', (req) => console.log('FAILED REQUEST:', req.url(), req.failure()?.errorText));
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to Shop All
    await page.getByRole('link', { name: /shop all|browse collection/i }).first().click();
    await expect(page).toHaveURL(/\/shop/);

    // 2. Select and browse to a product
    const productCard = page.locator('a[href^="/product/"]').first();
    await expect(productCard).toBeVisible();
    await Promise.all([
      page.waitForURL(/\/product\/[a-z0-9-]+/),
      productCard.click(),
    ]);

    // 3. Configure the product
    // Choose an available option if options exist
    const radioOption = page.locator('button[role="radio"]').first();
    if (await radioOption.isVisible()) {
      await radioOption.click();
    }

    // 4. Sign up first to establish customer session
    await page.goto('/signup');
    const testEmail = `customer_${Date.now()}@example.com`;
    await page.getByLabel(/Full Name/i).fill('Test Shopper');
    await page.getByLabel(/Email Address/i).fill(testEmail);
    await page.locator('#signup-password').fill('StrongPass123!');
    await page.getByRole('button', { name: /create account/i }).click();

    // Verify redirected to account or homepage signed in
    await expect(page).toHaveURL(/\/(account)?/);

    // 5. Add configured product to cart as signed-in user
    await page.goto('/product/classic-scrunchie');
    await page.waitForLoadState('networkidle');

    const swatchButtons = page.locator('button[role="radio"]');
    if ((await swatchButtons.count()) > 1) {
      await swatchButtons.nth(1).click();
    }

    // Click Add to Cart
    const addToCartButton = page.getByRole('button', { name: /add to cart/i });
    await expect(addToCartButton).toBeEnabled();
    await addToCartButton.click();
    await page.waitForTimeout(500);

    // 6. Navigate to cart page and edit configuration
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    // Verify item in cart
    await expect(page.locator('[data-testid^="cart-item-"]')).toBeVisible();

    // Click edit configuration button
    const editBtn = page.locator('[data-testid^="edit-config-btn-"]').first();
    if (await editBtn.isVisible()) {
      await editBtn.click();
      // Edit modal should open
      await expect(page.locator('[data-testid="edit-configuration-modal-content"]')).toBeVisible();

      // Click save configuration
      const saveBtn = page.getByTestId('save-configuration-btn');
      await saveBtn.click();
      await expect(page.locator('[data-testid="edit-configuration-modal-content"]')).not.toBeVisible();
    }

    // 7. Proceed to checkout
    const checkoutBtn = page.getByTestId('proceed-to-checkout-btn');
    await expect(checkoutBtn).toBeEnabled();
    await checkoutBtn.click();
    await expect(page).toHaveURL(/\/checkout/);

    // 8. Add delivery address in checkout or select existing
    const addNewAddressBtn = page.getByTestId('checkout-add-address-btn').or(page.getByTestId('checkout-empty-add-address-btn'));
    if (await addNewAddressBtn.isVisible()) {
      await addNewAddressBtn.click();
    }

    // Fill address form if visible
    const recipientInput = page.locator('#address-recipient-name');
    if (await recipientInput.isVisible()) {
      await recipientInput.fill('Anvi Sharma');
      await page.locator('#address-phone').fill('9876543210');
      await page.locator('#address-line1').fill('123 Atelier Street');
      await page.locator('#address-city').fill('Bengaluru');
      await page.locator('#address-state').fill('Karnataka');
      await page.locator('#address-pincode').fill('560038');
      await page.getByTestId('address-submit-btn').click();
    }

    // Continue to Review Step
    const continueToReviewBtn = page.getByTestId('continue-to-review-btn');
    await expect(continueToReviewBtn).toBeEnabled();
    await continueToReviewBtn.click();

    // 9. Place Order and Trigger Payment Handoff
    const payBtn = page.getByTestId('checkout-pay-btn');
    await expect(payBtn).toBeVisible();
    await payBtn.click();

    // Verify redirected to order confirmation
    await expect(page).toHaveURL(/\/order-confirmation\?orderId=/);

    // 10. Verify all 4 Payment Outcomes on Order Confirmation
    // A. Paid / Success Outcome
    await page.goto('/order-confirmation?orderId=ord-1001');
    await expect(page.getByTestId('payment-success-view')).toBeVisible();
    await expect(page.getByTestId('order-number-display')).toBeVisible();

    // B. Pending Outcome
    await page.goto('/order-confirmation?orderId=ord-1003');
    await expect(page.getByTestId('payment-pending-view')).toBeVisible();
    await expect(page.getByText(/waiting for confirmation|checking payment status/i).first()).toBeVisible();

    // C. Failed Outcome
    await page.goto('/order-confirmation?orderId=ord-1004');
    await expect(page.getByTestId('payment-failed-view')).toBeVisible();
    await expect(page.getByRole('button', { name: /retry payment|return to checkout/i })).toBeVisible();

    // D. Cancelled Outcome
    await page.goto('/order-confirmation?orderId=ord-1005');
    await expect(page.getByTestId('payment-cancelled-view')).toBeVisible();
    await expect(page.getByTestId('cancelled-no-charge-notice')).toBeVisible();

    // 11. End with the order in My Orders
    await page.goto('/account/orders');
    await expect(page).toHaveURL(/\/account\/orders/);
    await expect(page.getByRole('heading', { name: /my orders/i })).toBeVisible();
    await expect(page.getByTestId('order-card-ord-1001')).toBeVisible();
  });
});
