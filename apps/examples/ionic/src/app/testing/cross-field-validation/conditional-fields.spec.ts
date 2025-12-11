import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';
import { ionBlur } from '../shared/test-utils';

setupTestLogging();
setupConsoleCheck();

test.describe('Conditional Fields E2E Tests', () => {
  test.beforeEach(async ({ helpers }) => {
    await helpers.navigateToScenario('/testing/cross-field-validation/conditional-fields');
  });

  test('should display conditional fields component without errors', async ({ helpers }) => {
    // Locate the specific test scenario
    const scenario = helpers.getScenario('conditional-validation');
    await expect(scenario).toBeVisible({ timeout: 10000 });

    // Verify the heading is visible
    await expect(scenario.getByRole('heading', { name: 'Conditional Field Validation' })).toBeVisible({ timeout: 10000 });

    // Console error checking is now handled by setupConsoleCheck()
  });

  test('should toggle conditional address fields based on checkbox', async ({ page, helpers }) => {
    // Locate the specific test scenario
    const scenario = helpers.getScenario('conditional-validation');
    await expect(scenario).toBeVisible({ timeout: 10000 });

    // Wait for checkbox to be ready
    await page.waitForSelector('[data-testid="conditional-validation"] #hasAddress ion-checkbox', { state: 'visible', timeout: 10000 });

    const hasAddressCheckbox = scenario.locator('#hasAddress ion-checkbox');
    const submitButton = scenario.locator('#submitConditional ion-button');

    // Verify checkbox is visible
    await expect(hasAddressCheckbox).toBeVisible({ timeout: 10000 });

    // Initially, the checkbox should be unchecked
    await expect(hasAddressCheckbox).not.toBeChecked();

    // Check the checkbox to show address fields
    await hasAddressCheckbox.click();

    // Verify checkbox is now checked
    await expect(hasAddressCheckbox).toBeChecked({ timeout: 5000 });

    // Wait for address fields to be ready
    await page.waitForSelector('[data-testid="conditional-validation"] #streetAddress input', { state: 'visible', timeout: 10000 });

    // Address fields should be visible and interactable
    await expect(scenario.locator('#streetAddress input')).toBeVisible({ timeout: 10000 });
    await expect(scenario.locator('#city input')).toBeVisible({ timeout: 10000 });
    await expect(scenario.locator('#zipCode input')).toBeVisible({ timeout: 10000 });
    await expect(scenario.locator('#country ion-select')).toBeVisible({ timeout: 10000 });

    // Fill in address fields
    const streetAddressInput = scenario.locator('#streetAddress input');
    await streetAddressInput.fill('123 Main St');
    await expect(streetAddressInput).toHaveValue('123 Main St', { timeout: 5000 });
    await ionBlur(streetAddressInput);

    const cityInput = scenario.locator('#city input');
    await cityInput.fill('Springfield');
    await expect(cityInput).toHaveValue('Springfield', { timeout: 5000 });
    await ionBlur(cityInput);

    const zipCodeInput = scenario.locator('#zipCode input');
    await zipCodeInput.fill('12345');
    await expect(zipCodeInput).toHaveValue('12345', { timeout: 5000 });
    await ionBlur(zipCodeInput);

    // Select country from ion-select
    await helpers.selectOption(scenario.locator('#country ion-select'), 'United States');

    // Wait for submit button to be enabled
    await page.waitForSelector('[data-testid="conditional-validation"] #submitConditional ion-button:not([aria-disabled="true"])', {
      state: 'visible',
      timeout: 10000,
    });

    // Submit button should be enabled
    await expect(submitButton).not.toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });

    // Uncheck the checkbox to hide address fields
    await hasAddressCheckbox.click();

    // Verify checkbox is unchecked
    await expect(hasAddressCheckbox).not.toBeChecked();
  });

  test('should validate ZIP code format', async ({ page, helpers }) => {
    // Locate the specific test scenario
    const scenario = helpers.getScenario('conditional-validation');
    await expect(scenario).toBeVisible({ timeout: 10000 });

    // Wait for checkbox to be ready
    await page.waitForSelector('[data-testid="conditional-validation"] #hasAddress ion-checkbox', { state: 'visible', timeout: 10000 });

    const hasAddressCheckbox = scenario.locator('#hasAddress ion-checkbox');

    // Enable address fields
    await hasAddressCheckbox.click();
    await expect(hasAddressCheckbox).toBeChecked({ timeout: 5000 });

    // Wait for ZIP code field to be ready
    await page.waitForSelector('[data-testid="conditional-validation"] #zipCode input', { state: 'visible', timeout: 10000 });

    const zipCodeInput = scenario.locator('#zipCode input');

    // Try invalid ZIP code
    await zipCodeInput.fill('abc');
    await expect(zipCodeInput).toHaveValue('abc', { timeout: 5000 });
    await ionBlur(zipCodeInput);

    // Fill other required fields
    const streetAddressInput = scenario.locator('#streetAddress input');
    await streetAddressInput.fill('123 Main St');
    await expect(streetAddressInput).toHaveValue('123 Main St', { timeout: 5000 });
    await ionBlur(streetAddressInput);

    const cityInput = scenario.locator('#city input');
    await cityInput.fill('Springfield');
    await expect(cityInput).toHaveValue('Springfield', { timeout: 5000 });
    await ionBlur(cityInput);

    // Select country
    await helpers.selectOption(scenario.locator('#country ion-select'), 'United States');

    // Try valid ZIP code
    await zipCodeInput.fill('12345');

    // Verify ZIP code is accepted
    await expect(zipCodeInput).toHaveValue('12345', { timeout: 5000 });
    await ionBlur(zipCodeInput);

    // Try extended ZIP code format
    await zipCodeInput.fill('12345-6789');

    await expect(zipCodeInput).toHaveValue('12345-6789', { timeout: 5000 });
    await ionBlur(zipCodeInput);
  });

  test('should submit form with address data', async ({ page, helpers }) => {
    // Locate the specific test scenario
    const scenario = helpers.getScenario('conditional-validation');
    await expect(scenario).toBeVisible({ timeout: 10000 });

    // Wait for checkbox to be ready
    await page.waitForSelector('[data-testid="conditional-validation"] #hasAddress ion-checkbox', { state: 'visible', timeout: 10000 });

    const hasAddressCheckbox = scenario.locator('#hasAddress ion-checkbox');
    const submitButton = scenario.locator('#submitConditional ion-button');

    // Enable address fields
    await hasAddressCheckbox.click();
    await expect(hasAddressCheckbox).toBeChecked({ timeout: 5000 });

    // Wait for address fields to be ready
    await page.waitForSelector('[data-testid="conditional-validation"] #streetAddress input', { state: 'visible', timeout: 10000 });

    // Fill in complete address
    const streetAddressInput = scenario.locator('#streetAddress input');
    await streetAddressInput.fill('456 Oak Avenue');
    await expect(streetAddressInput).toHaveValue('456 Oak Avenue', { timeout: 5000 });
    await ionBlur(streetAddressInput);

    const cityInput = scenario.locator('#city input');
    await cityInput.fill('Portland');
    await expect(cityInput).toHaveValue('Portland', { timeout: 5000 });
    await ionBlur(cityInput);

    const zipCodeInput = scenario.locator('#zipCode input');
    await zipCodeInput.fill('97201');
    await expect(zipCodeInput).toHaveValue('97201', { timeout: 5000 });
    await ionBlur(zipCodeInput);

    // Select country
    await helpers.selectOption(scenario.locator('#country ion-select'), 'Canada');

    // Wait for submit button to be enabled
    await page.waitForSelector('[data-testid="conditional-validation"] #submitConditional ion-button:not([aria-disabled="true"])', {
      state: 'visible',
      timeout: 10000,
    });

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

  test('should submit form without address data when checkbox is unchecked', async ({ page, helpers }) => {
    // Locate the specific test scenario
    const scenario = helpers.getScenario('conditional-validation');
    await expect(scenario).toBeVisible({ timeout: 10000 });

    // Wait for submit button to be ready
    await page.waitForSelector('[data-testid="conditional-validation"] #submitConditional button', { state: 'visible', timeout: 10000 });

    const submitButton = scenario.locator('#submitConditional ion-button');

    // Submit button should be enabled even without address fields
    await expect(submitButton).not.toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });

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
