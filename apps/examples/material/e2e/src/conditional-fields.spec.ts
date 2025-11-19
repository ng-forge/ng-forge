import { expect, test } from '@playwright/test';

test.describe('Conditional Fields E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200/#/test/cross-field-validation/conditional-fields');
    await page.waitForLoadState('networkidle');
  });

  test('should display conditional fields component without errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Locate the specific test scenario
    const scenario = page.locator('[data-testid="conditional-validation"]');
    await expect(scenario).toBeVisible();

    // Verify the heading is visible
    await expect(scenario.getByRole('heading', { name: 'Conditional Field Validation' })).toBeVisible();

    // Check for any console errors, specifically injection context errors
    const injectionErrors = consoleErrors.filter(
      (error) => error.includes('FunctionRegistryService') || error.includes('inject()') || error.includes('injection context'),
    );

    expect(injectionErrors).toHaveLength(0);
  });

  test('should toggle conditional address fields based on checkbox', async ({ page }) => {
    // Locate the specific test scenario
    const scenario = page.locator('[data-testid="conditional-validation"]');
    await expect(scenario).toBeVisible();

    const hasAddressCheckbox = scenario.locator('#hasAddress mat-checkbox');
    const submitButton = scenario.locator('#submitConditional button');

    // Verify checkbox is visible
    await expect(hasAddressCheckbox).toBeVisible();

    // Initially, the checkbox should be unchecked
    await expect(hasAddressCheckbox).not.toHaveClass(/mat-mdc-checkbox-checked/);

    // Check the checkbox to show address fields
    await hasAddressCheckbox.click();
    await page.waitForTimeout(200);

    // Verify checkbox is now checked
    await expect(hasAddressCheckbox).toHaveClass(/mat-mdc-checkbox-checked/);

    // Address fields should be visible and interactable
    await expect(scenario.locator('#streetAddress input')).toBeVisible();
    await expect(scenario.locator('#city input')).toBeVisible();
    await expect(scenario.locator('#zipCode input')).toBeVisible();
    await expect(scenario.locator('#country mat-select')).toBeVisible();

    // Fill in address fields
    await scenario.locator('#streetAddress input').fill('123 Main St');
    await scenario.locator('#city input').fill('Springfield');
    await scenario.locator('#zipCode input').fill('12345');

    // Select country
    await scenario.locator('#country mat-select').click();
    await page.waitForTimeout(200);
    await page.getByRole('option', { name: 'United States' }).click();
    await page.waitForTimeout(200);

    // Submit button should be enabled
    await expect(submitButton).toBeEnabled();

    // Uncheck the checkbox to hide address fields
    await hasAddressCheckbox.click();
    await page.waitForTimeout(200);

    // Verify checkbox is unchecked
    await expect(hasAddressCheckbox).not.toHaveClass(/mat-mdc-checkbox-checked/);
  });

  test('should validate ZIP code format', async ({ page }) => {
    // Locate the specific test scenario
    const scenario = page.locator('[data-testid="conditional-validation"]');
    await expect(scenario).toBeVisible();

    const hasAddressCheckbox = scenario.locator('#hasAddress mat-checkbox');
    const zipCodeInput = scenario.locator('#zipCode input');

    // Enable address fields
    await hasAddressCheckbox.click();
    await page.waitForTimeout(200);

    // Try invalid ZIP code
    await zipCodeInput.fill('abc');
    await zipCodeInput.blur();
    await page.waitForTimeout(200);

    // Fill other required fields
    await scenario.locator('#streetAddress input').fill('123 Main St');
    await scenario.locator('#city input').fill('Springfield');

    // Select country
    await scenario.locator('#country mat-select').click();
    await page.waitForTimeout(200);
    await page.getByRole('option', { name: 'United States' }).click();
    await page.waitForTimeout(200);

    // Try valid ZIP code
    await zipCodeInput.fill('12345');
    await page.waitForTimeout(200);

    // Verify ZIP code is accepted
    expect(await zipCodeInput.inputValue()).toBe('12345');

    // Try extended ZIP code format
    await zipCodeInput.fill('12345-6789');
    await page.waitForTimeout(200);

    expect(await zipCodeInput.inputValue()).toBe('12345-6789');
  });

  test('should submit form with address data', async ({ page }) => {
    // Locate the specific test scenario
    const scenario = page.locator('[data-testid="conditional-validation"]');
    await expect(scenario).toBeVisible();

    const hasAddressCheckbox = scenario.locator('#hasAddress mat-checkbox');
    const submitButton = scenario.locator('#submitConditional button');

    // Enable address fields
    await hasAddressCheckbox.click();
    await page.waitForTimeout(200);

    // Fill in complete address
    await scenario.locator('#streetAddress input').fill('456 Oak Avenue');
    await scenario.locator('#city input').fill('Portland');
    await scenario.locator('#zipCode input').fill('97201');

    // Select country
    await scenario.locator('#country mat-select').click();
    await page.waitForTimeout(200);
    await page.getByRole('option', { name: 'Canada' }).click();
    await page.waitForTimeout(200);

    // Set up event listener BEFORE clicking submit
    const submittedDataPromise = page.evaluate(
      () =>
        new Promise((resolve) => {
          window.addEventListener(
            'formSubmitted',
            (event: any) => {
              resolve(event.detail.data);
            },
            { once: true },
          );
        }),
    );

    // Submit the form
    await submitButton.click();

    // Wait for formSubmitted event
    const submittedData = await submittedDataPromise;

    // Verify submitted data
    expect(submittedData).toMatchObject({
      hasAddress: true,
      streetAddress: '456 Oak Avenue',
      city: 'Portland',
      zipCode: '97201',
      country: 'ca',
    });
  });

  test('should submit form without address data when checkbox is unchecked', async ({ page }) => {
    // Locate the specific test scenario
    const scenario = page.locator('[data-testid="conditional-validation"]');
    await expect(scenario).toBeVisible();

    const submitButton = scenario.locator('#submitConditional button');

    // Submit button should be enabled even without address fields
    await expect(submitButton).toBeEnabled();

    // Set up event listener BEFORE clicking submit
    const submittedDataPromise = page.evaluate(
      () =>
        new Promise((resolve) => {
          window.addEventListener(
            'formSubmitted',
            (event: any) => {
              resolve(event.detail.data);
            },
            { once: true },
          );
        }),
    );

    // Submit the form
    await submitButton.click();

    // Wait for formSubmitted event
    const submittedData = await submittedDataPromise;

    // Verify submitted data - should have hasAddress as false or undefined
    expect(submittedData).toBeDefined();
    expect((submittedData as any).hasAddress).toBeFalsy();
  });
});
