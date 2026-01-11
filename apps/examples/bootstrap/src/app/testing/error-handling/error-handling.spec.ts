import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck({
  ignorePatterns: [/Failed to load component for field type/i],
});

test.describe('Error Handling and Edge Cases', () => {
  test.beforeEach(async ({ helpers }) => {
    await helpers.navigateToScenario('/test/error-handling');
  });

  test.describe('Invalid Configuration Handling', () => {
    test('should handle invalid field configurations gracefully', async ({ page, helpers }) => {
      // Navigate to invalid config test
      await page.goto('/#/test/error-handling/invalid-config');
      await page.waitForLoadState('domcontentloaded');

      // Locate the specific test scenario with extended timeout for slower browsers
      const scenario = helpers.getScenario('invalid-config');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Verify that valid fields still render even if invalid ones fail
      const validField = scenario.locator('#validField input');
      await expect(validField).toBeVisible({ timeout: 5000 });

      // Interact with valid field (blur triggers validation)
      await validField.fill('Test data');
      await validField.blur();

      // Submit button should be visible and clickable
      const submitButton = scenario.locator('#submitInvalid button');
      await expect(submitButton).toBeVisible();
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
      await page.goto('/#/test/error-handling/basic-test');
      await page.waitForLoadState('networkidle');

      // Locate the specific test scenario
      const scenario = helpers.getScenario('basic-test');
      await expect(scenario).toBeVisible();

      // Wait for fields to be ready
      const firstNameInput = scenario.locator('#firstName input');
      const lastNameInput = scenario.locator('#lastName input');
      const emailInput = scenario.locator('#email input');
      await expect(firstNameInput).toBeVisible();

      // Submit button should be disabled initially (form invalid)
      const submitButton = scenario.locator('#submit button');
      await expect(submitButton).toBeDisabled();

      // Fill form with valid data (blur triggers validation)
      await firstNameInput.fill('John');
      await firstNameInput.blur();
      await lastNameInput.fill('Doe');
      await lastNameInput.blur();
      await emailInput.fill('john.doe@example.com');
      await emailInput.blur();

      // Select radio option - Bootstrap uses native radio inputs within .form-check
      const radioInput = scenario.locator('#priority .form-check input[type="radio"]').first();
      await radioInput.check();

      // Submit button should now be enabled (auto-waiting assertion)
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
      await page.goto('/#/test/error-handling/basic-test');
      await page.waitForLoadState('networkidle');

      // Locate the specific test scenario
      const scenario = helpers.getScenario('basic-test');
      await expect(scenario).toBeVisible();

      const firstNameInput = scenario.locator('#firstName input');
      const lastNameInput = scenario.locator('#lastName input');
      const emailInput = scenario.locator('#email input');

      // Wait for fields to be ready
      await expect(firstNameInput).toBeVisible();

      // Rapid interactions test (blur triggers validation)
      for (let i = 0; i < 5; i++) {
        await firstNameInput.fill(`Rapid${i}`);
        await firstNameInput.blur();
        await lastNameInput.fill(`Test${i}`);
        await lastNameInput.blur();
        await emailInput.fill(`test${i}@example.com`);
        await emailInput.blur();

        // Quick radio selection - Bootstrap uses native radio inputs
        const radioButtons = scenario.locator('#priority .form-check input[type="radio"]');
        const radioCount = await radioButtons.count();
        if (radioCount > 0) {
          const radioIndex = i % radioCount;
          await radioButtons.nth(radioIndex).click();
        }
      }

      // Verify no JavaScript errors occurred and form is still functional
      await expect(firstNameInput).toBeVisible();
      await expect(firstNameInput).toHaveValue('Rapid4');
      await expect(lastNameInput).toHaveValue('Test4');
      await expect(emailInput).toHaveValue('test4@example.com');
    });

    test('should handle accessibility interactions', async ({ page, helpers }) => {
      // Navigate to basic test
      await page.goto('/#/test/error-handling/basic-test');
      await page.waitForLoadState('networkidle');

      // Locate the specific test scenario
      const scenario = helpers.getScenario('basic-test');
      await expect(scenario).toBeVisible();

      const firstNameField = scenario.locator('#firstName input');
      const lastNameField = scenario.locator('#lastName input');

      // Wait for fields to be ready
      await expect(firstNameField).toBeVisible();
      await expect(lastNameField).toBeVisible();

      // Test keyboard navigation
      await firstNameField.focus();
      await page.keyboard.type('Accessibility');
      await firstNameField.blur();

      // Tab to next field
      await lastNameField.focus();
      await page.keyboard.type('Test');
      await lastNameField.blur();

      // Verify values were entered via keyboard (auto-waiting assertions)
      await expect(firstNameField).toHaveValue('Accessibility');
      await expect(lastNameField).toHaveValue('Test');

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
      await page.goto('/#/test/error-handling/basic-test');
      await page.waitForLoadState('networkidle');

      // Locate the specific test scenario
      const scenario = helpers.getScenario('basic-test');
      await expect(scenario).toBeVisible();

      const firstNameInput = scenario.locator('#firstName input');
      const lastNameInput = scenario.locator('#lastName input');

      // Wait for fields to be ready
      await expect(firstNameInput).toBeVisible();
      await expect(lastNameInput).toBeVisible();

      // Fill some form data (blur triggers validation)
      await firstNameInput.fill('Persistent');
      await firstNameInput.blur();
      await lastNameInput.fill('Data');
      await lastNameInput.blur();

      // Verify data is filled (auto-waiting assertion)
      await expect(firstNameInput).toHaveValue('Persistent');

      // Navigate away and back
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.goto('/#/test/error-handling/basic-test');
      await page.waitForLoadState('networkidle');

      // Form should be fresh (not persisted in this case)
      const newScenario = helpers.getScenario('basic-test');
      await expect(newScenario).toBeVisible();

      // Wait for field to be ready
      const newFirstNameInput = newScenario.locator('#firstName input');
      await expect(newFirstNameInput).toBeVisible();

      // Use auto-waiting assertion
      await expect(newFirstNameInput).toHaveValue('', { timeout: 10000 });
    });

    test('should handle multiple form reloads without memory issues', async ({ page, helpers }) => {
      // Perform repeated navigation to test memory cleanup
      for (let i = 0; i < 3; i++) {
        // Navigate to basic test
        await page.goto('/#/test/error-handling/basic-test');
        await page.waitForLoadState('networkidle');

        // Locate the scenario
        const scenario = helpers.getScenario('basic-test');
        await expect(scenario).toBeVisible({ timeout: 10000 });

        const firstNameInput = scenario.locator('#firstName input');
        const lastNameInput = scenario.locator('#lastName input');

        // Wait for fields to be ready
        await expect(firstNameInput).toBeVisible({ timeout: 10000 });
        await expect(lastNameInput).toBeVisible({ timeout: 10000 });

        // Fill some data (blur triggers validation)
        await firstNameInput.fill(`Memory${i}`);
        await firstNameInput.blur();
        await lastNameInput.fill(`Test${i}`);
        await lastNameInput.blur();

        // Verify data is filled (use auto-waiting assertion with timeout)
        await expect(firstNameInput).toHaveValue(`Memory${i}`, { timeout: 10000 });
      }

      // Final load to ensure everything still works
      await page.goto('/#/test/error-handling/basic-test');
      await page.waitForLoadState('networkidle');

      const finalScenario = helpers.getScenario('basic-test');
      await expect(finalScenario).toBeVisible({ timeout: 10000 });

      const finalFirstNameInput = finalScenario.locator('#firstName input');
      await expect(finalFirstNameInput).toBeVisible({ timeout: 10000 });

      // Form should be functional (blur triggers validation)
      await finalFirstNameInput.fill('Final');
      await finalFirstNameInput.blur();
      await expect(finalFirstNameInput).toHaveValue('Final', { timeout: 10000 });
    });
  });
});
