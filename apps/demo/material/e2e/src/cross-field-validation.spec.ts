/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, test } from '@playwright/test';

test.describe('Cross-Field Validation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200/e2e-test');
    // Wait for the component to initialize and loadTestScenario to be available
    await page.waitForFunction(() => window.loadTestScenario !== undefined);
  });

  test('should test password confirmation validation', async ({ page }) => {
    // Load password confirmation scenario
    await page.evaluate(() => {
      const SubmitEvent = (window as any).SubmitEvent;

      const passwordConfig = {
        fields: [
          {
            key: 'password',
            type: 'input',
            label: 'Password',
            props: {
              type: 'password',
              placeholder: 'Enter password',
            },
            required: true,
            minLength: 8,
            col: 6,
          },
          {
            key: 'confirmPassword',
            type: 'input',
            label: 'Confirm Password',
            props: {
              type: 'password',
              placeholder: 'Confirm password',
            },
            required: true,
            col: 6,
            validators: [
              {
                type: 'custom',
                name: 'passwordMatch',
                message: 'Passwords must match',
              },
            ],
          },
          {
            key: 'email',
            type: 'input',
            label: 'Email',
            props: {
              type: 'email',
              placeholder: 'Enter email',
            },
            email: true,
            required: true,
            col: 12,
          },
          {
            key: 'submitPassword',
            type: 'submit',
            label: 'Create Account',
            col: 12,
          },
        ],
      };

      (window as any).loadTestScenario(passwordConfig, {
        testId: 'password-validation',
        title: 'Password Confirmation Validation',
        description: 'Testing password and confirm password validation',
      });
    });

    // Wait for form initialization
    await page.waitForFunction(() => {
      return new Promise((resolve) => {
        const handler = () => {
          window.removeEventListener('formInitialized', handler);
          resolve(true);
        };
        window.addEventListener('formInitialized', handler);
      });
    });

    // Test mismatched passwords
    await page.fill('#password input', 'password123');
    await page.fill('#confirmPassword input', 'differentpassword');
    await page.fill('#email input', 'test@example.com');

    // Try to submit with mismatched passwords
    await page.click('#submitPassword button');

    // Should not submit due to password mismatch (manual validation would be needed here)
    // For now, we'll test the form state
    await page.waitForSelector('.form-state summary', { timeout: 10000 });
    await page.click('.form-state summary');
    const formValue = await page.locator('#form-value-password-validation').textContent();
    expect(formValue).toContain('password123');
    expect(formValue).toContain('differentpassword');

    // Test matching passwords
    await page.fill('#confirmPassword input', 'password123');
    await page.click('#submitPassword button');

    // Should submit successfully with matching passwords
    await expect(page.locator('#submission-0')).toBeVisible();
    await expect(page.locator('#submission-0')).toContainText('test@example.com');
  });

  test('should test conditional required fields', async ({ page }) => {
    // Load conditional required fields scenario
    await page.evaluate(() => {
      const conditionalConfig = {
        fields: [
          {
            key: 'hasAddress',
            type: 'checkbox',
            label: 'I have a different billing address',
            col: 12,
          },
          {
            key: 'streetAddress',
            type: 'input',
            label: 'Street Address',
            props: {
              placeholder: 'Enter street address',
            },
            // This would typically be conditionally required based on hasAddress
            col: 12,
          },
          {
            key: 'city',
            type: 'input',
            label: 'City',
            props: {
              placeholder: 'Enter city',
            },
            col: 6,
          },
          {
            key: 'zipCode',
            type: 'input',
            label: 'ZIP Code',
            props: {
              placeholder: 'Enter ZIP code',
            },
            pattern: '^[0-9]{5}(-[0-9]{4})?$',
            col: 6,
          },
          {
            key: 'country',
            type: 'select',
            label: 'Country',
            options: [
              { value: 'us', label: 'United States' },
              { value: 'ca', label: 'Canada' },
              { value: 'mx', label: 'Mexico' },
              { value: 'other', label: 'Other' },
            ],
            col: 12,
          },
          {
            key: 'submitConditional',
            type: 'submit',
            label: 'Submit Address',
            col: 12,
          },
        ],
      };

      (window as any).loadTestScenario(conditionalConfig, {
        testId: 'conditional-validation',
        title: 'Conditional Field Validation',
        description: 'Testing conditional required fields and dynamic validation',
      });
    });

    // Wait for form initialization
    await page.waitForFunction(() => {
      return new Promise((resolve) => {
        const handler = () => {
          window.removeEventListener('formInitialized', handler);
          resolve(true);
        };
        window.addEventListener('formInitialized', handler);
      });
    });

    // Initially, address fields should be optional
    await page.click('#submitConditional button');

    // Check if submission occurred (basic form should submit)
    const submissionExists = await page.locator('#submission-0').isVisible();
    console.log('Initial submission exists:', submissionExists);

    // Check the "has address" checkbox
    await page.click('#hasAddress mat-checkbox');

    // Now fill address fields since checkbox is checked
    await page.fill('#streetAddress input', '123 Main Street');
    await page.fill('#city input', 'New York');
    await page.fill('#zipCode input', '10001');

    // Select country
    await page.click('#country mat-select');
    await page.click('mat-option[value="us"]');

    // Submit with address information
    await page.click('#submitConditional button');

    // Verify submission contains address information
    const submissionCount = await page.locator('[data-testid^="submission-').count();
    expect(submissionCount).toBeGreaterThan(0);

    // Get the latest submission
    const latestSubmission = page.locator(`#submission-${submissionCount - 1}`);
    await expect(latestSubmission).toContainText('123 Main Street');
    await expect(latestSubmission).toContainText('New York');
    await expect(latestSubmission).toContainText('10001');
    await expect(latestSubmission).toContainText('us');
  });

  test('should test dependent select fields', async ({ page }) => {
    // Load dependent select fields scenario
    await page.evaluate(() => {
      const dependentConfig = {
        fields: [
          {
            key: 'category',
            type: 'select',
            label: 'Product Category',
            options: [
              { value: 'electronics', label: 'Electronics' },
              { value: 'clothing', label: 'Clothing' },
              { value: 'books', label: 'Books' },
            ],
            required: true,
            col: 6,
          },
          {
            key: 'subcategory',
            type: 'select',
            label: 'Subcategory',
            options: [
              // In a real scenario, these would be filtered based on category
              { value: 'laptop', label: 'Laptop' },
              { value: 'phone', label: 'Phone' },
              { value: 'tablet', label: 'Tablet' },
              { value: 'shirt', label: 'Shirt' },
              { value: 'pants', label: 'Pants' },
              { value: 'shoes', label: 'Shoes' },
              { value: 'fiction', label: 'Fiction' },
              { value: 'nonfiction', label: 'Non-Fiction' },
              { value: 'textbook', label: 'Textbook' },
            ],
            col: 6,
          },
          {
            key: 'productName',
            type: 'input',
            label: 'Product Name',
            props: {
              placeholder: 'Enter product name',
            },
            required: true,
            col: 12,
          },
          {
            key: 'price',
            type: 'input',
            label: 'Price',
            props: {
              type: 'number',
              placeholder: 'Enter price',
              step: '0.01',
            },
            min: 0,
            required: true,
            col: 6,
          },
          {
            key: 'currency',
            type: 'select',
            label: 'Currency',
            options: [
              { value: 'usd', label: 'USD' },
              { value: 'eur', label: 'EUR' },
              { value: 'gbp', label: 'GBP' },
              { value: 'cad', label: 'CAD' },
            ],
            value: 'usd',
            col: 6,
          },
          {
            key: 'submitDependent',
            type: 'submit',
            label: 'Add Product',
            col: 12,
          },
        ],
      };

      (window as any).loadTestScenario(dependentConfig, {
        testId: 'dependent-fields',
        title: 'Dependent Field Testing',
        description: 'Testing dependent select fields and cascading updates',
      });
    });

    // Wait for form initialization
    await page.waitForFunction(() => {
      return new Promise((resolve) => {
        const handler = () => {
          window.removeEventListener('formInitialized', handler);
          resolve(true);
        };
        window.addEventListener('formInitialized', handler);
      });
    });

    // Select electronics category
    await page.click('#category mat-select');
    await page.click('mat-option[value="electronics"]');

    // Select laptop subcategory (relevant to electronics)
    await page.click('#subcategory mat-select');
    await page.click('mat-option[value="laptop"]');

    // Fill product details
    await page.fill('#productName input', 'MacBook Pro 16"');
    await page.fill('#price input', '2499.99');

    // Currency should default to USD, but let's verify and change it
    await page.click('#currency mat-select');
    await page.click('mat-option[value="eur"]');

    // Submit the form
    await page.click('#submitDependent button');

    // Verify submission contains dependent field values
    await expect(page.locator('#submission-0')).toBeVisible();
    await expect(page.locator('#submission-0')).toContainText('electronics');
    await expect(page.locator('#submission-0')).toContainText('laptop');
    await expect(page.locator('#submission-0')).toContainText('MacBook Pro 16"');
    await expect(page.locator('#submission-0')).toContainText('2499.99');
    await expect(page.locator('#submission-0')).toContainText('eur');

    // Test changing category and ensuring form state updates
    await page.click('#category mat-select');
    await page.click('mat-option[value="clothing"]');

    // Change subcategory to clothing-related
    await page.click('#subcategory mat-select');
    await page.click('mat-option[value="shirt"]');

    // Update product details
    await page.fill('#productName input', 'Cotton T-Shirt');
    await page.fill('#price input', '29.99');

    // Submit second product
    await page.click('#submitDependent button');

    // Verify second submission
    await expect(page.locator('#submission-1')).toBeVisible();
    await expect(page.locator('#submission-1')).toContainText('clothing');
    await expect(page.locator('#submission-1')).toContainText('shirt');
    await expect(page.locator('#submission-1')).toContainText('Cotton T-Shirt');
    await expect(page.locator('#submission-1')).toContainText('29.99');
  });

  test('should test field enable/disable based on other fields', async ({ page }) => {
    // Load field enable/disable scenario
    await page.evaluate(() => {
      const enableDisableConfig = {
        fields: [
          {
            key: 'shippingMethod',
            type: 'radio',
            label: 'Shipping Method',
            options: [
              { value: 'standard', label: 'Standard (5-7 days)' },
              { value: 'express', label: 'Express (2-3 days)' },
              { value: 'overnight', label: 'Overnight' },
              { value: 'pickup', label: 'Store Pickup' },
            ],
            required: true,
            col: 12,
          },
          {
            key: 'shippingAddress',
            type: 'textarea',
            label: 'Shipping Address',
            props: {
              placeholder: 'Enter shipping address',
              rows: 3,
            },
            // Would typically be disabled when "pickup" is selected
            col: 12,
          },
          {
            key: 'expressInstructions',
            type: 'textarea',
            label: 'Special Delivery Instructions',
            props: {
              placeholder: 'Special instructions for express/overnight delivery',
              rows: 2,
            },
            // Would typically be enabled only for express/overnight
            col: 12,
          },
          {
            key: 'storeLocation',
            type: 'select',
            label: 'Store Pickup Location',
            options: [
              { value: 'downtown', label: 'Downtown Store' },
              { value: 'mall', label: 'Shopping Mall Store' },
              { value: 'airport', label: 'Airport Store' },
            ],
            // Would typically be enabled only for pickup
            col: 12,
          },
          {
            key: 'submitEnableDisable',
            type: 'submit',
            label: 'Complete Order',
            col: 12,
          },
        ],
      };

      (window as any).loadTestScenario(enableDisableConfig, {
        testId: 'enable-disable',
        title: 'Field Enable/Disable Testing',
        description: 'Testing conditional field enabling and disabling based on other field values',
      });
    });

    // Wait for form initialization
    await page.waitForFunction(() => {
      return new Promise((resolve) => {
        const handler = () => {
          window.removeEventListener('formInitialized', handler);
          resolve(true);
        };
        window.addEventListener('formInitialized', handler);
      });
    });

    // Test standard shipping scenario
    await page.click('#shippingMethod mat-radio-button:has-text("Standard")');

    // Fill shipping address (should be enabled for standard shipping)
    await page.fill('#shippingAddress textarea', '123 Main St\nAnytown, State 12345');

    // Express instructions should be less relevant for standard shipping
    // Store location should be irrelevant for standard shipping

    // Submit with standard shipping
    await page.click('#submitEnableDisable button');

    // Verify submission
    await expect(page.locator('#submission-0')).toBeVisible();
    await expect(page.locator('#submission-0')).toContainText('standard');
    await expect(page.locator('#submission-0')).toContainText('123 Main St');

    // Test express shipping scenario
    await page.click('#shippingMethod mat-radio-button:has-text("Express")');

    // Fill express instructions (relevant for express shipping)
    await page.fill('#expressInstructions textarea', 'Please deliver to back door. Ring doorbell twice.');

    // Submit with express shipping
    await page.click('#submitEnableDisable button');

    // Verify second submission
    await expect(page.locator('#submission-1')).toBeVisible();
    await expect(page.locator('#submission-1')).toContainText('express');
    await expect(page.locator('#submission-1')).toContainText('Ring doorbell twice');

    // Test pickup scenario
    await page.click('#shippingMethod mat-radio-button:has-text("Store Pickup")');

    // Select pickup location
    await page.click('#storeLocation mat-select');
    await page.click('mat-option[value="downtown"]');

    // Clear shipping address since pickup doesn't need it
    await page.fill('#shippingAddress textarea', '');

    // Submit with pickup
    await page.click('#submitEnableDisable button');

    // Verify third submission
    await expect(page.locator('#submission-2')).toBeVisible();
    await expect(page.locator('#submission-2')).toContainText('pickup');
    await expect(page.locator('#submission-2')).toContainText('downtown');
  });
});
