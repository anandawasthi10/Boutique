import { test, expect } from '@playwright/test';

const publicPages = [
  '/',
  '/shop',
  '/product/classic-scrunchie',
  '/category/scrunchies',
  '/build-your-own',
  '/about',
  '/contact',
  '/cart',
  '/login',
  '/signup',
  '/forgot-password',
];

for (const path of publicPages) {
  test(`No horizontal scroll on ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState('networkidle');

    // Assert that the page's scrollWidth does not exceed the viewport innerWidth
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    expect(
      hasHorizontalScroll,
      `Horizontal scroll detected on ${path} at viewport width ${page.viewportSize()?.width}px`
    ).toBe(false);
  });
}
