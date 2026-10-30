import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1366, height: 768 },
];

function calculateLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const l1 = calculateLuminance(rgb1[0], rgb1[1], rgb1[2]);
  const l2 = calculateLuminance(rgb2[0], rgb2[1], rgb2[2]);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function parseRgb(colorStr: string): [number, number, number] {
  const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) throw new Error(`Cannot parse color: ${colorStr}`);
  return [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10)];
}

test.describe('Task 5 - Footer Plum-Deep Theme Verification', () => {
  for (const vp of VIEWPORTS) {
    test(`verifies Footer styling, contrast and header tone at ${vp.width}x${vp.height}`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await page.setViewportSize(vp);
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      const footer = page.locator('footer');
      await expect(footer).toBeVisible({ timeout: 15000 });

      // 1. Verify data-tone is dark
      expect(await footer.getAttribute('data-tone')).toBe('dark');

      // 2. Computed background is exactly plum-deep (rgb(42, 23, 39)) and opaque
      const footerStyles = await footer.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          backgroundColor: computed.backgroundColor,
          opacity: computed.opacity,
          borderTopColor: computed.borderTopColor,
          borderTopWidth: computed.borderTopWidth,
          boxShadow: computed.boxShadow,
        };
      });

      expect(footerStyles.backgroundColor).toBe('rgb(42, 23, 39)');
      expect(footerStyles.opacity).toBe('1');
      expect(footerStyles.borderTopColor).toBe('rgb(74, 51, 71)'); // plum-line
      expect(footerStyles.borderTopWidth).toBe('1px');
      expect(footerStyles.boxShadow).toBe('none');

      // 3. Verify text contrast >= 4.5:1 against plum-deep
      const plumDeepRgb: [number, number, number] = [42, 23, 39];

      // Logo "Brand Name"
      const logo = footer.locator('span.font-heading').first();
      const logoColor = await logo.evaluate((el) => window.getComputedStyle(el).color);
      const logoRgb = parseRgb(logoColor);
      const logoContrast = contrastRatio(logoRgb, plumDeepRgb);
      expect(logoContrast).toBeGreaterThanOrEqual(4.5);

      // Explore heading
      const exploreH2 = footer.locator('h2:has-text("Explore")').first();
      const exploreH2Color = await exploreH2.evaluate((el) => window.getComputedStyle(el).color);
      const exploreH2Rgb = parseRgb(exploreH2Color);
      const exploreH2Contrast = contrastRatio(exploreH2Rgb, plumDeepRgb);
      expect(exploreH2Contrast).toBeGreaterThanOrEqual(4.5);

      // Explore links: Privacy Policy and Terms of Service must NOT be inside the Explore list
      const exploreSection = footer.locator('div:has(> h2:has-text("Explore"))');
      const exploreLinksText = await exploreSection.locator('ul li a').allTextContents();
      expect(exploreLinksText).not.toContain('Privacy Policy');
      expect(exploreLinksText).not.toContain('Terms of Service');
      expect(exploreLinksText).toContain('Shop All');

      // Bottom bar: Privacy Policy and Terms of Service must be present
      const bottomBar = footer.locator('.border-t').last();
      await expect(bottomBar.locator('a[href="/privacy"]')).toBeVisible();
      await expect(bottomBar.locator('a[href="/terms"]')).toBeVisible();

      // Tap targets: all links min-height >= 44px
      const allLinks = footer.locator('a');
      const linkCount = await allLinks.count();
      for (let i = 0; i < linkCount; i++) {
        const box = await allLinks.nth(i).boundingBox();
        if (box) {
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }

      // 4. Verify no horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);

      // 5. Verify header over the footer is ivory
      await page.evaluate(() => {
        document.body.style.paddingBottom = '1500px';
      });

      await footer.evaluate((el: HTMLElement) => {
        const rect = el.getBoundingClientRect();
        const targetY = window.scrollY + rect.top;
        window.scrollTo({ top: targetY, behavior: 'instant' });
      });
      await page.waitForTimeout(300);

      const headerState = await page.evaluate(() => {
        const header = document.querySelector('header');
        return header?.getAttribute('data-header-state');
      });
      expect(headerState).toBe('ivory');

      // Restore scroll and runway
      await page.evaluate(() => {
        document.body.style.paddingBottom = '0px';
        window.scrollTo({ top: 0, behavior: 'instant' });
      });

      // 6. Zero console errors
      expect(consoleErrors).toHaveLength(0);
    });
  }
});
