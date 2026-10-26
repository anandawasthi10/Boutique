import { test, expect } from '@playwright/test';

test.describe('Offline resilience: mock disabled with no backend running', () => {
  test.beforeEach(async ({ page }) => {
    // Disable mock API on client
    await page.addInitScript(() => {
      (window as unknown as { __DISABLE_MOCK_API__: boolean }).__DISABLE_MOCK_API__ = true;
    });

    // Abort backend API calls to simulate dead backend / offline server
    await page.route('**/products**', (route) => route.abort('connectionrefused'));
    await page.route('**/categories**', (route) => route.abort('connectionrefused'));
  });

  test('Homepage displays friendly error states without crashing or blank screen', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Header and layout remain intact
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();

    // Friendly error alert should be visible
    const alerts = page.getByRole('alert');
    await expect(alerts.first()).toBeVisible();

    // Contains retry CTA
    const retryButtons = page.getByRole('button', { name: /try again/i });
    await expect(retryButtons.first()).toBeVisible();

    // Not a blank body
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.trim().length).toBeGreaterThan(50);
  });

  test('Shop catalogue displays friendly error state and retry option', async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('domcontentloaded');

    // Heading and header intact
    await expect(page.locator('header')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/all accessories/i);

    // Error state in product grid
    const alert = page.getByRole('alert');
    await expect(alert).toBeVisible();

    const retryBtn = page.getByRole('button', { name: /try again/i });
    await expect(retryBtn).toBeVisible();

    // Not a blank page
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.trim().length).toBeGreaterThan(50);
  });

  test('Product detail page displays friendly error state and retry option', async ({ page }) => {
    await page.goto('/product/classic-scrunchie');
    await page.waitForLoadState('domcontentloaded');

    // Layout intact
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();

    // Error state rendered
    const alerts = page.getByRole('alert');
    await expect(alerts.first()).toBeVisible();
    await expect(page.getByText(/could not load product/i)).toBeVisible();

    const retryBtn = page.getByRole('button', { name: /try again/i });
    await expect(retryBtn).toBeVisible();

    // Not a blank page
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.trim().length).toBeGreaterThan(50);
  });
});
