import { expect, test } from '@playwright/test';

test.describe('Submission Behavior Tests', () => {
  test.describe('Basic Submission', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('http://localhost:4200/#/test/submission-behavior/basic-submission');
      await page.waitForLoadState('networkidle');
    });

    test('should disable submit button while form is submitting', async ({ page }) => {
      const scenario = page.locator('[data-testid="basic-submission"]');
      await expect(scenario).toBeVisible();

      // Fill required fields
      await scenario.locator('#email input').fill('test@example.com');
      await scenario.locator('#name input').fill('Test User');
      await page.waitForTimeout(200);

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

    test('should increment submission count on successful submission', async ({ page }) => {
      const scenario = page.locator('[data-testid="basic-submission"]');
      await expect(scenario).toBeVisible();

      // Fill required fields
      await scenario.locator('#email input').fill('test@example.com');
      await scenario.locator('#name input').fill('Test User');
      await page.waitForTimeout(200);

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
    test.beforeEach(async ({ page }) => {
      await page.goto('http://localhost:4200/#/test/submission-behavior/button-disabled-states');
      await page.waitForLoadState('networkidle');
    });

    test('should disable submit button when form is invalid', async ({ page }) => {
      const scenario = page.locator('[data-testid="button-disabled-invalid"]');
      await expect(scenario).toBeVisible();

      // Submit button should be disabled initially (form is empty/invalid)
      const submitButton = scenario.locator('#submitInvalid button');
      await expect(submitButton).toBeDisabled();

      // Fill one field (still invalid)
      await scenario.locator('#email input').fill('test@example.com');
      await page.waitForTimeout(200);
      await expect(submitButton).toBeDisabled();

      // Fill all required fields (now valid)
      await scenario.locator('#name input').fill('Test User');
      await page.waitForTimeout(200);

      // Submit button should be enabled
      await expect(submitButton).toBeEnabled();
    });

    test('should disable submit button during submission', async ({ page }) => {
      const scenario = page.locator('[data-testid="button-disabled-submitting"]');
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

    test('should allow submit button to stay enabled with custom options', async ({ page }) => {
      const scenario = page.locator('[data-testid="button-never-disabled"]');
      await expect(scenario).toBeVisible();

      // Submit button should be enabled even though form is empty/invalid
      const submitButton = scenario.locator('#submitNeverDisabled button');
      await expect(submitButton).toBeEnabled();

      // Form is empty, but button stays enabled due to options
      const emailInput = scenario.locator('#email3 input');
      expect(await emailInput.inputValue()).toBe('');

      // Button should still be enabled
      await expect(submitButton).toBeEnabled();
    });
  });

  test.describe('Next Button Page Validation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('http://localhost:4200/#/test/submission-behavior/next-button-page-validation');
      await page.waitForLoadState('networkidle');
    });

    test('should disable next button when page is invalid', async ({ page }) => {
      const scenario = page.locator('[data-testid="next-button-page-validation"]');
      await expect(scenario).toBeVisible();

      // Next button should be disabled initially (required field is empty)
      const nextButton = scenario.locator('#nextToPage2 button');
      await expect(nextButton).toBeDisabled();

      // Fill the required field
      await scenario.locator('#requiredField input').fill('Valid data');
      await page.waitForTimeout(200);

      // Next button should be enabled
      await expect(nextButton).toBeEnabled();

      // Click next to go to page 2
      await nextButton.click();
      await page.waitForTimeout(500);

      // Verify we're on page 2
      await expect(scenario.locator('#optionalField input')).toBeVisible();
    });

    test('should allow next button to stay enabled with custom options', async ({ page }) => {
      const scenario = page.locator('[data-testid="next-button-never-disabled"]');
      await expect(scenario).toBeVisible();

      // Next button should be enabled even though required field is empty
      const nextButton = scenario.locator('#nextToPage2b button');
      await expect(nextButton).toBeEnabled();

      // Required field is empty
      const requiredInput = scenario.locator('#requiredField2 input');
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
    test.beforeEach(async ({ page }) => {
      await page.goto('http://localhost:4200/#/test/submission-behavior/custom-button-logic');
      await page.waitForLoadState('networkidle');
    });

    test('should use FormStateCondition for disabled logic', async ({ page }) => {
      const scenario = page.locator('[data-testid="form-state-condition"]');
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

    test('should use conditional expression for disabled logic', async ({ page }) => {
      const scenario = page.locator('[data-testid="conditional-expression"]');
      await expect(scenario).toBeVisible();

      // Submit button should be enabled initially (checkbox unchecked)
      const submitButton = scenario.locator('#submitConditional button');
      await expect(submitButton).toBeEnabled();

      // Check the disable checkbox
      await scenario.locator('#disableSubmit mat-checkbox').click();
      await page.waitForTimeout(200);

      // Submit button should be disabled
      await expect(submitButton).toBeDisabled();

      // Uncheck the checkbox
      await scenario.locator('#disableSubmit mat-checkbox').click();
      await page.waitForTimeout(200);

      // Submit button should be enabled again
      await expect(submitButton).toBeEnabled();
    });

    test('should always disable button with explicit disabled: true', async ({ page }) => {
      const scenario = page.locator('[data-testid="explicit-disabled"]');
      await expect(scenario).toBeVisible();

      // Submit button should always be disabled
      const submitButton = scenario.locator('#submitExplicit button');
      await expect(submitButton).toBeDisabled();

      // Fill the form
      await scenario.locator('#email3 input').fill('test@example.com');
      await page.waitForTimeout(200);

      // Button should still be disabled
      await expect(submitButton).toBeDisabled();
    });
  });
});
