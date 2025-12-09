import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck();

test.describe('Schema System E2E Tests', () => {
  test.beforeEach(async ({ helpers }) => {
    await helpers.navigateToScenario('/test/schema-system');
  });

  test.describe('Apply Schema', () => {
    test('should apply reusable requiredEmail schema to field', async ({ page, helpers }) => {
      await page.goto('http://localhost:4204/#/test/schema-system/apply-schema');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('apply-schema-test');
      await expect(scenario).toBeVisible();

      const emailInput = helpers.getInput(scenario, 'email');
      const submitButton = helpers.getSubmitButton(scenario);

      // Submit should be disabled initially (required validator from schema)
      await expect(submitButton).toBeDisabled();

      // Enter invalid email - submit should still be disabled (email validator from schema)
      await helpers.fillInput(emailInput, 'notanemail');
      await expect(submitButton).toBeDisabled();

      // Enter valid email - submit should be enabled (both validators pass)
      await helpers.clearAndFill(emailInput, 'test@example.com');
      await expect(submitButton).toBeEnabled();

      // Clear the field - submit disabled (required validator fails)
      await emailInput.fill('');
      await expect(submitButton).toBeDisabled();
    });
  });

  test.describe('Apply When Schema', () => {
    test('should conditionally apply schema when checkbox is checked', async ({ page, helpers }) => {
      await page.goto('http://localhost:4204/#/test/schema-system/apply-when-schema');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('apply-when-schema-test');
      await expect(scenario).toBeVisible();

      // Bootstrap checkbox selector - uses .form-check structure
      const needsContactCheckbox = scenario.locator('#needsContact .form-check-input');
      const contactEmailInput = helpers.getInput(scenario, 'contactEmail');
      const submitButton = helpers.getSubmitButton(scenario);

      // Initially checkbox is unchecked - form should be valid (schema not applied)
      await expect(submitButton).toBeEnabled();

      // Check the checkbox - now email is required
      await needsContactCheckbox.check();

      // Submit should be disabled (required validator from schema now active)
      await expect(submitButton).toBeDisabled();

      // Enter invalid email - submit still disabled
      await helpers.fillInput(contactEmailInput, 'invalidemail');
      await expect(submitButton).toBeDisabled();

      // Enter valid email - submit should be enabled
      await helpers.clearAndFill(contactEmailInput, 'contact@example.com');
      await expect(submitButton).toBeEnabled();

      // Uncheck the checkbox - schema should no longer apply
      await needsContactCheckbox.uncheck();

      // Clear the email field - should still be valid since schema not applied
      await contactEmailInput.fill('');
      await expect(submitButton).toBeEnabled();
    });

    test('should re-apply schema when checkbox is checked again', async ({ page, helpers }) => {
      await page.goto('http://localhost:4204/#/test/schema-system/apply-when-schema');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('apply-when-schema-test');
      await expect(scenario).toBeVisible();

      // Bootstrap checkbox selector
      const needsContactCheckbox = scenario.locator('#needsContact .form-check-input');
      const contactEmailInput = helpers.getInput(scenario, 'contactEmail');
      const submitButton = helpers.getSubmitButton(scenario);

      // Check, fill valid email, uncheck, check again
      await needsContactCheckbox.check();
      await helpers.fillInput(contactEmailInput, 'test@test.com');
      await expect(submitButton).toBeEnabled();

      await needsContactCheckbox.uncheck();

      // Clear email while unchecked (no validation)
      await contactEmailInput.fill('');
      await expect(submitButton).toBeEnabled();

      // Re-check - validation should apply again
      await needsContactCheckbox.check();

      // Now should be invalid (required)
      await expect(submitButton).toBeDisabled();
    });
  });
});
