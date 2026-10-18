import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pagesToScan = [
  { name: 'Homepage', path: '/' },
  { name: 'Shop Catalogue', path: '/shop' },
  { name: 'Category Page', path: '/category/scrunchies' },
  { name: 'Product Detail', path: '/product/classic-scrunchie' },
  { name: 'Build Your Own', path: '/build-your-own' },
  { name: 'Cart', path: '/cart' },
  { name: 'Checkout', path: '/checkout' },
  { name: 'Login', path: '/login' },
  { name: 'Signup', path: '/signup' },
  { name: 'Forgot Password', path: '/forgot-password' },
  { name: 'Account Profile', path: '/account' },
  { name: 'Account Orders', path: '/account/orders' },
  { name: 'Account Addresses', path: '/account/addresses' },
  { name: 'About Brand', path: '/about' },
  { name: 'Contact Us', path: '/contact' },
  { name: 'Privacy Policy', path: '/privacy' },
  { name: 'Terms of Service', path: '/terms' },
  { name: 'Order Confirmation', path: '/order-confirmation?orderId=ord-1001' },
  { name: 'Not Found Page', path: '/this-page-does-not-exist-404' },
];

for (const { name, path } of pagesToScan) {
  test(`Accessibility scan (axe): ${name} (${path})`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    const failingViolations = accessibilityScanResults.violations.filter(
      (violation) =>
        violation.impact === 'moderate' ||
        violation.impact === 'serious' ||
        violation.impact === 'critical'
    );

    expect(
      failingViolations,
      `Accessibility violations (moderate/serious/critical) found on ${name} (${path}): ${JSON.stringify(
        failingViolations.map((v) => ({ id: v.id, impact: v.impact, description: v.description })),
        null,
        2
      )}`
    ).toEqual([]);
  });
}
