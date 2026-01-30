import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck();

test.describe('Field Meta Attribute Tests', () => {
  test.beforeEach(async ({ helpers }) => {
    await helpers.navigateToScenario('/test/field-meta');
  });

  test.describe('Wrapped Components Meta Test', () => {
    test('should propagate meta attributes to native input elements in wrapped components', async ({ page, helpers }) => {
      // Navigate to the wrapped components test
      await page.goto('/#/test/field-meta/wrapped-components');
      await page.waitForLoadState('networkidle');

      // Locate the specific test scenario
      const scenario = helpers.getScenario('meta-wrapped-components-test');
      await expect(scenario).toBeVisible();

      // Test checkbox meta attributes - verify they reach the native input
      // Bootstrap checkbox uses native input[type="checkbox"]
      const checkboxInput = scenario.locator('#termsCheckbox input[type="checkbox"]');
      await expect(checkboxInput).toHaveAttribute('data-testid', 'terms-checkbox-input');
      await expect(checkboxInput).toHaveAttribute('data-analytics', 'terms-acceptance');

      // Test toggle meta attributes - verify they reach the native checkbox input
      // Bootstrap toggle also uses native input[type="checkbox"] (styled as switch)
      const toggleInput = scenario.locator('#notificationsToggle input[type="checkbox"]');
      await expect(toggleInput).toHaveAttribute('data-testid', 'notifications-toggle-input');
      await expect(toggleInput).toHaveAttribute('data-analytics', 'notification-setting');

      // Test radio meta attributes - verify they reach all radio inputs in the group
      const radioInputs = scenario.locator('#preferenceRadio input[type="radio"]');
      const radioCount = await radioInputs.count();
      expect(radioCount).toBe(3); // Three options

      for (let i = 0; i < radioCount; i++) {
        await expect(radioInputs.nth(i)).toHaveAttribute('data-testid', 'preference-radio-input');
        await expect(radioInputs.nth(i)).toHaveAttribute('data-analytics', 'contact-preference');
      }

      // Test multi-checkbox meta attributes - verify they reach all checkbox inputs
      const multiCheckboxInputs = scenario.locator('#interestsMultiCheckbox input[type="checkbox"]');
      const multiCheckboxCount = await multiCheckboxInputs.count();
      expect(multiCheckboxCount).toBe(3); // Three options

      for (let i = 0; i < multiCheckboxCount; i++) {
        await expect(multiCheckboxInputs.nth(i)).toHaveAttribute('data-testid', 'interests-multi-checkbox-input');
        await expect(multiCheckboxInputs.nth(i)).toHaveAttribute('data-analytics', 'user-interests');
      }

      // Test select meta attributes - applied to native select element
      // Bootstrap uses native <select> element
      const selectElement = scenario.locator('#countrySelect select');
      await expect(selectElement).toHaveAttribute('data-testid', 'country-select-host');
      await expect(selectElement).toHaveAttribute('data-analytics', 'country-selection');

      // Interact with the form to ensure functionality isn't broken
      await scenario.locator('#termsCheckbox input[type="checkbox"]').click();
      await scenario.locator('#notificationsToggle input[type="checkbox"]').click();
      await scenario.locator('#preferenceRadio').locator('label:has-text("Email")').click();
      await scenario.locator('#interestsMultiCheckbox').locator('label:has-text("Sports")').click();

      // Select a country using native select
      await selectElement.selectOption('us');

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

      // Submit form
      await scenario.locator('#submitMeta button').click();

      // Wait for formSubmitted event
      const submittedData = (await submittedDataPromise) as Record<string, unknown>;

      // Verify submission
      expect(submittedData['termsCheckbox']).toBe(true);
      expect(submittedData['notificationsToggle']).toBe(true);
      expect(submittedData['preferenceRadio']).toBe('email');
      expect(submittedData['interestsMultiCheckbox']).toEqual(['sports']);
      expect(submittedData['countrySelect']).toBe('us');
    });
  });

  test.describe('Native Elements Meta Test', () => {
    test('should apply meta attributes to native input and textarea elements', async ({ page, helpers }) => {
      // Navigate to the native elements test
      await page.goto('/#/test/field-meta/native-elements');
      await page.waitForLoadState('networkidle');

      // Locate the specific test scenario
      const scenario = helpers.getScenario('meta-native-elements-test');
      await expect(scenario).toBeVisible();

      // Test email input meta attributes
      const emailInput = scenario.locator('#emailInput input');
      await expect(emailInput).toHaveAttribute('data-testid', 'email-input');
      await expect(emailInput).toHaveAttribute('autocomplete', 'email');
      await expect(emailInput).toHaveAttribute('inputmode', 'email');

      // Test password input meta attributes
      const passwordInput = scenario.locator('#passwordInput input');
      await expect(passwordInput).toHaveAttribute('data-testid', 'password-input');
      await expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');

      // Test textarea meta attributes
      const commentsTextarea = scenario.locator('#commentsTextarea textarea');
      await expect(commentsTextarea).toHaveAttribute('data-testid', 'comments-textarea');
      await expect(commentsTextarea).toHaveAttribute('spellcheck', 'true');

      // Test props forwarding: rows should be applied via meta mechanism
      // Note: cols is not forwarded by Bootstrap (uses CSS for width control)
      await expect(commentsTextarea).toHaveAttribute('rows', '8');

      // Test number input - verify type prop is forwarded via meta
      const ageInput = scenario.locator('#ageInput input');
      await expect(ageInput).toHaveAttribute('data-testid', 'age-input');
      await expect(ageInput).toHaveAttribute('type', 'number');

      // Test password input - verify type prop is forwarded via meta
      await expect(passwordInput).toHaveAttribute('type', 'password');

      // Fill fields and submit
      await emailInput.fill('test@example.com');
      await passwordInput.fill('password123');
      await commentsTextarea.fill('Test comments here');

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

      // Submit form
      await scenario.locator('#submitNative button').click();

      // Wait for formSubmitted event
      const submittedData = (await submittedDataPromise) as Record<string, unknown>;

      // Verify submission
      expect(submittedData['emailInput']).toBe('test@example.com');
      expect(submittedData['passwordInput']).toBe('password123');
      expect(submittedData['commentsTextarea']).toBe('Test comments here');
    });
  });
});
