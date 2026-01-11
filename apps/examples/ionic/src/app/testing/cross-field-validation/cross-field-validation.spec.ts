import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';
import { ionBlur } from '../shared/test-utils';

setupTestLogging();
setupConsoleCheck();

test.describe('Cross-Field Validation Tests', () => {
  test.beforeEach(async ({ helpers }) => {
    await helpers.navigateToScenario('/testing/cross-field-validation');
  });

  test.describe('Password Confirmation Validation', () => {
    test('should validate password matching', async ({ page, helpers }) => {
      await page.goto('/#/cross-field-validation/password-validation');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('password-validation');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for fields to be ready
      await page.waitForSelector('[data-testid="password-validation"] #email input', { state: 'visible', timeout: 10000 });

      const submitButton = scenario.locator('#submitPassword ion-button');
      const passwordInput = scenario.locator('#password input');
      const confirmPasswordInput = scenario.locator('#confirmPassword input');
      const emailInput = scenario.locator('#email input');

      // Wait for fields to be ready
      await expect(emailInput).toBeVisible({ timeout: 10000 });
      await expect(passwordInput).toBeVisible({ timeout: 10000 });
      await expect(confirmPasswordInput).toBeVisible({ timeout: 10000 });

      // Fill all required fields with matching passwords (blur triggers validation)
      await emailInput.fill('test@example.com');
      await expect(emailInput).toHaveValue('test@example.com', { timeout: 5000 });
      await ionBlur(emailInput);

      await passwordInput.fill('password123');
      await expect(passwordInput).toHaveValue('password123', { timeout: 5000 });
      await ionBlur(passwordInput);

      await confirmPasswordInput.fill('password123');
      await expect(confirmPasswordInput).toHaveValue('password123', { timeout: 5000 });
      await ionBlur(confirmPasswordInput);

      // Wait for submit button to be enabled
      await page.waitForSelector('[data-testid="password-validation"] #submitPassword ion-button:not([aria-disabled="true"])', {
        state: 'visible',
        timeout: 10000,
      });

      // Submit button should be enabled with all valid fields (auto-waiting assertion)
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

      // Verify submitted data
      expect(submittedData).toMatchObject({
        password: 'password123',
        confirmPassword: 'password123',
        email: 'test@example.com',
      });

      // Verify form value shows the submitted data
      const formValue = await page.evaluate(() => {
        const pre = document.querySelector('[data-testid="form-value-password-validation"]');
        return pre ? JSON.parse(pre.textContent || '{}') : null;
      });

      expect(formValue).toMatchObject({
        password: 'password123',
        confirmPassword: 'password123',
        email: 'test@example.com',
      });
    });
  });

  test.describe('Conditional Required Fields', () => {
    test('should handle conditional field requirements', async ({ page, helpers }) => {
      await page.goto('/#/cross-field-validation/conditional-fields');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('conditional-validation');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for checkbox to be ready
      await page.waitForSelector('[data-testid="conditional-validation"] #hasAddress ion-checkbox', {
        state: 'visible',
        timeout: 10000,
      });

      const submitButton = scenario.locator('#submitConditional ion-button');
      const hasAddressCheckbox = scenario.locator('#hasAddress ion-checkbox');

      // Wait for checkbox to be ready
      await expect(hasAddressCheckbox).toBeVisible({ timeout: 10000 });

      // Submit button should be enabled initially
      await expect(submitButton).not.toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });

      // Submit without address (checkbox not checked)
      await submitButton.click();

      // Verify submission occurred
      const formValue1 = await page.evaluate(() => {
        const pre = document.querySelector('[data-testid="form-value-conditional-validation"]');
        return pre ? JSON.parse(pre.textContent || '{}') : null;
      });

      expect(formValue1).toBeDefined();

      // Check the "has address" checkbox
      await helpers.checkIonCheckbox(hasAddressCheckbox);
      await expect(hasAddressCheckbox).toBeChecked({ timeout: 5000 });

      // Wait for address fields to be ready
      await page.waitForSelector('[data-testid="conditional-validation"] #streetAddress input', { state: 'visible', timeout: 10000 });

      // Fill address fields (blur triggers validation)
      const streetAddressInput = scenario.locator('#streetAddress input');
      await streetAddressInput.fill('123 Main Street');
      await expect(streetAddressInput).toHaveValue('123 Main Street', { timeout: 5000 });
      await ionBlur(streetAddressInput);

      const cityInput = scenario.locator('#city input');
      await cityInput.fill('New York');
      await expect(cityInput).toHaveValue('New York', { timeout: 5000 });
      await ionBlur(cityInput);

      const zipCodeInput = scenario.locator('#zipCode input');
      await zipCodeInput.fill('10001');
      await expect(zipCodeInput).toHaveValue('10001', { timeout: 5000 });
      await ionBlur(zipCodeInput);

      // Select country from ion-select
      await helpers.selectOption(scenario.locator('#country ion-select'), 'United States');

      // Wait for submit button to be enabled
      await page.waitForSelector('[data-testid="conditional-validation"] #submitConditional ion-button:not([aria-disabled="true"])', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for form to be valid
      await expect(submitButton).not.toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });

      // Submit with address information
      await submitButton.click();

      // Verify form value contains address data
      const formValue2 = await page.evaluate(() => {
        const pre = document.querySelector('[data-testid="form-value-conditional-validation"]');
        return pre ? JSON.parse(pre.textContent || '{}') : null;
      });

      expect(formValue2).toMatchObject({
        hasAddress: true,
        streetAddress: '123 Main Street',
        city: 'New York',
        zipCode: '10001',
        country: 'us',
      });
    });
  });

  test.describe('Dependent Select Fields', () => {
    test('should handle dependent field selections', async ({ page, helpers }) => {
      await page.goto('/#/cross-field-validation/dependent-fields');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('dependent-fields');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for category select to be ready
      await page.waitForSelector('[data-testid="dependent-fields"] #category ion-select', { state: 'visible', timeout: 10000 });

      const submitButton = scenario.locator('#submitDependent ion-button');
      const categorySelect = scenario.locator('#category ion-select');
      const subcategorySelect = scenario.locator('#subcategory ion-select');
      const productNameInput = scenario.locator('#productName input');
      const priceInput = scenario.locator('#price input');
      const currencySelect = scenario.locator('#currency ion-select');

      // Wait for fields to be ready
      await expect(categorySelect).toBeVisible({ timeout: 10000 });

      // Initially, submit button should be disabled (required fields are empty)
      await expect(submitButton).toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });

      // Select electronics category
      await helpers.selectOption(categorySelect, 'Electronics');

      // Select laptop subcategory
      await helpers.selectOption(subcategorySelect, 'Laptop');

      // Wait for product name field to be ready
      await page.waitForSelector('[data-testid="dependent-fields"] #productName input', { state: 'visible', timeout: 10000 });

      // Fill product details (blur triggers validation)
      await productNameInput.fill('MacBook Pro 16');
      await expect(productNameInput).toHaveValue('MacBook Pro 16', { timeout: 5000 });
      await ionBlur(productNameInput);

      await priceInput.fill('2499.99');
      await expect(priceInput).toHaveValue('2499.99', { timeout: 5000 });
      await ionBlur(priceInput);

      // Wait for submit button to be enabled
      await page.waitForSelector('[data-testid="dependent-fields"] #submitDependent ion-button:not([aria-disabled="true"])', {
        state: 'visible',
        timeout: 10000,
      });

      // Submit button should now be enabled
      await expect(submitButton).not.toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });

      // Change currency from default USD to EUR
      await helpers.selectOption(currencySelect, 'EUR');

      // Submit the form
      await submitButton.click();

      // Verify submission contains all field values
      const formValue = await page.evaluate(() => {
        const pre = document.querySelector('[data-testid="form-value-dependent-fields"]');
        return pre ? JSON.parse(pre.textContent || '{}') : null;
      });

      // Signal Forms with type=number returns numeric value
      expect(formValue).toMatchObject({
        category: 'electronics',
        subcategory: 'laptop',
        productName: 'MacBook Pro 16',
        price: 2499.99,
        currency: 'eur',
      });

      // Test changing category and submitting again
      await helpers.selectOption(categorySelect, 'Clothing');

      // Change subcategory
      await helpers.selectOption(subcategorySelect, 'Shirt');

      // Update product details (blur triggers validation)
      await productNameInput.fill('Cotton T-Shirt');
      await expect(productNameInput).toHaveValue('Cotton T-Shirt', { timeout: 5000 });
      await ionBlur(productNameInput);

      await priceInput.fill('29.99');
      await expect(priceInput).toHaveValue('29.99', { timeout: 5000 });
      await ionBlur(priceInput);

      // Wait for submit button to be enabled
      await page.waitForSelector('[data-testid="dependent-fields"] #submitDependent ion-button:not([aria-disabled="true"])', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for form to be valid
      await expect(submitButton).not.toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });

      // Submit second product
      await submitButton.click();

      // Verify second submission
      const formValue2 = await page.evaluate(() => {
        const pre = document.querySelector('[data-testid="form-value-dependent-fields"]');
        return pre ? JSON.parse(pre.textContent || '{}') : null;
      });

      expect(formValue2).toMatchObject({
        category: 'clothing',
        subcategory: 'shirt',
        productName: 'Cotton T-Shirt',
        price: 29.99, // Signal Forms with type=number returns numeric value
      });
    });
  });

  test.describe('Field Enable/Disable', () => {
    test('should handle field enabling/disabling based on selections', async ({ page, helpers }) => {
      await page.goto('/#/cross-field-validation/enable-disable');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('enable-disable');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for radio buttons to be ready
      await page.waitForSelector('[data-testid="enable-disable"] #shippingMethod', { state: 'visible', timeout: 10000 });

      const submitButton = scenario.locator('#submitEnableDisable ion-button');

      // Wait for radio buttons to be ready
      await expect(scenario.locator('#shippingMethod')).toBeVisible({ timeout: 10000 });

      // Initially, submit button should be disabled (no shipping method selected)
      await expect(submitButton).toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });

      // Select standard shipping
      await helpers.selectRadio(scenario, 'shippingMethod', 'Standard (5-7 days)');

      // Wait for shipping address field to be ready
      await page.waitForSelector('[data-testid="enable-disable"] #shippingAddress textarea', { state: 'visible', timeout: 10000 });

      // Fill shipping address (blur triggers validation)
      const shippingAddressTextarea = scenario.locator('#shippingAddress textarea');
      await shippingAddressTextarea.fill('123 Main St\nAnytown, State 12345');
      await expect(shippingAddressTextarea).toHaveValue('123 Main St\nAnytown, State 12345', { timeout: 5000 });
      await ionBlur(shippingAddressTextarea);

      // Wait for submit button to be enabled
      await page.waitForSelector('[data-testid="enable-disable"] #submitEnableDisable ion-button:not([aria-disabled="true"])', {
        state: 'visible',
        timeout: 10000,
      });

      // Submit button should now be enabled
      await expect(submitButton).not.toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });

      // Submit with standard shipping
      await submitButton.click();

      // Verify submission
      const formValue1 = await page.evaluate(() => {
        const pre = document.querySelector('[data-testid="form-value-enable-disable"]');
        return pre ? JSON.parse(pre.textContent || '{}') : null;
      });

      expect(formValue1).toMatchObject({
        shippingMethod: 'standard',
        shippingAddress: '123 Main St\nAnytown, State 12345',
      });

      // Test express shipping scenario
      await helpers.selectRadio(scenario, 'shippingMethod', 'Express (2-3 days)');

      // Wait for express instructions field to be ready
      await page.waitForSelector('[data-testid="enable-disable"] #expressInstructions textarea', { state: 'visible', timeout: 10000 });

      // Fill express instructions (blur triggers validation)
      const expressInstructionsTextarea = scenario.locator('#expressInstructions textarea');
      await expressInstructionsTextarea.fill('Please deliver to back door. Ring doorbell twice.');
      await expect(expressInstructionsTextarea).toHaveValue('Please deliver to back door. Ring doorbell twice.', { timeout: 5000 });
      await ionBlur(expressInstructionsTextarea);

      // Wait for submit button to be enabled
      await page.waitForSelector('[data-testid="enable-disable"] #submitEnableDisable ion-button:not([aria-disabled="true"])', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for form to be valid
      await expect(submitButton).not.toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });

      // Submit with express shipping
      await submitButton.click();

      // Verify second submission
      const formValue2 = await page.evaluate(() => {
        const pre = document.querySelector('[data-testid="form-value-enable-disable"]');
        return pre ? JSON.parse(pre.textContent || '{}') : null;
      });

      expect(formValue2).toMatchObject({
        shippingMethod: 'express',
      });
      expect(formValue2).toHaveProperty('expressInstructions');

      // Test pickup scenario
      await helpers.selectRadio(scenario, 'shippingMethod', 'Store Pickup');

      // Wait for store location field to be ready
      await page.waitForSelector('[data-testid="enable-disable"] #storeLocation ion-select', { state: 'visible', timeout: 10000 });

      // Select pickup location
      await helpers.selectOption(scenario.locator('#storeLocation ion-select'), 'Downtown Store');

      // Wait for submit button to be enabled
      await page.waitForSelector('[data-testid="enable-disable"] #submitEnableDisable ion-button:not([aria-disabled="true"])', {
        state: 'visible',
        timeout: 10000,
      });

      // Wait for form to be valid
      await expect(submitButton).not.toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });

      // Submit with pickup
      await submitButton.click();

      // Verify third submission
      const formValue3 = await page.evaluate(() => {
        const pre = document.querySelector('[data-testid="form-value-enable-disable"]');
        return pre ? JSON.parse(pre.textContent || '{}') : null;
      });

      expect(formValue3).toMatchObject({
        shippingMethod: 'pickup',
        storeLocation: 'downtown',
      });
    });
  });
});
