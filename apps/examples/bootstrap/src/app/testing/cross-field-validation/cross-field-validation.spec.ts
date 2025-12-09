import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck();

test.describe('Cross-Field Validation Tests', () => {
  test.beforeEach(async ({ helpers }) => {
    await helpers.navigateToScenario('/test/cross-field-validation');
  });

  test.describe('Password Confirmation Validation', () => {
    test('should validate password matching', async ({ page, helpers }) => {
      await page.goto('http://localhost:4204/#/test/cross-field-validation/password-validation');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('password-validation');
      await expect(scenario).toBeVisible();

      const submitButton = scenario.locator('#submitPassword button');
      const passwordInput = scenario.locator('#password input');
      const confirmPasswordInput = scenario.locator('#confirmPassword input');
      const emailInput = scenario.locator('#email input');

      // Wait for fields to be ready
      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();
      await expect(confirmPasswordInput).toBeVisible();

      // Fill all required fields with matching passwords (blur triggers validation)
      await emailInput.fill('test@example.com');
      await emailInput.blur();
      await passwordInput.fill('password123');
      await passwordInput.blur();
      await confirmPasswordInput.fill('password123');
      await confirmPasswordInput.blur();

      // Submit button should be enabled with all valid fields (auto-waiting assertion)
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

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
      await page.goto('http://localhost:4204/#/test/cross-field-validation/conditional-fields');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('conditional-validation');
      await expect(scenario).toBeVisible();

      const submitButton = scenario.locator('#submitConditional button');
      const hasAddressCheckbox = scenario.locator('#hasAddress .form-check input');

      // Wait for checkbox to be ready
      await expect(hasAddressCheckbox).toBeVisible();

      // Submit button should be enabled initially
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

      // Submit without address (checkbox not checked)
      await submitButton.click();

      // Verify submission occurred
      const formValue1 = await page.evaluate(() => {
        const pre = document.querySelector('[data-testid="form-value-conditional-validation"]');
        return pre ? JSON.parse(pre.textContent || '{}') : null;
      });

      expect(formValue1).toBeDefined();

      // Check the "has address" checkbox
      await hasAddressCheckbox.check();

      // Fill address fields (blur triggers validation)
      await scenario.locator('#streetAddress input').fill('123 Main Street');
      await scenario.locator('#streetAddress input').blur();
      await scenario.locator('#city input').fill('New York');
      await scenario.locator('#city input').blur();
      await scenario.locator('#zipCode input').fill('10001');
      await scenario.locator('#zipCode input').blur();

      // Select country from native select (blur triggers validation)
      await scenario.locator('#country select').selectOption({ label: 'United States' });
      await scenario.locator('#country select').blur();

      // Wait for form to be valid
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

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
      await page.goto('http://localhost:4204/#/test/cross-field-validation/dependent-fields');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('dependent-fields');
      await expect(scenario).toBeVisible();

      const submitButton = scenario.locator('#submitDependent button');
      const categorySelect = scenario.locator('#category select');
      const subcategorySelect = scenario.locator('#subcategory select');
      const productNameInput = scenario.locator('#productName input');
      const priceInput = scenario.locator('#price input');
      const currencySelect = scenario.locator('#currency select');

      // Wait for fields to be ready
      await expect(categorySelect).toBeVisible();

      // Initially, submit button should be disabled (required fields are empty)
      await expect(submitButton).toBeDisabled();

      // Select electronics category (blur triggers validation)
      await categorySelect.selectOption({ label: 'Electronics' });
      await categorySelect.blur();

      // Select laptop subcategory (blur triggers validation)
      await subcategorySelect.selectOption({ label: 'Laptop' });
      await subcategorySelect.blur();

      // Fill product details (blur triggers validation)
      await productNameInput.fill('MacBook Pro 16');
      await productNameInput.blur();
      await priceInput.fill('2499.99');
      await priceInput.blur();

      // Submit button should now be enabled
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

      // Change currency from default USD to EUR (blur triggers validation)
      await currencySelect.selectOption({ label: 'EUR' });
      await currencySelect.blur();

      // Submit the form
      await submitButton.click();

      // Verify submission contains all field values
      const formValue = await page.evaluate(() => {
        const pre = document.querySelector('[data-testid="form-value-dependent-fields"]');
        return pre ? JSON.parse(pre.textContent || '{}') : null;
      });

      expect(formValue).toMatchObject({
        category: 'electronics',
        subcategory: 'laptop',
        productName: 'MacBook Pro 16',
        price: 2499.99,
        currency: 'eur',
      });

      // Test changing category and submitting again (blur triggers validation)
      await categorySelect.selectOption({ label: 'Clothing' });
      await categorySelect.blur();

      // Change subcategory (blur triggers validation)
      await subcategorySelect.selectOption({ label: 'Shirt' });
      await subcategorySelect.blur();

      // Update product details (blur triggers validation)
      await productNameInput.fill('Cotton T-Shirt');
      await productNameInput.blur();
      await priceInput.fill('29.99');
      await priceInput.blur();

      // Wait for form to be valid
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

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
        price: 29.99,
      });
    });
  });

  test.describe('Field Enable/Disable', () => {
    test('should handle field enabling/disabling based on selections', async ({ page, helpers }) => {
      await page.goto('http://localhost:4204/#/test/cross-field-validation/enable-disable');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('enable-disable');
      await expect(scenario).toBeVisible();

      const submitButton = scenario.locator('#submitEnableDisable button');
      const standardShippingRadio = scenario.locator('#shippingMethod .form-check input[value="standard"]');
      const expressShippingRadio = scenario.locator('#shippingMethod .form-check input[value="express"]');
      const pickupRadio = scenario.locator('#shippingMethod .form-check input[value="pickup"]');

      // Wait for radio buttons to be ready
      await expect(standardShippingRadio).toBeVisible();

      // Initially, submit button should be disabled (no shipping method selected)
      await expect(submitButton).toBeDisabled();

      // Select standard shipping
      await standardShippingRadio.check();

      // Fill shipping address (blur triggers validation)
      await scenario.locator('#shippingAddress textarea').fill('123 Main St\nAnytown, State 12345');
      await scenario.locator('#shippingAddress textarea').blur();

      // Submit button should now be enabled
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

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
      await expressShippingRadio.check();

      // Fill express instructions (blur triggers validation)
      await scenario.locator('#expressInstructions textarea').fill('Please deliver to back door. Ring doorbell twice.');
      await scenario.locator('#expressInstructions textarea').blur();

      // Wait for form to be valid
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

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
      await pickupRadio.check();

      // Select pickup location (blur triggers validation)
      await scenario.locator('#storeLocation select').selectOption({ label: 'Downtown Store' });
      await scenario.locator('#storeLocation select').blur();

      // Wait for form to be valid
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

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
