import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';
import { ionBlur } from '../shared/test-utils';

setupTestLogging();
setupConsoleCheck();

test.describe('Schema System E2E Tests', () => {
  test.beforeEach(async ({ helpers }) => {
    await helpers.navigateToScenario('/testing/schema-system');
  });

  test.describe('Apply Schema', () => {
    test('should apply reusable requiredEmail schema to field', async ({ page, helpers }) => {
      await page.goto('/#/schema-system/apply-schema');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('apply-schema-test');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for input to be visible
      await page.waitForSelector('[data-testid="apply-schema-test"] #email input', { state: 'visible', timeout: 10000 });

      const emailInput = helpers.getInput(scenario, 'email');
      const submitButton = helpers.getSubmitButton(scenario);

      // Submit should be disabled initially (required validator from schema)
      await expect(submitButton).toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });

      // Enter invalid email - submit should still be disabled (email validator from schema)
      await helpers.fillInput(emailInput, 'notanemail');
      await expect(emailInput).toHaveValue('notanemail', { timeout: 5000 });
      await ionBlur(emailInput);
      await expect(submitButton).toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });

      // Enter valid email - submit should be enabled (both validators pass)
      await helpers.clearAndFill(emailInput, 'test@example.com');
      await expect(emailInput).toHaveValue('test@example.com', { timeout: 5000 });
      await ionBlur(emailInput);
      await page.waitForSelector('[data-testid="apply-schema-test"] #submit ion-button:not([aria-disabled="true"])', {
        state: 'visible',
        timeout: 10000,
      });
      await expect(submitButton).not.toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });

      // Clear the field - submit disabled (required validator fails)
      await emailInput.fill('');
      await expect(emailInput).toHaveValue('', { timeout: 5000 });
      await ionBlur(emailInput);
      await expect(submitButton).toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });
    });
  });

  test.describe('Apply When Schema', () => {
    test('should conditionally apply schema when checkbox is checked', async ({ page, helpers }) => {
      await page.goto('/#/schema-system/apply-when-schema');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('apply-when-schema-test');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for fields to be visible
      await page.waitForSelector('[data-testid="apply-when-schema-test"] #needsContact ion-checkbox', {
        state: 'visible',
        timeout: 10000,
      });
      await page.waitForSelector('[data-testid="apply-when-schema-test"] #contactEmail input', { state: 'visible', timeout: 10000 });

      // Ionic checkbox selector
      const needsContactCheckbox = scenario.locator('#needsContact ion-checkbox');
      const contactEmailInput = helpers.getInput(scenario, 'contactEmail');
      const submitButton = helpers.getSubmitButton(scenario);

      // Initially checkbox is unchecked - form should be valid (schema not applied)
      await page.waitForSelector('[data-testid="apply-when-schema-test"] #submit ion-button:not([aria-disabled="true"])', {
        state: 'visible',
        timeout: 10000,
      });
      await expect(submitButton).not.toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });

      // Check the checkbox - now email is required
      await helpers.checkIonCheckbox(needsContactCheckbox);
      await expect(needsContactCheckbox).toBeChecked({ timeout: 5000 });

      // Submit should be disabled (required validator from schema now active)
      await expect(submitButton).toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });

      // Enter invalid email - submit still disabled
      await helpers.fillInput(contactEmailInput, 'invalidemail');
      await expect(contactEmailInput).toHaveValue('invalidemail', { timeout: 5000 });
      await ionBlur(contactEmailInput);
      await expect(submitButton).toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });

      // Enter valid email - submit should be enabled
      await helpers.clearAndFill(contactEmailInput, 'contact@example.com');
      await expect(contactEmailInput).toHaveValue('contact@example.com', { timeout: 5000 });
      await ionBlur(contactEmailInput);
      await page.waitForSelector('[data-testid="apply-when-schema-test"] #submit ion-button:not([aria-disabled="true"])', {
        state: 'visible',
        timeout: 10000,
      });
      await expect(submitButton).not.toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });

      // Uncheck the checkbox - schema should no longer apply
      await helpers.uncheckIonCheckbox(needsContactCheckbox);
      await expect(needsContactCheckbox).not.toBeChecked({ timeout: 5000 });

      // Clear the email field - should still be valid since schema not applied
      await contactEmailInput.fill('');
      await expect(contactEmailInput).toHaveValue('', { timeout: 5000 });
      await ionBlur(contactEmailInput);
      await page.waitForSelector('[data-testid="apply-when-schema-test"] #submit ion-button:not([aria-disabled="true"])', {
        state: 'visible',
        timeout: 10000,
      });
      await expect(submitButton).not.toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });
    });

    test('should re-apply schema when checkbox is checked again', async ({ page, helpers }) => {
      await page.goto('/#/schema-system/apply-when-schema');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('apply-when-schema-test');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for fields to be visible
      await page.waitForSelector('[data-testid="apply-when-schema-test"] #needsContact ion-checkbox', {
        state: 'visible',
        timeout: 10000,
      });
      await page.waitForSelector('[data-testid="apply-when-schema-test"] #contactEmail input', { state: 'visible', timeout: 10000 });

      // Ionic checkbox selector
      const needsContactCheckbox = scenario.locator('#needsContact ion-checkbox');
      const contactEmailInput = helpers.getInput(scenario, 'contactEmail');
      const submitButton = helpers.getSubmitButton(scenario);

      // Check, fill valid email, uncheck, check again
      await helpers.checkIonCheckbox(needsContactCheckbox);
      await expect(needsContactCheckbox).toBeChecked({ timeout: 5000 });
      await helpers.fillInput(contactEmailInput, 'test@test.com');
      await expect(contactEmailInput).toHaveValue('test@test.com', { timeout: 5000 });
      await ionBlur(contactEmailInput);
      await page.waitForSelector('[data-testid="apply-when-schema-test"] #submit ion-button:not([aria-disabled="true"])', {
        state: 'visible',
        timeout: 10000,
      });
      await expect(submitButton).not.toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });

      await helpers.uncheckIonCheckbox(needsContactCheckbox);
      await expect(needsContactCheckbox).not.toBeChecked({ timeout: 5000 });

      // Clear email while unchecked (no validation)
      await contactEmailInput.fill('');
      await expect(contactEmailInput).toHaveValue('', { timeout: 5000 });
      await ionBlur(contactEmailInput);
      await page.waitForSelector('[data-testid="apply-when-schema-test"] #submit ion-button:not([aria-disabled="true"])', {
        state: 'visible',
        timeout: 10000,
      });
      await expect(submitButton).not.toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });

      // Re-check - validation should apply again
      await helpers.checkIonCheckbox(needsContactCheckbox);
      await expect(needsContactCheckbox).toBeChecked({ timeout: 5000 });

      // Now should be invalid (required)
      await expect(submitButton).toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });
    });
  });
});
