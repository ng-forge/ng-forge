import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck();

test.describe('Submission Behavior Tests', () => {
  test.describe('Basic Submission', () => {
    test.beforeEach(async ({ helpers }) => {
      await helpers.navigateToScenario('/test/submission-behavior/basic-submission');
    });

    test('should disable submit button while form is submitting', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('basic-submission');
      await expect(scenario).toBeVisible();

      // Fill required fields
      await helpers.fillInput(helpers.getInput(scenario, 'email'), 'test@example.com');
      await helpers.fillInput(helpers.getInput(scenario, 'name'), 'Test User');

      // Get the submit button
      const submitButton = scenario.locator('#submitForm button');
      await expect(submitButton).toBeEnabled();

      // Click submit
      await submitButton.click();

      // Button should be disabled during submission
      await expect(submitButton).toBeDisabled();

      // Submitting indicator should be visible
      await expect(page.locator('[data-testid="submitting-indicator"]')).toBeVisible();

      // Wait for submission to complete (1.5s delay in component)
      await page.waitForTimeout(2000);

      // Button should be enabled again after submission
      await expect(submitButton).toBeEnabled();

      // Submission result should be visible
      await expect(page.locator('[data-testid="submission-result"]')).toBeVisible();
    });

    test('should increment submission count on successful submission', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('basic-submission');
      await expect(scenario).toBeVisible();

      // Fill required fields
      await helpers.fillInput(helpers.getInput(scenario, 'email'), 'test@example.com');
      await helpers.fillInput(helpers.getInput(scenario, 'name'), 'Test User');

      // Initial submission count
      await expect(page.locator('[data-testid="submission-count"]')).toContainText('Submission count: 0');

      // Submit the form
      await scenario.locator('#submitForm button').click();

      // Wait for submission to complete
      await page.waitForTimeout(2000);

      // Submission count should be incremented
      await expect(page.locator('[data-testid="submission-count"]')).toContainText('Submission count: 1');
    });
  });

  test.describe('Button Disabled States', () => {
    test.beforeEach(async ({ helpers }) => {
      await helpers.navigateToScenario('/test/submission-behavior/button-disabled-states');
    });

    test('should disable submit button when form is invalid', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('button-disabled-invalid');
      await expect(scenario).toBeVisible();

      // Submit button should be disabled initially (form is empty/invalid)
      const submitButton = scenario.locator('#submitInvalid button');
      await expect(submitButton).toBeDisabled();

      // Fill one field (still invalid)
      await helpers.fillInput(helpers.getInput(scenario, 'email'), 'test@example.com');
      await expect(submitButton).toBeDisabled();

      // Fill all required fields (now valid)
      await helpers.fillInput(helpers.getInput(scenario, 'name'), 'Test User');

      // Submit button should be enabled
      await expect(submitButton).toBeEnabled();
    });

    test('should disable submit button during submission', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('button-disabled-submitting');
      await expect(scenario).toBeVisible();

      // Form is pre-filled with valid data
      const submitButton = scenario.locator('#submitSubmitting button');
      await expect(submitButton).toBeEnabled();

      // Click submit
      await submitButton.click();

      // Button should be disabled during submission
      await expect(submitButton).toBeDisabled();
      await expect(page.locator('[data-testid="submitting-indicator-2"]')).toBeVisible();

      // Wait for submission to complete (2s delay)
      await page.waitForTimeout(2500);

      // Button should be enabled again
      await expect(submitButton).toBeEnabled();
    });

    test('should allow submit button to stay enabled with custom options', async ({ helpers }) => {
      const scenario = helpers.getScenario('button-never-disabled');
      await expect(scenario).toBeVisible();

      // Submit button should be enabled even though form is empty/invalid
      const submitButton = scenario.locator('#submitNeverDisabled button');
      await expect(submitButton).toBeEnabled();

      // Form is empty, but button stays enabled due to options
      const emailInput = helpers.getInput(scenario, 'email3');
      expect(await emailInput.inputValue()).toBe('');

      // Button should still be enabled
      await expect(submitButton).toBeEnabled();
    });
  });

  test.describe('Next Button Page Validation', () => {
    test.beforeEach(async ({ helpers }) => {
      await helpers.navigateToScenario('/test/submission-behavior/next-button-page-validation');
    });

    test('should disable next button when page is invalid', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('next-button-page-validation');
      await expect(scenario).toBeVisible();

      // Next button should be disabled initially (required field is empty)
      const nextButton = scenario.locator('#nextToPage2 button');
      await expect(nextButton).toBeDisabled();

      // Fill the required field
      await helpers.fillInput(helpers.getInput(scenario, 'requiredField'), 'Valid data');

      // Next button should be enabled
      await expect(nextButton).toBeEnabled();

      // Click next to go to page 2
      await nextButton.click();
      await page.waitForTimeout(500);

      // Verify we're on page 2
      await expect(helpers.getInput(scenario, 'optionalField')).toBeVisible();
    });

    test('should allow next button to stay enabled with custom options', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('next-button-never-disabled');
      await expect(scenario).toBeVisible();

      // Next button should be enabled even though required field is empty
      const nextButton = scenario.locator('#nextToPage2b button');
      await expect(nextButton).toBeEnabled();

      // Required field is empty
      const requiredInput = helpers.getInput(scenario, 'requiredField2');
      expect(await requiredInput.inputValue()).toBe('');

      // Button should still be enabled
      await expect(nextButton).toBeEnabled();

      // Click next - should navigate even with invalid page
      await nextButton.click();
      await page.waitForTimeout(500);

      // Verify we're on page 2
      await expect(scenario.locator('#page2bTitle')).toBeVisible();
    });
  });

  test.describe('Custom Button Logic', () => {
    test.beforeEach(async ({ helpers }) => {
      await helpers.navigateToScenario('/test/submission-behavior/custom-button-logic');
    });

    test('should use FormStateCondition for disabled logic', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('form-state-condition');
      await expect(scenario).toBeVisible();

      // Form is pre-filled with valid data
      const submitButton = scenario.locator('#submitFormState button');
      await expect(submitButton).toBeEnabled();

      // Click submit
      await submitButton.click();

      // Button should be disabled during submission (formSubmitting condition)
      await expect(submitButton).toBeDisabled();
      await expect(page.locator('[data-testid="submitting-indicator"]')).toBeVisible();

      // Wait for submission to complete
      await page.waitForTimeout(2500);

      // Button should be enabled again
      await expect(submitButton).toBeEnabled();
    });

    test('should use conditional expression for disabled logic', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('conditional-expression');
      await expect(scenario).toBeVisible();

      // Submit button should be enabled initially (checkbox unchecked)
      const submitButton = scenario.locator('#submitConditional button');
      await expect(submitButton).toBeEnabled();

      // Check the disable checkbox
      await helpers.getCheckbox(scenario, 'disableSubmit').click();
      await page.waitForTimeout(200);

      // Submit button should be disabled
      await expect(submitButton).toBeDisabled();

      // Uncheck the checkbox
      await helpers.getCheckbox(scenario, 'disableSubmit').click();
      await page.waitForTimeout(200);

      // Submit button should be enabled again
      await expect(submitButton).toBeEnabled();
    });

    test('should always disable button with explicit disabled: true', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('explicit-disabled');
      await expect(scenario).toBeVisible();

      // Submit button should always be disabled
      const submitButton = scenario.locator('#submitExplicit button');
      await expect(submitButton).toBeDisabled();

      // Fill the form
      await helpers.fillInput(helpers.getInput(scenario, 'email3'), 'test@example.com');

      // Button should still be disabled
      await expect(submitButton).toBeDisabled();
    });
  });
});
