import { expect, test } from '@playwright/test';

test.describe('Cross-Field Validation Tests', () => {
  test.describe('Password Confirmation Validation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('http://localhost:4200/test/cross-field-validation/password-validation');
      await page.waitForLoadState('networkidle');
    });

    test('should validate password matching', async ({ page }) => {
      const scenario = page.locator('[data-testid="password-validation"]');
      await expect(scenario).toBeVisible();

      // Test mismatched passwords
      await scenario.locator('#password input').fill('password123');
      await scenario.locator('#confirmPassword input').fill('differentpassword');
      await scenario.locator('#email input').fill('test@example.com');

      // Check form value shows the input
      const formValue = await page.evaluate(() => {
        const pre = document.querySelector('[data-testid="form-value-password-validation"]');
        return pre ? JSON.parse(pre.textContent || '{}') : null;
      });

      expect(formValue).toMatchObject({
        password: 'password123',
        confirmPassword: 'differentpassword',
        email: 'test@example.com',
      });

      // Submit button should be disabled due to password mismatch
      const submitButton = scenario.locator('#submitPassword button');
      await expect(submitButton).toBeDisabled();

      // Test matching passwords
      await scenario.locator('#confirmPassword input').fill('password123');
      await page.waitForTimeout(200);

      // Submit button should now be enabled
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

      // Verify submission appears in UI
      await expect(page.locator('[data-testid="submission-0"]')).toBeVisible();
      await expect(page.locator('[data-testid="submission-0"]')).toContainText('test@example.com');
    });
  });

  test.describe('Conditional Required Fields', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('http://localhost:4200/test/cross-field-validation/conditional-fields');
      await page.waitForLoadState('networkidle');
    });

    test('should handle conditional field requirements', async ({ page }) => {
      const scenario = page.locator('[data-testid="conditional-validation"]');
      await expect(scenario).toBeVisible();

      const submitButton = scenario.locator('#submitConditional button');

      // Initially, submit without address (checkbox not checked)
      await submitButton.click();
      await page.waitForTimeout(500);

      // Verify submission occurred
      const formValue1 = await page.evaluate(() => {
        const pre = document.querySelector('[data-testid="form-value-conditional-validation"]');
        return pre ? JSON.parse(pre.textContent || '{}') : null;
      });

      expect(formValue1).toBeDefined();

      // Check the "has address" checkbox
      await scenario.locator('#hasAddress mat-checkbox').click();
      await page.waitForTimeout(200);

      // Fill address fields
      await scenario.locator('#streetAddress input').fill('123 Main Street');
      await scenario.locator('#city input').fill('New York');
      await scenario.locator('#zipCode input').fill('10001');

      // Select country
      await scenario.locator('#country mat-select').click();
      await page.locator('.cdk-overlay-pane mat-option').filter({ hasText: 'United States' }).click();
      await page.waitForTimeout(200);

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

      // Verify submission appears in UI
      const latestSubmission = page.locator('[data-testid^="submission-"]').last();
      await expect(latestSubmission).toContainText('123 Main Street');
      await expect(latestSubmission).toContainText('New York');
      await expect(latestSubmission).toContainText('10001');
    });
  });

  test.describe('Dependent Select Fields', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('http://localhost:4200/test/cross-field-validation/dependent-fields');
      await page.waitForLoadState('networkidle');
    });

    test('should handle dependent field selections', async ({ page }) => {
      const scenario = page.locator('[data-testid="dependent-fields"]');
      await expect(scenario).toBeVisible();

      const submitButton = scenario.locator('#submitDependent button');

      // Submit should be disabled initially (required fields empty)
      await expect(submitButton).toBeDisabled();

      // Select electronics category
      await scenario.locator('#category mat-select').click();
      await page.locator('.cdk-overlay-pane mat-option').filter({ hasText: 'Electronics' }).click();
      await page.waitForTimeout(200);

      // Select laptop subcategory
      await scenario.locator('#subcategory mat-select').click();
      await page.locator('.cdk-overlay-pane mat-option').filter({ hasText: 'Laptop' }).click();
      await page.waitForTimeout(200);

      // Fill product details
      await scenario.locator('#productName input').fill('MacBook Pro 16');
      await scenario.locator('#price input').fill('2499.99');
      await page.waitForTimeout(200);

      // Submit button should now be enabled
      await expect(submitButton).toBeEnabled();

      // Change currency from default USD to EUR
      await scenario.locator('#currency mat-select').click();
      await page.locator('.cdk-overlay-pane mat-option').filter({ hasText: 'EUR' }).click();
      await page.waitForTimeout(200);

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

      // Verify submission appears in UI
      await expect(page.locator('[data-testid="submission-0"]')).toBeVisible();
      await expect(page.locator('[data-testid="submission-0"]')).toContainText('electronics');
      await expect(page.locator('[data-testid="submission-0"]')).toContainText('laptop');
      await expect(page.locator('[data-testid="submission-0"]')).toContainText('MacBook Pro 16');

      // Test changing category and submitting again
      await scenario.locator('#category mat-select').click();
      await page.locator('.cdk-overlay-pane mat-option').filter({ hasText: 'Clothing' }).click();
      await page.waitForTimeout(200);

      // Change subcategory
      await scenario.locator('#subcategory mat-select').click();
      await page.locator('.cdk-overlay-pane mat-option').filter({ hasText: 'Shirt' }).click();
      await page.waitForTimeout(200);

      // Update product details
      await scenario.locator('#productName input').fill('Cotton T-Shirt');
      await scenario.locator('#price input').fill('29.99');
      await page.waitForTimeout(200);

      // Submit second product
      await submitButton.click();
      await page.waitForTimeout(500);

      // Verify second submission
      await expect(page.locator('[data-testid="submission-1"]')).toBeVisible();
      await expect(page.locator('[data-testid="submission-1"]')).toContainText('clothing');
      await expect(page.locator('[data-testid="submission-1"]')).toContainText('shirt');
      await expect(page.locator('[data-testid="submission-1"]')).toContainText('Cotton T-Shirt');
    });
  });

  test.describe('Field Enable/Disable', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('http://localhost:4200/test/cross-field-validation/enable-disable');
      await page.waitForLoadState('networkidle');
    });

    test('should handle field enabling/disabling based on selections', async ({ page }) => {
      const scenario = page.locator('[data-testid="enable-disable"]');
      await expect(scenario).toBeVisible();

      const submitButton = scenario.locator('#submitEnableDisable button');

      // Submit should be disabled initially (shipping method required)
      await expect(submitButton).toBeDisabled();

      // Select standard shipping
      await scenario.locator('#shippingMethod mat-radio-button').filter({ hasText: 'Standard' }).click();
      await page.waitForTimeout(200);

      // Submit button should now be enabled
      await expect(submitButton).toBeEnabled();

      // Fill shipping address
      await scenario.locator('#shippingAddress textarea').fill('123 Main St\nAnytown, State 12345');

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

      await expect(page.locator('[data-testid="submission-0"]')).toBeVisible();
      await expect(page.locator('[data-testid="submission-0"]')).toContainText('standard');
      await expect(page.locator('[data-testid="submission-0"]')).toContainText('123 Main St');

      // Test express shipping scenario
      await scenario.locator('#shippingMethod mat-radio-button').filter({ hasText: 'Express' }).click();
      await page.waitForTimeout(200);

      // Fill express instructions
      await scenario.locator('#expressInstructions textarea').fill('Please deliver to back door. Ring doorbell twice.');

      // Submit with express shipping
      await submitButton.click();
      await page.waitForTimeout(500);

      // Verify second submission
      await expect(page.locator('[data-testid="submission-1"]')).toBeVisible();
      await expect(page.locator('[data-testid="submission-1"]')).toContainText('express');
      await expect(page.locator('[data-testid="submission-1"]')).toContainText('Ring doorbell twice');

      // Test pickup scenario
      await scenario.locator('#shippingMethod mat-radio-button').filter({ hasText: 'Store Pickup' }).click();
      await page.waitForTimeout(200);

      // Select pickup location
      await scenario.locator('#storeLocation mat-select').click();
      await page.locator('.cdk-overlay-pane mat-option').filter({ hasText: 'Downtown Store' }).click();
      await page.waitForTimeout(200);

      // Clear shipping address since pickup doesn't need it
      await scenario.locator('#shippingAddress textarea').fill('');

      // Submit with pickup
      await submitButton.click();
      await page.waitForTimeout(500);

      // Verify third submission
      await expect(page.locator('[data-testid="submission-2"]')).toBeVisible();
      await expect(page.locator('[data-testid="submission-2"]')).toContainText('pickup');
      await expect(page.locator('[data-testid="submission-2"]')).toContainText('downtown');
    });
  });
});
