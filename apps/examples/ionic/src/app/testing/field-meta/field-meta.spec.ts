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

      // Test checkbox meta attributes - verify they reach the ion-checkbox element
      // Ionic applies meta to ion-checkbox via setupMetaTracking with selector: 'ion-checkbox'
      const checkboxElement = scenario.locator('#termsCheckbox ion-checkbox');
      await expect(checkboxElement).toHaveAttribute('data-testid', 'terms-checkbox-input');
      await expect(checkboxElement).toHaveAttribute('data-analytics', 'terms-acceptance');

      // Test toggle meta attributes - verify they reach the ion-toggle element
      // Ionic applies meta to ion-toggle via setupMetaTracking with selector: 'ion-toggle'
      const toggleElement = scenario.locator('#notificationsToggle ion-toggle');
      await expect(toggleElement).toHaveAttribute('data-testid', 'notifications-toggle-input');
      await expect(toggleElement).toHaveAttribute('data-analytics', 'notification-setting');

      // Test radio meta attributes - verify they reach all ion-radio elements in the group
      // Ionic applies meta to ion-radio elements via setupMetaTracking with selector: 'ion-radio'
      const radioElements = scenario.locator('#preferenceRadio ion-radio');
      const radioCount = await radioElements.count();
      expect(radioCount).toBe(3); // Three options

      for (let i = 0; i < radioCount; i++) {
        await expect(radioElements.nth(i)).toHaveAttribute('data-testid', 'preference-radio-input');
        await expect(radioElements.nth(i)).toHaveAttribute('data-analytics', 'contact-preference');
      }

      // Test multi-checkbox meta attributes - verify they reach all ion-checkbox elements
      // Ionic applies meta to ion-checkbox elements via setupMetaTracking with selector: 'ion-checkbox'
      const multiCheckboxElements = scenario.locator('#interestsMultiCheckbox ion-checkbox');
      const multiCheckboxCount = await multiCheckboxElements.count();
      expect(multiCheckboxCount).toBe(3); // Three options

      for (let i = 0; i < multiCheckboxCount; i++) {
        await expect(multiCheckboxElements.nth(i)).toHaveAttribute('data-testid', 'interests-multi-checkbox-input');
        await expect(multiCheckboxElements.nth(i)).toHaveAttribute('data-analytics', 'user-interests');
      }

      // Test select meta attributes - applied to host element (ion-select)
      // Ionic applies meta to host element by default (no specific selector)
      const selectHost = scenario.locator('#countrySelect ion-select');
      await expect(selectHost).toHaveAttribute('data-testid', 'country-select-host');
      await expect(selectHost).toHaveAttribute('data-analytics', 'country-selection');

      // Interact with the form to ensure functionality isn't broken
      await scenario.locator('#termsCheckbox ion-checkbox').click();
      await scenario.locator('#notificationsToggle ion-toggle').click();
      await scenario.locator('#preferenceRadio ion-radio').first().click(); // Click "Email" option

      // Click the first multi-checkbox option (Sports)
      await scenario.locator('#interestsMultiCheckbox ion-checkbox').first().click();

      // Select a country - Ionic select uses different interaction
      await selectHost.click();
      // Wait for the alert/popover to appear and select an option
      await page.locator('ion-alert button:has-text("United States")').click();
      await page.locator('ion-alert button:has-text("OK")').click();

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
      await scenario.locator('#submitMeta ion-button').click();

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

      // Test email input meta attributes - applied to ion-input element
      // Ionic applies meta to ion-input via setupMetaTracking with selector: 'ion-input'
      const emailInput = scenario.locator('#emailInput ion-input');
      await expect(emailInput).toHaveAttribute('data-testid', 'email-input');
      await expect(emailInput).toHaveAttribute('autocomplete', 'email');
      await expect(emailInput).toHaveAttribute('inputmode', 'email');

      // Test password input meta attributes - applied to ion-input element
      const passwordInput = scenario.locator('#passwordInput ion-input');
      await expect(passwordInput).toHaveAttribute('data-testid', 'password-input');
      await expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');

      // Test textarea meta attributes - applied to ion-textarea element
      // Ionic applies meta to ion-textarea via setupMetaTracking with selector: 'ion-textarea'
      const commentsTextarea = scenario.locator('#commentsTextarea ion-textarea');
      await expect(commentsTextarea).toHaveAttribute('data-testid', 'comments-textarea');
      await expect(commentsTextarea).toHaveAttribute('spellcheck', 'true');

      // Note: rows and cols are handled by Ionic's props system, not meta attributes
      // The rows prop is passed to ion-textarea via [rows]="props()?.rows ?? 4"

      // Test number input meta attributes - applied to ion-input element
      const ageInput = scenario.locator('#ageInput ion-input');
      await expect(ageInput).toHaveAttribute('data-testid', 'age-input');

      // Verify type prop is forwarded via Ionic's type binding
      // Note: Ionic ion-input has its own type attribute
      await expect(ageInput).toHaveAttribute('type', 'number');

      // Verify password type
      await expect(passwordInput).toHaveAttribute('type', 'password');

      // Fill fields and submit - use Ionic's input method
      // For ion-input, we need to interact with the native input inside
      await emailInput.click();
      await emailInput.locator('input').fill('test@example.com');

      await passwordInput.click();
      await passwordInput.locator('input').fill('password123');

      await commentsTextarea.click();
      await commentsTextarea.locator('textarea').fill('Test comments here');

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
      await scenario.locator('#submitNative ion-button').click();

      // Wait for formSubmitted event
      const submittedData = (await submittedDataPromise) as Record<string, unknown>;

      // Verify submission
      expect(submittedData['emailInput']).toBe('test@example.com');
      expect(submittedData['passwordInput']).toBe('password123');
      expect(submittedData['commentsTextarea']).toBe('Test comments here');
    });
  });
});
