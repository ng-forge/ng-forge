import { expect, test } from '@playwright/test';

test.describe('Conditional Fields Test', () => {
  test('should load conditional fields without injection errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate to cross-field validation
    await page.goto('http://localhost:4200/cross-field-validation');

    // Click on Conditional Fields tab
    await page.getByRole('button', { name: 'Conditional Fields' }).click();

    // Wait for tab content to load
    await page.waitForTimeout(300);

    // Check if radio buttons are visible (this would trigger the injection error if present)
    await expect(page.getByText('Do you have an existing account?')).toBeVisible();
    await expect(page.getByText('Yes, I have an account')).toBeVisible();
    await expect(page.getByText('No, I need to create one')).toBeVisible();

    // Try to interact with radio buttons to trigger logic
    await page.getByLabel('Yes, I have an account').check();

    // Wait for conditional logic to apply
    await page.waitForTimeout(200);

    // Check if conditional fields appear
    await expect(page.getByLabel('Login Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();

    // Switch to other option
    await page.getByLabel('No, I need to create one').check();

    // Wait for conditional logic to apply
    await page.waitForTimeout(200);

    // Check if different fields appear
    await expect(page.getByLabel('First Name')).toBeVisible();
    await expect(page.getByLabel('Last Name')).toBeVisible();
    await expect(page.getByLabel('Email Address')).toBeVisible();

    // Check for any console errors, specifically injection context errors
    const injectionErrors = consoleErrors.filter(
      (error) => error.includes('FunctionRegistryService') || error.includes('inject()') || error.includes('injection context'),
    );

    expect(injectionErrors).toHaveLength(0);
  });
});
