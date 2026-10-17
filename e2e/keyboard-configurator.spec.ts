import { test, expect } from '@playwright/test';

test.describe('Keyboard navigation for product option groups', () => {
  test('selects fabric and size on product page using keyboard navigation only', async ({ page }) => {
    await page.goto('/product/classic-scrunchie');
    await page.waitForLoadState('networkidle');

    // Fabric Choice radio group
    const fabricGroup = page.getByRole('radiogroup', { name: /fabric choice/i });
    await expect(fabricGroup).toBeVisible();

    const floralRadio = fabricGroup.getByRole('radio', { name: /floral/i });
    const corduroyRadio = fabricGroup.getByRole('radio', { name: /corduroy/i });

    // Focus the initial selected radio in the fabric group
    await floralRadio.focus();
    await expect(floralRadio).toBeFocused();
    await expect(floralRadio).toHaveAttribute('aria-checked', 'true');

    // Press ArrowRight to move focus and selection to Corduroy
    await page.keyboard.press('ArrowRight');
    await expect(corduroyRadio).toBeFocused();
    await expect(corduroyRadio).toHaveAttribute('aria-checked', 'true');
    await expect(floralRadio).toHaveAttribute('aria-checked', 'false');

    // Press Tab to leave Fabric group and move to next focusable element (Size group selected item)
    await page.keyboard.press('Tab');

    const sizeGroup = page.getByRole('radiogroup', { name: /size/i });
    await expect(sizeGroup).toBeVisible();

    const regularRadio = sizeGroup.getByRole('radio', { name: /regular/i });
    const largeRadio = sizeGroup.getByRole('radio', { name: /large/i });

    await expect(regularRadio).toBeFocused();
    await expect(regularRadio).toHaveAttribute('aria-checked', 'true');

    // Press ArrowRight to move selection to Large
    await page.keyboard.press('ArrowRight');
    await expect(largeRadio).toBeFocused();
    await expect(largeRadio).toHaveAttribute('aria-checked', 'true');
    await expect(regularRadio).toHaveAttribute('aria-checked', 'false');

    // Verify SelectionSummary updates reflect the keyboard choices
    const summary = page.locator('[data-testid="selection-summary"]');
    await expect(summary).toContainText(/Corduroy/i);
    await expect(summary).toContainText(/Large/i);
  });
});
