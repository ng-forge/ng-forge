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
      // PrimeNG p-checkbox uses input[type="checkbox"] internally
      const checkboxInput = scenario.locator('#termsCheckbox input[type="checkbox"]');
      await expect(checkboxInput).toHaveAttribute('data-testid', 'terms-checkbox-input');
      await expect(checkboxInput).toHaveAttribute('data-analytics', 'terms-acceptance');

      // Test toggle meta attributes - verify they reach the native input
      // PrimeNG p-toggleSwitch uses input[type="checkbox"] internally
      const toggleInput = scenario.locator('#notificationsToggle input[type="checkbox"]');
      await expect(toggleInput).toHaveAttribute('data-testid', 'notifications-toggle-input');
      await expect(toggleInput).toHaveAttribute('data-analytics', 'notification-setting');

      // Test radio meta attributes - verify they reach all radio inputs in the group
      // PrimeNG p-radioButton uses input[type="radio"] internally
      const radioInputs = scenario.locator('#preferenceRadio input[type="radio"]');
      const radioCount = await radioInputs.count();
      expect(radioCount).toBe(3); // Three options

      for (let i = 0; i < radioCount; i++) {
        await expect(radioInputs.nth(i)).toHaveAttribute('data-testid', 'preference-radio-input');
        await expect(radioInputs.nth(i)).toHaveAttribute('data-analytics', 'contact-preference');
      }

      // Test multi-checkbox meta attributes - verify they reach all checkbox inputs
      // PrimeNG p-checkbox uses input[type="checkbox"] internally
      const multiCheckboxInputs = scenario.locator('#interestsMultiCheckbox input[type="checkbox"]');
      const multiCheckboxCount = await multiCheckboxInputs.count();
      expect(multiCheckboxCount).toBe(3); // Three options

      for (let i = 0; i < multiCheckboxCount; i++) {
        await expect(multiCheckboxInputs.nth(i)).toHaveAttribute('data-testid', 'interests-multi-checkbox-input');
        await expect(multiCheckboxInputs.nth(i)).toHaveAttribute('data-analytics', 'user-interests');
      }

      // Test select meta attributes - applied to host element (p-select has no native input)
      // Meta is applied to the df-prime-select-control wrapper which contains p-select
      const selectHost = scenario.locator('#countrySelect df-prime-select-control');
      await expect(selectHost).toHaveAttribute('data-testid', 'country-select-host');
      await expect(selectHost).toHaveAttribute('data-analytics', 'country-selection');

      // Interact with the form to ensure functionality isn't broken
      await scenario.locator('#termsCheckbox p-checkbox').click();
      await scenario.locator('#notificationsToggle p-toggleswitch').click();
      await scenario.locator('#preferenceRadio p-radiobutton:has-text("Email")').click();
      await scenario.locator('#interestsMultiCheckbox p-checkbox:has-text("Sports")').click();

      // Select a country - click the select to open dropdown
      await scenario.locator('#countrySelect p-select').click();
      await page.locator('p-select-overlay li:has-text("United States")').click();

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
      // PrimeNG input uses native input element with pInputText directive
      const emailInput = scenario.locator('#emailInput input');
      await expect(emailInput).toHaveAttribute('data-testid', 'email-input');
      await expect(emailInput).toHaveAttribute('autocomplete', 'email');
      await expect(emailInput).toHaveAttribute('inputmode', 'email');

      // Test password input meta attributes
      const passwordInput = scenario.locator('#passwordInput input');
      await expect(passwordInput).toHaveAttribute('data-testid', 'password-input');
      await expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');

      // Test textarea meta attributes
      // PrimeNG textarea uses native textarea element
      const commentsTextarea = scenario.locator('#commentsTextarea textarea');
      await expect(commentsTextarea).toHaveAttribute('data-testid', 'comments-textarea');
      await expect(commentsTextarea).toHaveAttribute('spellcheck', 'true');

      // Test props forwarding: rows and cols should be applied via props mechanism
      await expect(commentsTextarea).toHaveAttribute('rows', '8');
      await expect(commentsTextarea).toHaveAttribute('cols', '50');

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
