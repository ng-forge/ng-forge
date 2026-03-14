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

      // Interact with valid field
      await validField.fill('Test data');

      // Submit button should be visible and clickable
      const submitButton = scenario.locator('#submitInvalid button');
      await expect(submitButton).toBeVisible();

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

      // Submit button should be disabled initially (form invalid)
      const submitButton = scenario.locator('#submit button');
      await expect(submitButton).toBeDisabled();

      // Fill form with valid data
      await scenario.locator('#firstName input').fill('John');
      await scenario.locator('#lastName input').fill('Doe');
      await scenario.locator('#email input').fill('john.doe@example.com');

      // Select radio option
      await scenario.locator('#priority mat-radio-button').first().click();
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

      // Rapid interactions test
      for (let i = 0; i < 5; i++) {
        await firstNameInput.fill(`Rapid${i}`);
        await lastNameInput.fill(`Test${i}`);
        await emailInput.fill(`test${i}@example.com`);

        // Quick radio selection
        const radioButtons = scenario.locator('#priority mat-radio-button');
        const radioCount = await radioButtons.count();
        if (radioCount > 0) {
          const radioIndex = i % radioCount;
          await radioButtons.nth(radioIndex).click();
        }
      }

      // Verify no JavaScript errors occurred and form is still functional
      await expect(firstNameInput).toBeVisible();
      expect(await firstNameInput.inputValue()).toBe('Rapid4');
      expect(await lastNameInput.inputValue()).toBe('Test4');
      expect(await emailInput.inputValue()).toBe('test4@example.com');
    });

    test('should handle accessibility interactions', async ({ page, helpers }) => {
      // Navigate to basic test
      await page.goto('/#/test/error-handling/basic-test');
      await page.waitForLoadState('networkidle');

      // Locate the specific test scenario
      const scenario = helpers.getScenario('basic-test');
      await expect(scenario).toBeVisible();

      const firstNameField = scenario.locator('#firstName input');

      // Test keyboard navigation
      await firstNameField.focus();
      await page.keyboard.type('Accessibility');

      // Tab to next field
      await page.keyboard.press('Tab');
      await page.keyboard.type('Test');

      // Verify values were entered via keyboard
      expect(await firstNameField.inputValue()).toBe('Accessibility');
      const lastNameField = scenario.locator('#lastName input');
      expect(await lastNameField.inputValue()).toBe('Test');

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

      // Fill some form data
      await scenario.locator('#firstName input').fill('Persistent');
      await scenario.locator('#lastName input').fill('Data');

      // Verify data is filled
      expect(await scenario.locator('#firstName input').inputValue()).toBe('Persistent');

      // Navigate away and back
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.goto('/#/test/error-handling/basic-test');
      await page.waitForLoadState('networkidle');

      // Form should be fresh (not persisted in this case)
      const newScenario = helpers.getScenario('basic-test');
      await expect(newScenario).toBeVisible();

      const newFirstNameValue = await newScenario.locator('#firstName input').inputValue();
      expect(newFirstNameValue).toBe('');
    });

    test('should handle multiple form reloads without memory issues', async ({ page, helpers }) => {
      // Perform repeated navigation to test memory cleanup
      for (let i = 0; i < 3; i++) {
        // Navigate to basic test
        await page.goto('/#/test/error-handling/basic-test');
        await page.waitForLoadState('networkidle');

        // Locate the scenario
        const scenario = helpers.getScenario('basic-test');
        await expect(scenario).toBeVisible();

        // Fill some data
        await scenario.locator('#firstName input').fill(`Memory${i}`);
        await scenario.locator('#lastName input').fill(`Test${i}`);

        // Verify data is filled
        expect(await scenario.locator('#firstName input').inputValue()).toBe(`Memory${i}`);
      }

      // Final load to ensure everything still works
      await page.goto('/#/test/error-handling/basic-test');
      await page.waitForLoadState('networkidle');

      const finalScenario = helpers.getScenario('basic-test');
      await expect(finalScenario).toBeVisible();

      // Form should be functional
      await finalScenario.locator('#firstName input').fill('Final');
      expect(await finalScenario.locator('#firstName input').inputValue()).toBe('Final');
    });
  });
});
