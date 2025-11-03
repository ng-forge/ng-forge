import { expect, test } from '@playwright/test';

test.describe('Material Demo App - Scenario List', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the demo app header', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Dynamic Form Material Demo');
    await expect(page.locator('.demo-header p')).toContainText('E2E Testing Scenarios');
  });

  test('should navigate to scenarios page by default', async ({ page }) => {
    await expect(page).toHaveURL('/scenarios');
    await expect(page.locator('h2')).toContainText('E2E Testing Scenarios');
  });

  test('should display all scenario cards', async ({ page }) => {
    // Check that all expected scenario cards are present
    const scenarios = [
      'single-page-scenario',
      'multi-page-scenario',
      'cross-field-validation-scenario',
      'user-registration-scenario',
      'profile-management-scenario',
    ];

    for (const scenario of scenarios) {
      await expect(page.locator(`[data-testid="${scenario}"]`)).toBeVisible();
    }
  });

  test('should show "Coming Soon" badges on all scenarios', async ({ page }) => {
    const badges = page.locator('.badge');
    await expect(badges).toHaveCount(5);

    for (let i = 0; i < 5; i++) {
      await expect(badges.nth(i)).toContainText('Coming Soon');
    }
  });

  test('should have proper styling for scenario cards', async ({ page }) => {
    const firstCard = page.locator('[data-testid="single-page-scenario"]');

    // Check card is visible and has expected styling
    await expect(firstCard).toBeVisible();
    await expect(firstCard).toHaveClass(/scenario-card/);
    await expect(firstCard).toHaveClass(/coming-soon/);

    // Check card has reduced opacity for coming soon state
    const opacity = await firstCard.evaluate((el) => window.getComputedStyle(el).opacity);
    expect(parseFloat(opacity)).toBeLessThan(1);
  });

  test('should display scenario descriptions', async ({ page }) => {
    const singlePageCard = page.locator('[data-testid="single-page-scenario"]');

    await expect(singlePageCard.locator('h3')).toContainText('Single Page Form');
    await expect(singlePageCard.locator('p')).toContainText('Test comprehensive single-page forms');
    await expect(singlePageCard.locator('li').first()).toContainText('All Material field types');
  });

  test('should have accessible content structure', async ({ page }) => {
    // Check heading hierarchy
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h2')).toHaveCount(1);
    await expect(page.locator('h3')).toHaveCount(5); // One for each scenario

    // Check that scenario cards have proper test ids for automation
    await expect(page.locator('[data-testid]')).toHaveCount(5);
  });
});
