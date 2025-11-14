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
    await page.getByRole('button', { name: 'Dependent Validation' }).click();

    // Wait for tab content to load
    await page.waitForTimeout(300);

    // Test with age under 18 (should show guardian consent)
    await page.getByLabel('Age').fill('16');
    await page.getByLabel('Age').blur(); // Trigger change event

    // Guardian consent should be visible
    await expect(page.getByLabel('Guardian Consent Required')).toBeVisible();

    // Test with age 18 or over (should hide guardian consent)
    await page.getByLabel('Age').clear();
    await page.getByLabel('Age').fill('25');
    await page.getByLabel('Age').blur(); // Trigger change event

    // Guardian consent should not be visible
    await expect(page.getByLabel('Guardian Consent Required')).not.toBeVisible();

    // Test boundary case - exactly 18
    await page.getByLabel('Age').clear();
    await page.getByLabel('Age').fill('18');
    await page.getByLabel('Age').blur(); // Trigger change event

    // Guardian consent should not be visible for 18
    await expect(page.getByLabel('Guardian Consent Required')).not.toBeVisible();

    // Test country/state dropdown logic
    await expect(page.getByLabel('State/Province')).toBeDisabled();

    await page.getByLabel('Country').click();
    await page.getByRole('option', { name: 'United States' }).click();

    // State should be enabled
    await expect(page.getByLabel('State/Province')).toBeEnabled();

    // Select a state
    await page.getByLabel('State/Province').click();
    await page.getByRole('option', { name: 'California' }).click();

    // City should be enabled
    await expect(page.getByLabel('City')).toBeEnabled();

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
