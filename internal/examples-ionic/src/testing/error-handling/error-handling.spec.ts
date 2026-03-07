import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';
import { ionBlur } from '../shared/test-utils';

setupTestLogging();
setupConsoleCheck({
  ignorePatterns: [/Failed to load component for field type/i],
});

test.describe('Error Handling and Edge Cases', () => {
  test.beforeEach(async ({ helpers }) => {
    await helpers.navigateToScenario('/testing/error-handling');
  });

  test.describe('Invalid Configuration Handling', () => {
    test('should handle invalid field configurations gracefully', async ({ page, helpers }) => {
      // Navigate to invalid config test
      await page.goto('/#/testing/error-handling/invalid-config');
      await page.waitForLoadState('domcontentloaded');

      // Locate the specific test scenario with extended timeout for slower browsers
      const scenario = helpers.getScenario('invalid-config');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for field to be ready
      await page.waitForSelector('[data-testid="invalid-config"] #validField input', { state: 'visible', timeout: 10000 });

      // Verify that valid fields still render even if invalid ones fail
      const validField = scenario.locator('#validField input');
      await expect(validField).toBeVisible({ timeout: 10000 });

      // Interact with valid field (blur triggers validation)
      await validField.fill('Test data');
      await expect(validField).toHaveValue('Test data', { timeout: 5000 });
      await ionBlur(validField);

      // Wait for button to be enabled
      await page.waitForSelector('[data-testid="invalid-config"] #submitInvalid ion-button:not([aria-disabled="true"])', {
        state: 'visible',
        timeout: 10000,
      });

      // Submit button should be visible and clickable
      const submitButton = scenario.locator('#submitInvalid ion-button');
      await expect(submitButton).toBeVisible({ timeout: 10000 });
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

      // Verify submitted data contains valid field
      expect(submittedData).toHaveProperty('validField', 'Test data');

      // Verify page title is correct
      const pageTitle = await scenario.locator('h2').textContent();
      expect(pageTitle).toBe('Invalid Configuration Test');
    });
  });

  test.describe('Basic Form Functionality', () => {
    test('should handle form submission without errors', async ({ page, helpers }) => {
      // Navigate to basic test
      await page.goto('/#/testing/error-handling/basic-test');
      await page.waitForLoadState('networkidle');

      // Locate the specific test scenario
      const scenario = helpers.getScenario('basic-test');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for fields to be ready
      await page.waitForSelector('[data-testid="basic-test"] #firstName input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="basic-test"] #lastName input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="basic-test"] #email input', { state: 'visible', timeout: 10000 });

      const firstNameInput = scenario.locator('#firstName input');
      const lastNameInput = scenario.locator('#lastName input');
      const emailInput = scenario.locator('#email input');
      await expect(firstNameInput).toBeVisible({ timeout: 10000 });

      // Submit button should be disabled initially (form invalid)
      const submitButton = scenario.locator('#submit ion-button');
      await expect(submitButton).toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });

      // Fill form with valid data (blur triggers validation)
      await firstNameInput.fill('John');
      await expect(firstNameInput).toHaveValue('John', { timeout: 5000 });
      await ionBlur(firstNameInput);
      await lastNameInput.fill('Doe');
      await expect(lastNameInput).toHaveValue('Doe', { timeout: 5000 });
      await ionBlur(lastNameInput);
      await emailInput.fill('john.doe@example.com');
      await expect(emailInput).toHaveValue('john.doe@example.com', { timeout: 5000 });
      await ionBlur(emailInput);

      // Select radio option - Ionic uses ion-radio (just click it)
      const radioInput = scenario.locator('#priority ion-radio').first();
      await radioInput.click();
      await expect(radioInput).toHaveAttribute('aria-checked', 'true', { timeout: 5000 });

      // Wait for button to be enabled
      await page.waitForSelector('[data-testid="basic-test"] #submit ion-button:not([aria-disabled="true"])', {
        state: 'visible',
        timeout: 10000,
      });

      // Submit button should now be enabled (auto-waiting assertion)
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
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      });

      // Verify form value was updated in debug output
      const formValue = await page.evaluate(() => {
        const pre = document.querySelector('[data-testid="form-value-basic-test"]');
        return pre ? JSON.parse(pre.textContent || '{}') : null;
      });

      expect(formValue).toMatchObject({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      });
    });

    test('should handle rapid form interactions without errors', async ({ page, helpers }) => {
      // Navigate to basic test
      await page.goto('/#/testing/error-handling/basic-test');
      await page.waitForLoadState('networkidle');

      // Locate the specific test scenario
      const scenario = helpers.getScenario('basic-test');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for fields to be ready
      await page.waitForSelector('[data-testid="basic-test"] #firstName input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="basic-test"] #lastName input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="basic-test"] #email input', { state: 'visible', timeout: 10000 });

      const firstNameInput = scenario.locator('#firstName input');
      const lastNameInput = scenario.locator('#lastName input');
      const emailInput = scenario.locator('#email input');

      await expect(firstNameInput).toBeVisible({ timeout: 10000 });

      // Rapid interactions test (blur triggers validation)
      for (let i = 0; i < 5; i++) {
        await firstNameInput.fill(`Rapid${i}`);
        await expect(firstNameInput).toHaveValue(`Rapid${i}`, { timeout: 5000 });
        await ionBlur(firstNameInput);
        await lastNameInput.fill(`Test${i}`);
        await expect(lastNameInput).toHaveValue(`Test${i}`, { timeout: 5000 });
        await ionBlur(lastNameInput);
        await emailInput.fill(`test${i}@example.com`);
        await expect(emailInput).toHaveValue(`test${i}@example.com`, { timeout: 5000 });
        await ionBlur(emailInput);

        // Quick radio selection - Ionic uses ion-radio
        const radioButtons = scenario.locator('#priority ion-radio');
        const radioCount = await radioButtons.count();
        if (radioCount > 0) {
          const radioIndex = i % radioCount;
          await radioButtons.nth(radioIndex).click();
        }
      }

      // Verify no JavaScript errors occurred and form is still functional
      await expect(firstNameInput).toBeVisible({ timeout: 10000 });
      await expect(firstNameInput).toHaveValue('Rapid4', { timeout: 5000 });
      await expect(lastNameInput).toHaveValue('Test4', { timeout: 5000 });
      await expect(emailInput).toHaveValue('test4@example.com', { timeout: 5000 });
    });

    test('should handle accessibility interactions', async ({ page, helpers }) => {
      // Navigate to basic test
      await page.goto('/#/testing/error-handling/basic-test');
      await page.waitForLoadState('networkidle');

      // Locate the specific test scenario
      const scenario = helpers.getScenario('basic-test');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for fields to be ready
      await page.waitForSelector('[data-testid="basic-test"] #firstName input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="basic-test"] #lastName input', { state: 'visible', timeout: 10000 });

      const firstNameField = scenario.locator('#firstName input');
      const lastNameField = scenario.locator('#lastName input');

      await expect(firstNameField).toBeVisible({ timeout: 10000 });
      await expect(lastNameField).toBeVisible({ timeout: 10000 });

      // Test keyboard navigation
      await firstNameField.focus();
      await page.keyboard.type('Accessibility');
      await expect(firstNameField).toHaveValue('Accessibility', { timeout: 5000 });
      await ionBlur(firstNameField);

      // Tab to next field
      await lastNameField.focus();
      await page.keyboard.type('Test');
      await expect(lastNameField).toHaveValue('Test', { timeout: 5000 });
      await ionBlur(lastNameField);

      // Verify values were entered via keyboard (auto-waiting assertions)
      await expect(firstNameField).toHaveValue('Accessibility', { timeout: 5000 });
      await expect(lastNameField).toHaveValue('Test', { timeout: 5000 });

      // Verify field is accessible (has proper attributes)
      const ariaLabel = await firstNameField.getAttribute('aria-label');
      const id = await firstNameField.getAttribute('id');

      // At least one accessibility attribute should exist
      expect(ariaLabel || id).toBeTruthy();
    });
  });

  test.describe('Form State Management', () => {
    test('should maintain form state during browser navigation', async ({ page, helpers }) => {
      // Navigate to basic test
      await page.goto('/#/testing/error-handling/basic-test');
      await page.waitForLoadState('networkidle');

      // Locate the specific test scenario
      const scenario = helpers.getScenario('basic-test');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for fields to be ready
      await page.waitForSelector('[data-testid="basic-test"] #firstName input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="basic-test"] #lastName input', { state: 'visible', timeout: 10000 });

      const firstNameInput = scenario.locator('#firstName input');
      const lastNameInput = scenario.locator('#lastName input');

      await expect(firstNameInput).toBeVisible({ timeout: 10000 });
      await expect(lastNameInput).toBeVisible({ timeout: 10000 });

      // Fill some form data (blur triggers validation)
      await firstNameInput.fill('Persistent');
      await expect(firstNameInput).toHaveValue('Persistent', { timeout: 5000 });
      await ionBlur(firstNameInput);
      await lastNameInput.fill('Data');
      await expect(lastNameInput).toHaveValue('Data', { timeout: 5000 });
      await ionBlur(lastNameInput);

      // Verify data is filled (auto-waiting assertion)
      await expect(firstNameInput).toHaveValue('Persistent', { timeout: 5000 });

      // Navigate away and back
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.goto('/#/testing/error-handling/basic-test');
      await page.waitForLoadState('networkidle');

      // Form should be fresh (not persisted in this case)
      const newScenario = helpers.getScenario('basic-test');
      await expect(newScenario).toBeVisible({ timeout: 10000 });

      // Wait for field to be ready
      await page.waitForSelector('[data-testid="basic-test"] #firstName input', { state: 'visible', timeout: 10000 });
      const newFirstNameInput = newScenario.locator('#firstName input');
      await expect(newFirstNameInput).toBeVisible({ timeout: 10000 });

      // Use auto-waiting assertion
      await expect(newFirstNameInput).toHaveValue('', { timeout: 10000 });
    });

    test('should handle multiple form reloads without memory issues', async ({ page, helpers }) => {
      // Perform repeated navigation to test memory cleanup
      for (let i = 0; i < 3; i++) {
        // Navigate to basic test
        await page.goto('/#/testing/error-handling/basic-test');
        await page.waitForLoadState('networkidle');

        // Locate the scenario
        const scenario = helpers.getScenario('basic-test');
        await expect(scenario).toBeVisible({ timeout: 10000 });

        // Wait for fields to be ready
        await page.waitForSelector('[data-testid="basic-test"] #firstName input', { state: 'visible', timeout: 10000 });
        await page.waitForSelector('[data-testid="basic-test"] #lastName input', { state: 'visible', timeout: 10000 });

        const firstNameInput = scenario.locator('#firstName input');
        const lastNameInput = scenario.locator('#lastName input');

        await expect(firstNameInput).toBeVisible({ timeout: 10000 });
        await expect(lastNameInput).toBeVisible({ timeout: 10000 });

        // Fill some data (blur triggers validation)
        await firstNameInput.fill(`Memory${i}`);
        await expect(firstNameInput).toHaveValue(`Memory${i}`, { timeout: 5000 });
        await ionBlur(firstNameInput);
        await lastNameInput.fill(`Test${i}`);
        await expect(lastNameInput).toHaveValue(`Test${i}`, { timeout: 5000 });
        await ionBlur(lastNameInput);

        // Verify data is filled (use auto-waiting assertion with timeout)
        await expect(firstNameInput).toHaveValue(`Memory${i}`, { timeout: 10000 });
      }

      // Final load to ensure everything still works
      await page.goto('/#/testing/error-handling/basic-test');
      await page.waitForLoadState('networkidle');

      const finalScenario = helpers.getScenario('basic-test');
      await expect(finalScenario).toBeVisible({ timeout: 10000 });

      // Wait for field to be ready
      await page.waitForSelector('[data-testid="basic-test"] #firstName input', { state: 'visible', timeout: 10000 });

      const finalFirstNameInput = finalScenario.locator('#firstName input');
      await expect(finalFirstNameInput).toBeVisible({ timeout: 10000 });

      // Form should be functional (blur triggers validation)
      await finalFirstNameInput.fill('Final');
      await expect(finalFirstNameInput).toHaveValue('Final', { timeout: 5000 });
      await ionBlur(finalFirstNameInput);
      await expect(finalFirstNameInput).toHaveValue('Final', { timeout: 10000 });
    });
  });
});
