import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { name: '360x640', width: 360, height: 640 },
  { name: '390x844', width: 390, height: 844 },
  { name: '1366x768', width: 1366, height: 768 },
  { name: '1920x1080', width: 1920, height: 1080 },
];

const ROUTES = ['/', '/shop', '/cart', '/product/bow-scrunchie'];

test.describe('PART 3: Storefront Console Errors & Regressions', () => {
  for (const vp of VIEWPORTS) {
    test(`guest has zero 401, zero 404, and zero console errors at ${vp.name}`, async ({ page }) => {
      test.setTimeout(75000);
      await page.setViewportSize({ width: vp.width, height: vp.height });

      const consoleErrors: string[] = [];
      const responses401: string[] = [];
      const responses404: string[] = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      page.on('response', (res) => {
        const url = res.url();
        const status = res.status();
        if (status === 401) {
          responses401.push(`${status} ${url}`);
        }
        if (status === 404) {
          responses404.push(`${status} ${url}`);
        }
      });

      // 1. Initial direct loads on all specified routes
      for (const route of ROUTES) {
        await page.goto(route, { waitUntil: 'networkidle' });
        await page.waitForTimeout(150);
      }

      // 2. Client-side navigation between routes
      await page.goto('/', { waitUntil: 'networkidle' });

      if (vp.width < 1024) {
        // Open mobile drawer
        const menuBtn = page.getByRole('button', { name: /mobile navigation menu/i });
        await menuBtn.click();
        const mobileNav = page.getByRole('navigation', { name: 'Mobile Navigation' });
        await expect(mobileNav).toBeVisible();
        await mobileNav.getByRole('link', { name: 'Collection', exact: true }).click();
      } else {
        await page.locator('header nav a[href="/shop"]').click();
      }
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(150);

      // Navigate to /cart
      await page.goto('/cart', { waitUntil: 'networkidle' });
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(150);

      // Navigate to /product/bow-scrunchie
      await page.goto('/product/bow-scrunchie', { waitUntil: 'networkidle' });
      await page.waitForTimeout(150);

      expect(responses401, `Found 401 responses at ${vp.name}: ${responses401.join(', ')}`).toEqual([]);
      expect(responses404, `Found 404 responses at ${vp.name}: ${responses404.join(', ')}`).toEqual([]);
      expect(consoleErrors, `Found console errors at ${vp.name}: ${consoleErrors.join(', ')}`).toEqual([]);
    });
  }

  test('logged-in customer: /me and /cart return 200 and cart badge shows correctly', async ({ page }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width: 1366, height: 768 });

    let meStatus: number | null = null;
    let cartStatus: number | null = null;

    page.on('response', (res) => {
      const url = res.url();
      if (url.includes('/api/v1/me')) {
        meStatus = res.status();
      }
      if (url.includes('/api/v1/cart') && !url.includes('/items')) {
        cartStatus = res.status();
      }
    });

    const testEmail = `cust_${Date.now()}@example.com`;
    await page.goto('/signup');
    await page.getByLabel(/Full Name/i).fill('Bespoke Customer');
    await page.getByLabel(/Email Address/i).fill(testEmail);
    await page.locator('#signup-password').fill('Password123!');
    await page.getByRole('button', { name: /create account/i }).click();

    // Verify redirect to account
    await page.waitForURL('**/account', { timeout: 15000 });

    // Navigate to product page and check /me and /cart
    await page.goto('/product/bow-scrunchie');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    expect(meStatus).toBe(200);
    expect(cartStatus).toBe(200);

    // Select first option in each option group
    const groups = page.locator('fieldset');
    const groupCount = await groups.count();
    for (let i = 0; i < groupCount; i++) {
      const option = groups.nth(i).locator('[role="radio"], button').first();
      if (await option.isVisible()) {
        await option.click();
        await page.waitForTimeout(100);
      }
    }

    const addToCartButton = page.locator('button:has-text("Add to Bag"), button:has-text("Add to Cart")').first();
    await expect(addToCartButton).toBeVisible();
    await expect(addToCartButton).toBeEnabled({ timeout: 5000 });
    await addToCartButton.click();

    // Verify cart badge in header
    const badge = page.locator('[data-testid="cart-count-badge"]');
    await expect(badge).toBeVisible({ timeout: 10000 });
    const countText = await badge.textContent();
    expect(Number(countText)).toBeGreaterThan(0);
  });

  test('regression: sticky header, adaptive tone, single-line nav, no horizontal scroll, drawer scroll lock', async ({ page }) => {
    // 1. Desktop viewport (1366x768)
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto('/', { waitUntil: 'networkidle' });

    // Header sticky check after scroll
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(200);
    const headerTop = await page.evaluate(() => {
      const header = document.querySelector('header');
      return header ? Math.round(header.getBoundingClientRect().top) : null;
    });
    expect(headerTop).toBe(0);

    // Adaptive tone: over #explore-by-type
    const exploreTone = await page.evaluate(async () => {
      const el = document.querySelector('#explore-by-type');
      if (el) el.scrollIntoView();
      await new Promise((r) => setTimeout(r, 200));
      return document.querySelector('header')?.getAttribute('data-header-state');
    });
    expect(exploreTone).toBe('plum');

    // Adaptive tone: over #featured-pieces
    const featuredTone = await page.evaluate(async () => {
      const el = document.querySelector('#featured-pieces');
      if (el) el.scrollIntoView();
      await new Promise((r) => setTimeout(r, 200));
      return document.querySelector('header')?.getAttribute('data-header-state');
    });
    expect(featuredTone).toBe('plum');

    // Adaptive tone: top / hero
    const heroTone = await page.evaluate(async () => {
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 200));
      return document.querySelector('header')?.getAttribute('data-header-state');
    });
    expect(heroTone).toBe('ivory');

    // Nav links on one line at lg+
    const navWrapped = await page.evaluate(() => {
      const navLinks = Array.from(document.querySelectorAll('header nav a'));
      if (navLinks.length < 2) return false;
      const tops = navLinks.map((l) => l.getBoundingClientRect().top);
      return tops.some((t) => Math.abs(t - tops[0]) > 4);
    });
    expect(navWrapped).toBe(false);

    // No horizontal scroll on desktop
    const desktopHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(desktopHorizontalScroll).toBe(false);

    // 2. Mobile viewport (390x844)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'networkidle' });

    // No horizontal scroll on mobile
    const mobileHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(mobileHorizontalScroll).toBe(false);

    // Mobile drawer scroll lock
    const menuBtn = page.getByRole('button', { name: /mobile navigation menu/i });
    if (await menuBtn.isVisible()) {
      await menuBtn.click();
      await page.waitForTimeout(300);
      const isLocked = await page.evaluate(() => {
        return (
          document.body.style.overflow === 'hidden' ||
          document.documentElement.style.overflow === 'hidden' ||
          document.body.classList.contains('overflow-hidden')
        );
      });
      expect(isLocked).toBe(true);
    }
  });
});
