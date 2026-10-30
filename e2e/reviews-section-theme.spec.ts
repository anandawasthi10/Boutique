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

test.describe('Ratings & Reviews - Ivory and Plum Theme Verification', () => {
  test.beforeAll(async () => {
    const screenshotDir = path.join(process.cwd(), 'screenshots', 'theme');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
  });

  for (const vp of VIEWPORTS) {
    test(`verifies Ratings & Reviews theme at ${vp.width}x${vp.height}`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await page.setViewportSize(vp);
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      // 1. Wait for #reviews-section
      const section = page.locator('#reviews-section');
      await expect(section).toBeVisible({ timeout: 15000 });
      expect(await section.getAttribute('data-tone')).toBe('light');

      // 2. Verify section background is exactly plum (rgb(61, 36, 56)) and opaque
      const sectionStyles = await section.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          backgroundColor: computed.backgroundColor,
          opacity: computed.opacity,
          boxShadow: computed.boxShadow,
          backdropFilter: computed.backdropFilter,
        };
      });
      expect(sectionStyles.backgroundColor).toBe('rgb(61, 36, 56)');
      expect(sectionStyles.opacity).toBe('1');
      expect(sectionStyles.boxShadow).toBe('none');

      // 3. Verify no horizontal window overflow
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);

      // 4. Verify summary box is solid plum-raised (rgb(96, 75, 92)), 4px radius, no shadow
      const summaryBox = section.locator('.bg-\\[var\\(--color-plum-raised\\)\\]').first();
      await expect(summaryBox).toBeVisible();
      const summaryStyles = await summaryBox.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          backgroundColor: computed.backgroundColor,
          borderRadius: computed.borderRadius,
          boxShadow: computed.boxShadow,
          opacity: computed.opacity,
        };
      });
      expect(summaryStyles.backgroundColor).toBe('rgb(96, 75, 92)');
      expect(summaryStyles.borderRadius).toBe('4px');
      expect(summaryStyles.boxShadow).toBe('none');
      expect(summaryStyles.opacity).toBe('1');

      // 5. Verify Big Score 4.3 color is ivory
      const scoreEl = section.locator('span:has-text("4.3")').first();
      const scoreColor = await scoreEl.evaluate((el) => window.getComputedStyle(el).color);
      expect(scoreColor).toBe('rgb(251, 247, 244)');

      // 6. Verify Review cards styling
      const cards = section.locator('[data-testid^="review-card-"]');
      const cardCount = await cards.count();
      expect(cardCount).toBeGreaterThanOrEqual(1);

      const firstCardStyles = await cards.first().evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          backgroundColor: computed.backgroundColor,
          borderRadius: computed.borderRadius,
          boxShadow: computed.boxShadow,
          borderWidth: computed.borderWidth,
        };
      });
      expect(firstCardStyles.backgroundColor).toBe('rgb(96, 75, 92)'); // plum-raised
      expect(firstCardStyles.borderRadius).toBe('4px');
      expect(firstCardStyles.boxShadow).toBe('none');
      expect(firstCardStyles.borderWidth).toBe('0px');

      // 7. Verify no gradients, box-shadows, or blur in the entire section
      const visualChecks = await section.evaluate((sec) => {
        const allElements = sec.querySelectorAll('*');
        const violations: string[] = [];
        allElements.forEach((el) => {
          const s = window.getComputedStyle(el);
          if (s.backgroundImage && s.backgroundImage.includes('gradient')) {
            violations.push(`Gradient on ${el.tagName}.${el.className}`);
          }
          if (s.boxShadow && s.boxShadow !== 'none') {
            violations.push(`Shadow on ${el.tagName}.${el.className}: ${s.boxShadow}`);
          }
          if (s.backdropFilter && s.backdropFilter !== 'none') {
            violations.push(`Backdrop filter on ${el.tagName}.${el.className}`);
          }
        });
        return violations;
      });
      expect(visualChecks).toEqual([]);

      // 8. Verify buttons and interactive elements
      const writeReviewBtn = section.locator('button:has-text("Write a Review")');
      await expect(writeReviewBtn).toBeVisible();
      const writeBtnStyles = await writeReviewBtn.evaluate((el) => {
        const s = window.getComputedStyle(el);
        return {
          backgroundColor: s.backgroundColor,
          color: s.color,
          borderRadius: s.borderRadius,
          height: el.getBoundingClientRect().height,
        };
      });
      expect(writeBtnStyles.backgroundColor).toBe('rgb(251, 247, 244)'); // ivory
      expect(writeBtnStyles.color).toBe('rgb(61, 36, 56)'); // plum
      expect(writeBtnStyles.borderRadius).toBe('4px');
      expect(writeBtnStyles.height).toBeGreaterThanOrEqual(48);

      const googleBtn = section.locator('a:has-text("View on Google")');
      await expect(googleBtn).toBeVisible();
      const googleBtnStyles = await googleBtn.evaluate((el) => {
        const s = window.getComputedStyle(el);
        return {
          color: s.color,
          borderColor: s.borderColor,
          borderRadius: s.borderRadius,
          height: el.getBoundingClientRect().height,
        };
      });
      expect(googleBtnStyles.color).toBe('rgb(251, 247, 244)');
      expect(googleBtnStyles.borderRadius).toBe('4px');
      expect(googleBtnStyles.height).toBeGreaterThanOrEqual(48);

      // 9. Mobile-specific checks
      if (vp.width < 1024) {
        // Mobile swipeable row exists with snap
        const swipeRow = section.locator('div[aria-label="Customer reviews swipeable row"]');
        await expect(swipeRow).toBeVisible();

        // Speed/Flow controls are hidden on mobile
        const speedSelector = section.locator('span:has-text("Speed:")');
        await expect(speedSelector).toBeHidden();
        const flowBtn = section.locator('button[aria-label="Toggle scroll direction"]');
        await expect(flowBtn).toBeHidden();

        // Check tap target sizes (all buttons, pills, like, share >= 44x44px)
        const filterPills = section.locator('button:has-text("Reviews"), button:has-text("Loved"), button:has-text("Custom Tailoring"), button:has-text("Local Guides")');
        const pillCount = await filterPills.count();
        for (let i = 0; i < pillCount; i++) {
          const box = await filterPills.nth(i).boundingBox();
          if (box) {
            expect(box.height).toBeGreaterThanOrEqual(44);
          }
        }

        const heartBtn = cards.first().locator('button[aria-label="React with heart"]');
        const heartBox = await heartBtn.boundingBox();
        if (heartBox) {
          expect(heartBox.height).toBeGreaterThanOrEqual(44);
          expect(heartBox.width).toBeGreaterThanOrEqual(44);
        }

        const shareBtn = cards.first().locator('button[aria-label="Share review"]');
        const shareBox = await shareBtn.boundingBox();
        if (shareBox) {
          expect(shareBox.height).toBeGreaterThanOrEqual(44);
          expect(shareBox.width).toBeGreaterThanOrEqual(44);
        }
      } else {
        // Desktop marquee wrapper is visible
        const marquee = section.locator('.reviews-marquee-container');
        await expect(marquee).toBeVisible();

        // Desktop speed and flow controls are visible
        const speedSelector = section.locator('span:has-text("Speed:")');
        await expect(speedSelector).toBeVisible();
      }

      // 10. Header state over #reviews-section is ivory
      await section.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);

      const headerState = await page.evaluate(() => {
        const header = document.querySelector('header');
        return header?.getAttribute('data-header-state');
      });
      expect(headerState).toBe('plum');

      // 11. Zero console errors
      expect(consoleErrors).toHaveLength(0);

      // 12. Save screenshot
      const screenshotPath = path.join(
        process.cwd(),
        'screenshots',
        'theme',
        `reviews-section-${vp.width}x${vp.height}.png`
      );
      await section.screenshot({ path: screenshotPath });
      expect(fs.existsSync(screenshotPath)).toBe(true);
    });
  }

  test('verifies static components contain zero forbidden Tailwind colors and zero non-G-logo hex', () => {
    const dir = path.join(process.cwd(), 'components', 'reviews');
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.tsx'));

    const forbiddenClasses = ['navy', 'slate', 'amber', 'orange', 'yellow', 'emerald'];
    const allowedHex = ['#4285F4', '#34A853', '#FBBC05', '#EA4335'];

    for (const file of files) {
      const content = fs.readFileSync(path.join(dir, file), 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, idx) => {
        for (const cls of forbiddenClasses) {
          // ignore translate3d
          if (cls === 'slate' && line.includes('translate3d')) continue;
          if (line.includes(cls)) {
            throw new Error(`Forbidden term "${cls}" found in ${file}:${idx + 1}: ${line}`);
          }
        }

        const hexMatches = line.match(/#[0-9a-fA-F]{3,8}/g);
        if (hexMatches) {
          for (const h of hexMatches) {
            if (!allowedHex.includes(h.toUpperCase())) {
              throw new Error(`Forbidden raw hex "${h}" found in ${file}:${idx + 1}: ${line}`);
            }
          }
        }
      });
    }
  });
});

