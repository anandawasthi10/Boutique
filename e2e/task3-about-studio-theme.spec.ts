import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1366, height: 768 },
];

function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrastRatio(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const lum1 = getLuminance(rgb1[0], rgb1[1], rgb1[2]);
  const lum2 = getLuminance(rgb2[0], rgb2[1], rgb2[2]);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

test.describe('Task 3 - About the Studio Plum Theme Verification', () => {
  for (const vp of VIEWPORTS) {
    test(`verifies About the Studio styling and contrast at ${vp.width}x${vp.height}`, async ({ page }) => {
      await page.setViewportSize(vp);
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      const section = page.locator('#about-the-studio');
      await expect(section).toBeVisible();

      // 1. Computed background is exactly solid plum and opaque
      const sectionStyles = await section.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          backgroundColor: computed.backgroundColor,
          opacity: computed.opacity,
          boxShadow: computed.boxShadow,
          backdropFilter: computed.backdropFilter,
        };
      });
      expect(sectionStyles.backgroundColor).toBe('rgb(61, 36, 56)'); // plum #3D2438
      expect(sectionStyles.opacity).toBe('1');
      expect(sectionStyles.boxShadow).toBe('none');

      // 2. Container max width about 42rem (672px)
      const container = section.locator('div').first();
      const containerMaxWidth = await container.evaluate((el) => {
        return window.getComputedStyle(el).maxWidth;
      });
      expect(containerMaxWidth).toBe('672px'); // 42rem

      // 3. Eyebrow "ABOUT THE STUDIO": rose-pale, uppercase, tracking ~0.16em
      const eyebrow = section.locator('span:has-text("About The Studio")');
      await expect(eyebrow).toBeVisible();
      const eyebrowStyles = await eyebrow.evaluate((el) => {
        const s = window.getComputedStyle(el);
        return {
          color: s.color,
          textTransform: s.textTransform,
          letterSpacing: s.letterSpacing,
        };
      });
      expect(eyebrowStyles.color).toBe('rgb(235, 198, 210)'); // rose-pale #EBC6D2
      expect(eyebrowStyles.textTransform).toBe('uppercase');

      // 4. Title: ivory, serif
      const heading = section.locator('h2');
      await expect(heading).toBeVisible();
      const headingStyles = await heading.evaluate((el) => {
        const s = window.getComputedStyle(el);
        return {
          color: s.color,
          fontFamily: s.fontFamily,
        };
      });
      expect(headingStyles.color).toBe('rgb(251, 247, 244)'); // ivory #FBF7F4
      expect(headingStyles.fontFamily).toMatch(/Cormorant Garamond|Georgia|serif/);

      // 5. Paragraph: ivory at about 82% alpha, line-height ~1.7
      const paragraph = section.locator('p');
      await expect(paragraph).toBeVisible();
      const pStyles = await paragraph.evaluate((el) => {
        const s = window.getComputedStyle(el);
        return {
          color: s.color,
          lineHeight: parseFloat(s.lineHeight) / parseFloat(s.fontSize),
        };
      });
      expect(pStyles.color).toBe('rgba(251, 247, 244, 0.82)');
      expect(pStyles.lineHeight).toBeGreaterThanOrEqual(1.65);
      expect(pStyles.lineHeight).toBeLessThanOrEqual(1.75);

      // 6. Contrast calculations against plum rgb(61, 36, 56)
      const plumRgb: [number, number, number] = [61, 36, 56];
      const rosePaleRgb: [number, number, number] = [235, 198, 210];
      const ivoryRgb: [number, number, number] = [251, 247, 244];
      // Effective RGB for 82% ivory on plum
      const pEffectiveRgb: [number, number, number] = [
        Math.round(251 * 0.82 + 61 * 0.18),
        Math.round(247 * 0.82 + 36 * 0.18),
        Math.round(244 * 0.82 + 56 * 0.18),
      ];

      expect(getContrastRatio(rosePaleRgb, plumRgb)).toBeGreaterThanOrEqual(4.5);
      expect(getContrastRatio(ivoryRgb, plumRgb)).toBeGreaterThanOrEqual(4.5);
      expect(getContrastRatio(pEffectiveRgb, plumRgb)).toBeGreaterThanOrEqual(4.5);

      // 7. Header state over #about-the-studio is ivory
      await section.evaluate((el) => {
        const rect = el.getBoundingClientRect();
        const targetY = window.scrollY + rect.top;
        window.scrollTo({ top: targetY, behavior: 'instant' });
      });
      await page.waitForTimeout(300);
      const headerState = await page.evaluate(() => {
        return document.querySelector('header')?.getAttribute('data-header-state');
      });
      expect(headerState).toBe('ivory');

      // 8. No horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);
    });
  }
});
