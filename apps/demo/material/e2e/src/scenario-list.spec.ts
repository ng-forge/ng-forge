import { expect, test } from '@playwright/test';

test.describe('Material Demo App - Scenario List', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200/');
  });

  test('should display the demo app header', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Dynamic Form Material Demo');
    await expect(page.locator('.demo-header p')).toContainText('E2E Testing Scenarios');
  });

  test('should navigate to scenarios page by default', async ({ page }) => {
    await expect(page).toHaveURL('http://localhost:4200/scenarios');
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

  test('should show correct status badges on scenarios', async ({ page }) => {
    // All scenarios should be "Ready" now
    const badges = page.locator('.badge');
    const badgeCount = await badges.count();
    expect(badgeCount).toBeGreaterThan(0);

    // Check specific scenarios are ready
    const multiPageBadge = page.locator('[data-testid="multi-page-scenario"] .badge');
    await expect(multiPageBadge).toContainText('Ready');
  });

  test('should have proper styling for scenario cards', async ({ page }) => {
    const multiPageCard = page.locator('[data-testid="multi-page-scenario"]');

    // Check card is visible and has expected styling
    await expect(multiPageCard).toBeVisible();
    await expect(multiPageCard).toHaveClass(/scenario-card/);

    // Multi-page card should be clickable and ready - the card itself is the link
    await expect(multiPageCard).toHaveAttribute('href', '/multi-page');
  });

  test('should display scenario descriptions', async ({ page }) => {
    const singlePageCard = page.locator('[data-testid="single-page-scenario"]');

    await expect(singlePageCard.locator('h3')).toContainText('Single Page Form');
    await expect(singlePageCard.locator('p')).toContainText('Test comprehensive single-page forms');
    await expect(singlePageCard.locator('li').first()).toContainText('All Material field types');
  });

  test('should navigate to multi-page scenario successfully', async ({ page }) => {
    // Click on multi-page scenario - the test id is on the link itself
    await page.locator('[data-testid="multi-page-scenario"]').click();

    // Should navigate to multi-page route
    await expect(page).toHaveURL('http://localhost:4200/multi-page');

    // Should display multi-page demo content - use getByRole to get the specific heading
    await expect(page.getByRole('heading', { name: 'Multi-Page Form Demo' })).toBeVisible();
    await expect(page.locator('dynamic-form')).toBeVisible();
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
