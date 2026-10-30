import { test, expect, Locator } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const VIEWPORTS = [
  { width: 360, height: 640 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1366, height: 768 },
  { width: 1920, height: 1080 },
];

test.describe('Task 6 - Final Verification and Visual Quality Suite', () => {
  test.beforeAll(async () => {
    const screenshotDir = path.join(process.cwd(), 'screenshots', 'theme');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
  });

  for (const vp of VIEWPORTS) {
    test(`full verification at ${vp.width}x${vp.height}`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          const text = msg.text();
          // ignore expected 401s when logged out
          if (!text.includes('401') && !text.includes('Unauthorized')) {
            consoleErrors.push(text);
          }
        }
      });

      await page.setViewportSize(vp);
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      // 1. Locators for sections
      const hero = page.locator('#hero');
      const explore = page.locator('#explore-by-type');
      const featured = page.locator('#featured-pieces');
      const about = page.locator('#about-the-studio');
      const reviews = page.locator('#reviews-section');
      const footer = page.locator('footer');

      // 2. All sections visible
      await expect(hero).toBeVisible({ timeout: 15000 });
      await expect(explore).toBeVisible();
      await expect(featured).toBeVisible();
      await expect(about).toBeVisible();
      await expect(reviews).toBeVisible();
      await expect(footer).toBeVisible();

      // 3. Confirm old customiser block is NOT present
      const customiserHeading = page.locator('text=Build your own accessory in three simple steps');
      expect(await customiserHeading.count()).toBe(0);

      // 4. Hero fills the first screen (accounting for header)
      const heroBox = await hero.boundingBox();
      expect(heroBox).not.toBeNull();
      if (heroBox) {
        expect(heroBox.height).toBeGreaterThanOrEqual(vp.height - 120);
      }

      // 5. Sections appear in strictly monotonic order
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

      // 6. data-tone attributes
      expect(await hero.getAttribute('data-tone')).toBe('dark');
      expect(await explore.getAttribute('data-tone')).toBe('light');
      expect(await featured.getAttribute('data-tone')).toBe('light');
      expect(await about.getAttribute('data-tone')).toBe('dark');
      expect(await reviews.getAttribute('data-tone')).toBe('light');
      expect(await footer.getAttribute('data-tone')).toBe('dark');

      // 7. Verify header state over each section
      await page.evaluate(() => {
        document.body.style.paddingBottom = '1500px';
      });

      const checkHeaderTone = async (locator: Locator, expectedTone: 'ivory' | 'plum') => {
        await locator.evaluate((el: HTMLElement) => {
          const rect = el.getBoundingClientRect();
          const targetY = window.scrollY + rect.top;
          window.scrollTo({ top: targetY, behavior: 'instant' });
          window.dispatchEvent(new Event('scroll'));
        });
        await expect
          .poll(
            async () => {
              return page.evaluate(() => {
                return document.querySelector('header')?.getAttribute('data-header-state');
              });
            },
            { timeout: 4000 }
          )
          .toBe(expectedTone);
      };

      await checkHeaderTone(hero, 'ivory');
      await checkHeaderTone(explore, 'plum');
      await checkHeaderTone(featured, 'plum');
      await checkHeaderTone(about, 'ivory');
      await checkHeaderTone(reviews, 'plum');
      await checkHeaderTone(footer, 'ivory');

      // Restore scroll position and remove padding
      await page.evaluate(() => {
        document.body.style.paddingBottom = '0px';
        window.scrollTo({ top: 0, behavior: 'instant' });
      });
      await page.waitForTimeout(200);

      // 8. Verify no horizontal scroll across page
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);

      // 9. Take screenshots per section per viewport
      const screenshotDir = path.join(process.cwd(), 'screenshots', 'theme');
      const sections = [
        { name: 'hero', loc: hero },
        { name: 'explore', loc: explore },
        { name: 'featured', loc: featured },
        { name: 'about', loc: about },
        { name: 'reviews', loc: reviews },
        { name: 'footer', loc: footer },
      ];

      for (const s of sections) {
        await s.loc.scrollIntoViewIfNeeded();
        await page.waitForTimeout(150);
        const shotPath = path.join(screenshotDir, `${s.name}-${vp.width}x${vp.height}.png`);
        await s.loc.screenshot({ path: shotPath });
        expect(fs.existsSync(shotPath)).toBe(true);
      }

      // 10. No unexpected console errors
      expect(consoleErrors).toHaveLength(0);
    });
  }
});
