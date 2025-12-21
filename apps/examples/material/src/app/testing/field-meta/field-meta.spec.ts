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
      await page.goto('http://localhost:4201/#/test/field-meta/wrapped-components');
      await page.waitForLoadState('networkidle');

      // Locate the specific test scenario
      const scenario = helpers.getScenario('meta-wrapped-components-test');
      await expect(scenario).toBeVisible();

      // Test checkbox meta attributes - verify they reach the native input
      const checkboxInput = scenario.locator('#termsCheckbox mat-checkbox input[type="checkbox"]');
      await expect(checkboxInput).toHaveAttribute('data-testid', 'terms-checkbox-input');
      await expect(checkboxInput).toHaveAttribute('data-analytics', 'terms-acceptance');

      // Test toggle meta attributes - verify they reach the native input
      const toggleInput = scenario.locator('#notificationsToggle mat-slide-toggle input[type="checkbox"]');
      await expect(toggleInput).toHaveAttribute('data-testid', 'notifications-toggle-input');
      await expect(toggleInput).toHaveAttribute('data-analytics', 'notification-setting');

      // Test radio meta attributes - verify they reach all radio inputs in the group
      const radioInputs = scenario.locator('#preferenceRadio mat-radio-group input[type="radio"]');
      const radioCount = await radioInputs.count();
      expect(radioCount).toBe(3); // Three options

      for (let i = 0; i < radioCount; i++) {
        await expect(radioInputs.nth(i)).toHaveAttribute('data-testid', 'preference-radio-input');
        await expect(radioInputs.nth(i)).toHaveAttribute('data-analytics', 'contact-preference');
      }

      // Test multi-checkbox meta attributes - verify they reach all checkbox inputs
      const multiCheckboxInputs = scenario.locator('#interestsMultiCheckbox mat-checkbox input[type="checkbox"]');
      const multiCheckboxCount = await multiCheckboxInputs.count();
      expect(multiCheckboxCount).toBe(3); // Three options

      for (let i = 0; i < multiCheckboxCount; i++) {
        await expect(multiCheckboxInputs.nth(i)).toHaveAttribute('data-testid', 'interests-multi-checkbox-input');
        await expect(multiCheckboxInputs.nth(i)).toHaveAttribute('data-analytics', 'user-interests');
      }

      // Interact with the form to ensure functionality isn't broken
      await scenario.locator('#termsCheckbox mat-checkbox').click();
      await scenario.locator('#notificationsToggle mat-slide-toggle').click();
      await scenario.locator('#preferenceRadio mat-radio-button:has-text("Email")').click();
      await scenario.locator('#interestsMultiCheckbox mat-checkbox:has-text("Sports")').click();

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
    });
  });

  test.describe('Native Elements Meta Test', () => {
    test('should apply meta attributes to native input and textarea elements', async ({ page, helpers }) => {
      // Navigate to the native elements test
      await page.goto('http://localhost:4201/#/test/field-meta/native-elements');
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
