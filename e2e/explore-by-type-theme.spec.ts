import { test, expect } from '@playwright/test';
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

test.describe('Explore by Type - Ivory and Plum Theme Verification', () => {
  test.beforeAll(async () => {
    const screenshotDir = path.join(process.cwd(), 'screenshots', 'theme');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
  });

  for (const vp of VIEWPORTS) {
    test(`verifies Explore by Type theme and captures screenshot at ${vp.width}x${vp.height}`, async ({ page }) => {
      const consoleErrors: string[] = [];
      const failedRequests: string[] = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      page.on('requestfailed', (req) => {
        failedRequests.push(`${req.method()} ${req.url()}: ${req.failure()?.errorText}`);
      });

      page.on('response', (res) => {
        if (res.status() === 404 && res.url().includes('placeholder.svg')) {
          failedRequests.push(`404 placeholder: ${res.url()}`);
        }
      });

      await page.setViewportSize(vp);
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      // Wait for categories to load
      const section = page.locator('#explore-by-type');
      await expect(section).toBeVisible({ timeout: 15000 });

      // Ensure category items are loaded
      const cards = section.locator('a[href^="/shop?category="]');
      await expect(cards).toHaveCount(4, { timeout: 15000 });

      // 1. Verify computed background of section is ivory: rgb(251, 247, 244) and fully opaque
      const sectionBg = await section.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          backgroundColor: computed.backgroundColor,
          opacity: computed.opacity,
        };
      });
      expect(sectionBg.backgroundColor).toBe('rgb(251, 247, 244)');
      expect(sectionBg.opacity).toBe('1');

      // 2. Image blocks: surface background, no border, no shadow, no overlay
      const imageBlocksInfo = await section.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('#explore-by-type a[href^="/shop?category="]'));
        return cards.map((card) => {
          const imgContainer = card.firstElementChild as HTMLElement;
          const style = window.getComputedStyle(imgContainer);
          return {
            bg: style.backgroundColor,
            borderWidth: style.borderWidth,
            boxShadow: style.boxShadow,
            borderRadius: style.borderRadius,
            hasPhotoComingSoon: imgContainer.textContent?.includes('Photo coming soon'),
          };
        });
      });

      for (const info of imageBlocksInfo) {
        expect(info.bg).toBe('rgb(240, 228, 230)'); // surface
        expect(info.borderWidth === '0px' || info.borderWidth === '').toBeTruthy();
        expect(info.boxShadow === 'none' || info.boxShadow === '').toBeTruthy();
        expect(info.borderRadius).toBe('4px');
      }

      // 3 of 4 cards should have 'Photo coming soon' text
      const comingSoonCount = imageBlocksInfo.filter((i) => i.hasPhotoComingSoon).length;
      expect(comingSoonCount).toBe(3);

      // 3. Layout checks
      const grid = section.locator('.grid');
      const gridComputed = await grid.evaluate((el) => {
        const style = window.getComputedStyle(el);
        const children = Array.from(el.children);
        const rects = children.map((c) => c.getBoundingClientRect());
        // Determine number of columns by unique left positions
        const uniqueLefts = new Set(rects.map((r) => Math.round(r.left)));
        return {
          columns: uniqueLefts.size,
          rects,
        };
      });

      if (vp.width >= 1024) {
        // Desktop: 4 columns in 1 row
        expect(gridComputed.columns).toBe(4);
      } else {
        // Mobile / tablet: 2 columns
        expect(gridComputed.columns).toBe(2);
      }

      // 4. No horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);

      // 5. Tappable targets on mobile (min 44x44px)
      if (vp.width < 640) {
        // Mobile outline button
        const mobileBtn = section.locator('a[href="/shop"]:visible');
        await expect(mobileBtn).toBeVisible();
        const btnBox = await mobileBtn.boundingBox();
        expect(btnBox).not.toBeNull();
        if (btnBox) {
          expect(btnBox.height).toBeGreaterThanOrEqual(44);
          expect(btnBox.width).toBeGreaterThanOrEqual(44);
        }

        // Each card tap target
        for (let i = 0; i < 4; i++) {
          const cardBox = await cards.nth(i).boundingBox();
          expect(cardBox).not.toBeNull();
          if (cardBox) {
            expect(cardBox.height).toBeGreaterThanOrEqual(44);
            expect(cardBox.width).toBeGreaterThanOrEqual(44);
          }
        }
      }

      // 6. Header over #explore-by-type has plum state
      await section.scrollIntoViewIfNeeded();
      // Allow scroll observer to fire
      await page.waitForTimeout(400);

      const headerState = await page.evaluate(() => {
        const header = document.querySelector('header');
        return header?.getAttribute('data-header-state');
      });
      expect(headerState).toBe('plum');

      // 7. No placeholder.svg 404 or console errors
      const placeholderErrors = failedRequests.filter((r) => r.includes('placeholder.svg'));
      expect(placeholderErrors).toHaveLength(0);
      expect(consoleErrors).toHaveLength(0);

      // 8. Capture and save screenshot to screenshots/theme/
      const screenshotPath = path.join(process.cwd(), 'screenshots', 'theme', `explore-by-type-${vp.width}x${vp.height}.png`);
      await section.screenshot({ path: screenshotPath });
      expect(fs.existsSync(screenshotPath)).toBe(true);
    });
  }
});
