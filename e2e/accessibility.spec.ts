import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pagesToScan = [
  { name: 'Homepage', path: '/' },
  { name: 'Shop Catalogue', path: '/shop' },
  { name: 'Product Detail', path: '/product/classic-scrunchie' },
  { name: 'Cart', path: '/cart' },
  { name: 'Checkout', path: '/checkout' },
  { name: 'Login', path: '/login' },
  { name: 'Signup', path: '/signup' },
  { name: 'Account', path: '/account' },
];

for (const { name, path } of pagesToScan) {
  test(`Accessibility scan (axe): ${name} (${path})`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    const seriousOrCriticalViolations = accessibilityScanResults.violations.filter(
      (violation) => violation.impact === 'serious' || violation.impact === 'critical'
    );

    expect(
      seriousOrCriticalViolations,
      `Serious or critical accessibility violations found on ${name} (${path}): ${JSON.stringify(
        seriousOrCriticalViolations.map((v) => ({ id: v.id, impact: v.impact, description: v.description })),
        null,
        2
      )}`
    ).toEqual([]);
  });
}
