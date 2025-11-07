import { expect, test } from '@playwright/test';

test.describe('Age-Based Logic Test', () => {
  test('should show/hide guardian consent based on age', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate to cross-field validation
    await page.goto('http://localhost:4200/cross-field-validation');

    // Click on Dependent Validation tab
    await page.getByText('Dependent Validation').click();

    // Wait for tab content to load
    await page.waitForTimeout(1000);

    // Test with age under 18 (should show guardian consent) - using ID selectors
    await page.locator('#age input').fill('16');
    await page.waitForTimeout(500);

    // Guardian consent should be visible
    await expect(page.locator('#guardianConsent')).toBeVisible();

    // Test with age 18 or over (should hide guardian consent)
    await page.locator('#age input').clear();
    await page.locator('#age input').fill('25');
    await page.locator('#age input').blur(); // Trigger change event
    await page.waitForTimeout(1000);

    // Guardian consent should not be visible
    await expect(page.locator('#guardianConsent')).not.toBeVisible();

    // Test boundary case - exactly 18
    await page.locator('#age input').clear();
    await page.locator('#age input').fill('18');
    await page.locator('#age input').blur(); // Trigger change event
    await page.waitForTimeout(1000);

    // Guardian consent should not be visible for 18
    await expect(page.locator('#guardianConsent')).not.toBeVisible();

    // Test country/state dropdown logic using ID selectors
    await page.locator('#country mat-select').click();
    await page.locator('mat-option[value="us"]').click();
    await page.waitForTimeout(500);

    // State should be enabled
    await expect(page.locator('#state mat-select')).toBeEnabled();

    // Select a state
    await page.locator('#state mat-select').click();
    await page.locator('mat-option[value="ca"]').click();
    await page.waitForTimeout(500);

    // City should be enabled
    await expect(page.locator('#city input')).toBeEnabled();

    // Check for any console errors
    const jsErrors = consoleErrors.filter(
      (error) =>
        error.includes('FunctionRegistryService') ||
        error.includes('inject()') ||
        error.includes('injection context') ||
        error.includes('ERROR')
    );

    expect(jsErrors).toHaveLength(0);
  });
});
