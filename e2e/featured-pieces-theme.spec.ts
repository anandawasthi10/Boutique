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

test.describe('Featured Pieces - Ivory and Plum Theme Verification', () => {
  test.beforeAll(async () => {
    const screenshotDir = path.join(process.cwd(), 'screenshots', 'theme');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
  });

  for (const vp of VIEWPORTS) {
    test(`verifies Featured Pieces theme and captures screenshot at ${vp.width}x${vp.height}`, async ({ page }) => {
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

      // Wait for #featured-pieces section to load
      const section = page.locator('#featured-pieces');
      await expect(section).toBeVisible({ timeout: 15000 });

      // Wait for products in ProductGrid to appear
      const cards = section.locator('[data-testid="product-grid"] a[href^="/product/"]');
      await expect(cards.first()).toBeVisible({ timeout: 15000 });
      const cardCount = await cards.count();
      expect(cardCount).toBeGreaterThanOrEqual(1);

      // 1. Verify computed background of section is surface: rgb(240, 228, 230) and fully opaque
      const sectionBg = await section.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          backgroundColor: computed.backgroundColor,
          opacity: computed.opacity,
        };
      });
      expect(sectionBg.backgroundColor).toBe('rgb(240, 228, 230)');
      expect(sectionBg.opacity).toBe('1');

      // 2. Eyebrow "CATALOGUE" styling and contrast
      const eyebrow = section.locator('span:has-text("Catalogue")');
      await expect(eyebrow).toBeVisible();
      const eyebrowStyles = await eyebrow.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          color: style.color,
          textTransform: style.textTransform,
        };
      });
      expect(eyebrowStyles.color).toBe('rgb(107, 86, 99)'); // muted token #6B5663
      expect(eyebrowStyles.textTransform).toBe('uppercase');

      // 3. Title "Featured Pieces" serif font and ink color
      const title = section.locator('h2:has-text("Featured Pieces")');
      await expect(title).toBeVisible();
      const titleStyles = await title.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          color: style.color,
          fontFamily: style.fontFamily,
        };
      });
      expect(titleStyles.color).toBe('rgb(43, 27, 39)'); // ink token #2B1B27
      expect(titleStyles.fontFamily.toLowerCase()).toContain('cormorant');

      // 4. Divider under heading row: plum at 20% alpha
      const headingRow = section.locator('.flex.items-end.justify-between');
      const dividerBorder = await headingRow.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          borderBottomWidth: style.borderBottomWidth,
          borderBottomColor: style.borderBottomColor,
        };
      });
      expect(dividerBorder.borderBottomWidth).toBe('1px');
      expect(dividerBorder.borderBottomColor).toBe('rgba(61, 36, 56, 0.2)');

      // 5. Image blocks in Featured Pieces: solid ivory, 4px radius, no border, no shadow, no overlay
      const imageBlocksInfo = await section.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('#featured-pieces [data-testid="product-grid"] a[href^="/product/"]'));
        return cards.map((card) => {
          const imgContainer = card.firstElementChild as HTMLElement;
          const style = window.getComputedStyle(imgContainer);
          return {
            bg: style.backgroundColor,
            borderWidth: style.borderWidth,
            boxShadow: style.boxShadow,
            borderRadius: style.borderRadius,
          };
        });
      });

      for (const info of imageBlocksInfo) {
        expect(info.bg).toBe('rgb(251, 247, 244)'); // solid ivory
        expect(info.borderWidth === '0px' || info.borderWidth === '').toBeTruthy();
        expect(info.boxShadow === 'none' || info.boxShadow === '').toBeTruthy();
        expect(info.borderRadius).toBe('4px');
      }

      // 6. Product name (serif, ink, clamped 2 lines) and Price (plum, medium weight)
      const firstCardInfo = await cards.first().evaluate((el) => {
        const heading = el.querySelector('h2, h3, h4') as HTMLElement;
        const price = el.querySelector('.text-price') as HTMLElement;
        const headingStyle = window.getComputedStyle(heading);
        const priceStyle = window.getComputedStyle(price);
        return {
          headingColor: headingStyle.color,
          headingFont: headingStyle.fontFamily,
          headingClamp: (headingStyle as any).webkitLineClamp || (headingStyle as any).lineClamp,
          priceColor: priceStyle.color,
          priceWeight: priceStyle.fontWeight,
        };
      });
      expect(firstCardInfo.headingColor).toBe('rgb(43, 27, 39)'); // ink
      expect(firstCardInfo.headingFont.toLowerCase()).toContain('cormorant');
      expect(firstCardInfo.headingClamp).toBe('2');
      expect(firstCardInfo.priceColor).toBe('rgb(61, 36, 56)'); // plum
      expect(parseInt(firstCardInfo.priceWeight, 10)).toBeGreaterThanOrEqual(500);

      // 7. Grid column layout checks
      const grid = section.locator('[data-testid="product-grid"]');
      const gridComputed = await grid.evaluate((el) => {
        const children = Array.from(el.children);
        const rects = children.map((c) => c.getBoundingClientRect());
        const uniqueLefts = new Set(rects.map((r) => Math.round(r.left)));
        return {
          columns: uniqueLefts.size,
        };
      });

      if (vp.width >= 1024) {
        // Desktop: 4 columns
        expect(gridComputed.columns).toBe(4);
      } else if (vp.width >= 768) {
        // Tablet: 3 columns
        expect(gridComputed.columns).toBe(3);
      } else {
        // Mobile: 2 columns
        expect(gridComputed.columns).toBe(2);
      }

      // 8. No horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);

      // 9. "View full range" desktop vs mobile button and tap targets
      if (vp.width >= 640) {
        const desktopLink = section.locator('a[href="/shop"].text-body-small');
        await expect(desktopLink).toBeVisible();
        const linkColor = await desktopLink.evaluate((el) => window.getComputedStyle(el).color);
        expect(linkColor).toBe('rgb(61, 36, 56)'); // plum
      } else {
        const mobileBtn = section.locator('div.sm\\:hidden a[href="/shop"]');
        await expect(mobileBtn).toBeVisible();
        const btnBox = await mobileBtn.boundingBox();
        expect(btnBox).not.toBeNull();
        if (btnBox) {
          expect(btnBox.height).toBeGreaterThanOrEqual(48); // min 48px
          expect(btnBox.width).toBeGreaterThanOrEqual(44);
        }

        const btnStyles = await mobileBtn.evaluate((el) => {
          const style = window.getComputedStyle(el);
          return {
            color: style.color,
            borderColor: style.borderColor,
            borderRadius: style.borderRadius,
            backgroundColor: style.backgroundColor,
          };
        });
        expect(btnStyles.color).toBe('rgb(61, 36, 56)'); // plum
        expect(btnStyles.borderColor).toBe('rgb(61, 36, 56)'); // plum 1px border
        expect(btnStyles.borderRadius).toBe('4px');
        // Transparent or rgba(0,0,0,0)
        expect(btnStyles.backgroundColor).toMatch(/rgba\(0,\s*0,\s*0,\s*0\)|transparent/);

        // Check card tap targets
        for (let i = 0; i < cardCount; i++) {
          const box = await cards.nth(i).boundingBox();
          expect(box).not.toBeNull();
          if (box) {
            expect(box.height).toBeGreaterThanOrEqual(44);
            expect(box.width).toBeGreaterThanOrEqual(44);
          }
        }
      }

      // 10. Header over #featured-pieces turns plum (data-tone="light")
      await section.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);

      const headerState = await page.evaluate(() => {
        const header = document.querySelector('header');
        return header?.getAttribute('data-header-state');
      });
      expect(headerState).toBe('plum');

      // 11. Zero requests for placeholder.svg and zero console errors
      const placeholderErrors = failedRequests.filter((r) => r.includes('placeholder.svg'));
      expect(placeholderErrors).toHaveLength(0);
      expect(consoleErrors).toHaveLength(0);

      // 12. Capture and save full section screenshot to screenshots/theme/
      const screenshotPath = path.join(
        process.cwd(),
        'screenshots',
        'theme',
        `featured-pieces-${vp.width}x${vp.height}.png`
      );
      await section.screenshot({ path: screenshotPath });
      expect(fs.existsSync(screenshotPath)).toBe(true);
    });
  }

  test('verifies that /shop still renders surface-colored image containers on ivory background', async ({ page }) => {
    await page.goto('/shop', { waitUntil: 'domcontentloaded' });
    const shopCards = page.locator('[data-testid="product-grid"] a[href^="/product/"]');
    await expect(shopCards.first()).toBeVisible({ timeout: 15000 });

    const firstShopImageBg = await shopCards.first().evaluate((card) => {
      const imgContainer = card.firstElementChild as HTMLElement;
      return window.getComputedStyle(imgContainer).backgroundColor;
    });

    // On /shop, default tone="on-ivory" uses surface color
    expect(firstShopImageBg).toBe('rgb(240, 228, 230)');
  });
});
