import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck();

test.describe('Cross-Field Validation Tests', () => {
  test.beforeEach(async ({ helpers }) => {
    await helpers.navigateToScenario('/test/cross-field-validation');
  });

  test.describe('Password Confirmation Validation', () => {
    test('should validate password matching', async ({ page, helpers }) => {
      await page.goto('/#/test/cross-field-validation/password-validation');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('password-validation');
      await expect(scenario).toBeVisible();

      const submitButton = scenario.locator('#submitPassword button');
      const passwordInput = scenario.locator('#password input');
      const confirmPasswordInput = scenario.locator('#confirmPassword input');
      const emailInput = scenario.locator('#email input');

      // Fill all required fields with matching passwords
      await emailInput.fill('test@example.com');
      await passwordInput.fill('password123');
      await confirmPasswordInput.fill('password123');
      await page.waitForTimeout(300);

      // Submit button should be enabled with all valid fields
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
      await page.goto('/#/test/cross-field-validation/conditional-fields');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('conditional-validation');
      await expect(scenario).toBeVisible();

      const submitButton = scenario.locator('#submitConditional button');
      const hasAddressCheckbox = scenario.locator('#hasAddress mat-checkbox');

      // Submit button should be enabled initially
      await expect(submitButton).toBeEnabled();

      // Submit without address (checkbox not checked)
      await submitButton.click();
      await page.waitForTimeout(500);

      // Verify submission occurred
      const formValue1 = await page.evaluate(() => {
        const pre = document.querySelector('[data-testid="form-value-conditional-validation"]');
        return pre ? JSON.parse(pre.textContent || '{}') : null;
      });

      expect(formValue1).toBeDefined();

      // Check the "has address" checkbox
      await hasAddressCheckbox.click();
      await page.waitForTimeout(300);

      // Fill address fields
      await scenario.locator('#streetAddress input').fill('123 Main Street');
      await scenario.locator('#city input').fill('New York');
      await scenario.locator('#zipCode input').fill('10001');

      // Select country
      await scenario.locator('#country mat-select').click();
      await page.locator('.cdk-overlay-pane mat-option').filter({ hasText: 'United States' }).click();
      await page.waitForTimeout(300);

      // Submit with address information
      await submitButton.click();
      await page.waitForTimeout(500);

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
      await page.goto('/#/test/cross-field-validation/dependent-fields');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('dependent-fields');
      await expect(scenario).toBeVisible();

      const submitButton = scenario.locator('#submitDependent button');
      const categorySelect = scenario.locator('#category mat-select');
      const subcategorySelect = scenario.locator('#subcategory mat-select');
      const productNameInput = scenario.locator('#productName input');
      const priceInput = scenario.locator('#price input');
      const currencySelect = scenario.locator('#currency mat-select');

      // Initially, submit button should be disabled (required fields are empty)
      await expect(submitButton).toBeDisabled();

      // Select electronics category
      await categorySelect.click();
      await page.locator('.cdk-overlay-pane mat-option').filter({ hasText: 'Electronics' }).click();
      await page.waitForTimeout(300);

      // Select laptop subcategory
      await subcategorySelect.click();
      await page.locator('.cdk-overlay-pane mat-option').filter({ hasText: 'Laptop' }).click();
      await page.waitForTimeout(300);

      // Fill product details
      await productNameInput.fill('MacBook Pro 16');
      await priceInput.fill('2499.99');
      await page.waitForTimeout(300);

      // Submit button should now be enabled
      await expect(submitButton).toBeEnabled();

      // Change currency from default USD to EUR
      await currencySelect.click();
      await page.locator('.cdk-overlay-pane mat-option').filter({ hasText: 'EUR' }).click();
      await page.waitForTimeout(300);

      // Submit the form
      await submitButton.click();
      await page.waitForTimeout(500);

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

      // Test changing category and submitting again
      await categorySelect.click();
      await page.locator('.cdk-overlay-pane mat-option').filter({ hasText: 'Clothing' }).click();
      await page.waitForTimeout(300);

      // Change subcategory
      await subcategorySelect.click();
      await page.locator('.cdk-overlay-pane mat-option').filter({ hasText: 'Shirt' }).click();
      await page.waitForTimeout(300);

      // Update product details
      await productNameInput.fill('Cotton T-Shirt');
      await priceInput.fill('29.99');
      await page.waitForTimeout(300);

      // Submit second product
      await submitButton.click();
      await page.waitForTimeout(500);

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
      await page.goto('/#/test/cross-field-validation/enable-disable');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('enable-disable');
      await expect(scenario).toBeVisible();

      const submitButton = scenario.locator('#submitEnableDisable button');
      const standardShippingRadio = scenario.locator('#shippingMethod mat-radio-button').filter({ hasText: 'Standard' });
      const expressShippingRadio = scenario.locator('#shippingMethod mat-radio-button').filter({ hasText: 'Express' });
      const pickupRadio = scenario.locator('#shippingMethod mat-radio-button').filter({ hasText: 'Store Pickup' });

      // Initially, submit button should be disabled (no shipping method selected)
      await expect(submitButton).toBeDisabled();

      // Select standard shipping
      await standardShippingRadio.click();
      await page.waitForTimeout(300);

      // Fill shipping address
      await scenario.locator('#shippingAddress textarea').fill('123 Main St\nAnytown, State 12345');
      await page.waitForTimeout(300);

      // Submit button should now be enabled
      await expect(submitButton).toBeEnabled();

      // Submit with standard shipping
      await submitButton.click();
      await page.waitForTimeout(500);

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
      await expressShippingRadio.click();
      await page.waitForTimeout(300);

      // Fill express instructions
      await scenario.locator('#expressInstructions textarea').fill('Please deliver to back door. Ring doorbell twice.');
      await page.waitForTimeout(300);

      // Submit with express shipping
      await submitButton.click();
      await page.waitForTimeout(500);

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
      await pickupRadio.click();
      await page.waitForTimeout(300);

      // Select pickup location
      await scenario.locator('#storeLocation mat-select').click();
      await page.locator('.cdk-overlay-pane mat-option').filter({ hasText: 'Downtown Store' }).click();
      await page.waitForTimeout(300);

      // Submit with pickup
      await submitButton.click();
      await page.waitForTimeout(500);

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
