import { test, expect } from '@playwright/test';

test.describe('Task 1 - Remove customiser block verification', () => {
  const viewports = [
    { width: 390, height: 844 },
    { width: 1366, height: 768 },
  ];

  for (const vp of viewports) {
    test(`verifies no customiser block and no horizontal scroll at ${vp.width}x${vp.height}`, async ({ page }) => {
      await page.setViewportSize(vp);
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      // 1. Verify customiser text is NOT present
      const customiserHeading = page.locator('text=Build your own accessory in three simple steps');
      await expect(customiserHeading).toHaveCount(0);

      const customiserCta = page.locator('text=Customise an Item');
      await expect(customiserCta).toHaveCount(0);

      // 2. Verify navigation still contains Customise link
      const navCustomise = page.locator('nav a[href="/build-your-own"], header a[href="/build-your-own"]');
      expect(await navCustomise.count()).toBeGreaterThanOrEqual(1);

      // 3. Verify no horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);
    });
  }
});
