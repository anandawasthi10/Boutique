import { test, expect, type Locator } from '@playwright/test';

const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1366, height: 768 },
];

test.describe('Task 2 - Section Order and Adaptive Tones Verification', () => {
  for (const vp of VIEWPORTS) {
    test(`verifies section order and header tones at ${vp.width}x${vp.height}`, async ({ page }) => {
      await page.setViewportSize(vp);
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      // 1. Verify all target sections exist
      const hero = page.locator('#hero');
      const explore = page.locator('#explore-by-type');
      const featured = page.locator('#featured-pieces');
      const about = page.locator('#about-the-studio');
      const reviews = page.locator('#reviews-section');
      const footer = page.locator('footer');

      await expect(hero).toBeVisible();
      await expect(explore).toBeVisible();
      await expect(featured).toBeVisible();
      await expect(about).toBeVisible();
      await expect(reviews).toBeVisible();
      await expect(footer).toBeVisible();

      // 2. Verify section order in DOM
      const order = await page.evaluate(() => {
        const sections = [
          document.querySelector('#hero'),
          document.querySelector('#explore-by-type'),
          document.querySelector('#featured-pieces'),
          document.querySelector('#about-the-studio'),
          document.querySelector('#reviews-section'),
          document.querySelector('footer'),
        ];
        return sections.map((s) => s ? s.id || s.tagName.toLowerCase() : null);
      });

      expect(order).toEqual([
        'hero',
        'explore-by-type',
        'featured-pieces',
        'about-the-studio',
        'reviews-section',
        'footer',
      ]);

      // 3. Verify section vertical positions are monotonically increasing
      const positions = await page.evaluate(() => {
        const elements = [
          document.querySelector('#hero'),
          document.querySelector('#explore-by-type'),
          document.querySelector('#featured-pieces'),
          document.querySelector('#about-the-studio'),
          document.querySelector('#reviews-section'),
          document.querySelector('footer'),
        ];
        return elements.map((el) => {
          if (!el) return -1;
          const rect = el.getBoundingClientRect();
          return rect.top + window.scrollY;
        });
      });

      for (let i = 0; i < positions.length - 1; i++) {
        expect(positions[i + 1]).toBeGreaterThan(positions[i]);
      }

      // 4. Verify data-tone attributes
      expect(await hero.getAttribute('data-tone')).toBe('dark');
      expect(await explore.getAttribute('data-tone')).toBe('light');
      expect(await featured.getAttribute('data-tone')).toBe('light');
      expect(await about.getAttribute('data-tone')).toBe('dark');
      expect(await reviews.getAttribute('data-tone')).toBe('light');
      expect(await footer.getAttribute('data-tone')).toBe('dark');

      // Add temporary scroll runway to allow header to be positioned over the footer
      await page.evaluate(() => {
        document.body.style.paddingBottom = '1500px';
      });

      // Helper to scroll section into header area and check state
      const checkHeaderState = async (locator: Locator, expectedTone: 'ivory' | 'plum') => {
        await locator.evaluate((el: HTMLElement) => {
          const rect = el.getBoundingClientRect();
          const targetY = window.scrollY + rect.top;
          window.scrollTo({ top: targetY, behavior: 'instant' });
        });
        await page.waitForTimeout(300);
        const headerState = await page.evaluate(() => {
          return document.querySelector('header')?.getAttribute('data-header-state');
        });
        expect(headerState).toBe(expectedTone);
      };

      // 5. Test header tones:
      // ivory over hero
      await checkHeaderState(hero, 'ivory');

      // plum over Explore
      await checkHeaderState(explore, 'plum');

      // plum over Featured
      await checkHeaderState(featured, 'plum');

      // ivory over About
      await checkHeaderState(about, 'ivory');

      // plum over Reviews
      await checkHeaderState(reviews, 'plum');

      // ivory over Footer
      await checkHeaderState(footer, 'ivory');

      // Reset temporary runway
      await page.evaluate(() => {
        document.body.style.paddingBottom = '';
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(100);

      // 6. Verify no horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);
    });
  }
});
