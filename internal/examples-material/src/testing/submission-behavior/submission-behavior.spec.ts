import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
// Ignore "Failed to load resource" errors from intentional HTTP error responses (500, 422, etc.)
setupConsoleCheck({
  ignorePatterns: [/Failed to load resource/],
});

test.describe('Submission Behavior Tests', () => {
  test.describe('Basic Submission', () => {
    test.beforeEach(async ({ helpers, mockApi }) => {
      // Set up mock endpoint before navigating
      await mockApi.mockSuccess('/api/basic-submit', { delay: 1000 });
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

      // Wait for submission to complete
      await expect(page.locator('[data-testid="submission-result"]')).toBeVisible({ timeout: 5000 });

      // Button should be enabled again after submission
      await expect(submitButton).toBeEnabled();
    });

    test('should increment submission count on successful submission', async ({ page, helpers, mockApi }) => {
      const scenario = helpers.getScenario('basic-submission');
      await expect(scenario).toBeVisible();

      // Fill required fields
      await helpers.fillInput(helpers.getInput(scenario, 'email'), 'test@example.com');
      await helpers.fillInput(helpers.getInput(scenario, 'name'), 'Test User');

      // Initial submission count
      await expect(page.locator('[data-testid="submission-count"]')).toContainText('Submission count: 0');

      // Submit the form
      await scenario.locator('#submitForm button').click();

      // Wait for submission to complete (increased timeout for reliability)
      await expect(page.locator('[data-testid="submission-result"]')).toBeVisible({ timeout: 5000 });

      // Submission count should be incremented
      await expect(page.locator('[data-testid="submission-count"]')).toContainText('Submission count: 1');

      // Verify request was made with correct data
      const requests = mockApi.getInterceptedRequests('/api/basic-submit');
      expect(requests).toHaveLength(1);
      expect(requests[0].body).toEqual({
        email: 'test@example.com',
        name: 'Test User',
      });
    });
  });

  test.describe('Button Disabled When Invalid', () => {
    test.beforeEach(async ({ helpers }) => {
      await helpers.navigateToScenario('/test/submission-behavior/button-disabled-invalid');
    });

    test('should disable submit button when form is invalid', async ({ helpers }) => {
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
  });

  test.describe('Button Disabled While Submitting', () => {
    test.beforeEach(async ({ helpers, mockApi }) => {
      // Set up mock endpoint with delay to test disabled state
      await mockApi.mockSuccess('/api/submit-disabled-test', { delay: 1500 });
      await helpers.navigateToScenario('/test/submission-behavior/button-disabled-submitting');
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
      await expect(page.locator('[data-testid="submitting-indicator"]')).toBeVisible();

      // Wait for submission to complete (increased timeout for reliability)
      await expect(page.locator('[data-testid="submission-result"]')).toBeVisible({ timeout: 5000 });

      // Button should be enabled again
      await expect(submitButton).toBeEnabled();
    });
  });

  test.describe('Button Never Disabled', () => {
    test.beforeEach(async ({ helpers }) => {
      await helpers.navigateToScenario('/test/submission-behavior/button-never-disabled');
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

      // Verify we're on page 2 - wait for the optional field to become visible
      await expect(helpers.getInput(scenario, 'optionalField')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Next Button Never Disabled', () => {
    test.beforeEach(async ({ helpers }) => {
      await helpers.navigateToScenario('/test/submission-behavior/next-button-never-disabled');
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

      // Verify we're on page 2 - wait for the title to become visible
      await expect(scenario.locator('#page2bTitle')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('FormStateCondition Logic', () => {
    test.beforeEach(async ({ helpers, mockApi }) => {
      // Set up mock endpoint with delay to test formSubmitting condition
      await mockApi.mockSuccess('/api/form-state-submit', { delay: 1500 });
      await helpers.navigateToScenario('/test/submission-behavior/form-state-condition');
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
      await expect(page.locator('[data-testid="submission-result"]')).toBeVisible({ timeout: 5000 });

      // Button should be enabled again
      await expect(submitButton).toBeEnabled();
    });
  });

  test.describe('Conditional Expression Logic', () => {
    test.beforeEach(async ({ helpers }) => {
      await helpers.navigateToScenario('/test/submission-behavior/conditional-expression');
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
  });

  test.describe('Explicit Disabled', () => {
    test.beforeEach(async ({ helpers }) => {
      await helpers.navigateToScenario('/test/submission-behavior/explicit-disabled');
    });

    test('should always disable button with explicit disabled: true', async ({ helpers }) => {
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

  test.describe('HTTP Error Handling', () => {
    test.beforeEach(async ({ helpers }) => {
      await helpers.navigateToScenario('/test/submission-behavior/http-error-handling');
    });

    test('should submit form via HTTP and show success', async ({ page, helpers, mockApi }) => {
      // Set up mock endpoint with success response
      await mockApi.mockSuccess('/api/error-handling-test', {
        delay: 500,
        body: { message: 'Form submitted successfully!' },
      });

      const scenario = helpers.getScenario('http-error-handling');
      await expect(scenario).toBeVisible();

      // Fill the form
      await helpers.fillInput(helpers.getInput(scenario, 'username'), 'testuser');
      await helpers.fillInput(helpers.getInput(scenario, 'email'), 'test@example.com');
      await helpers.fillInput(helpers.getInput(scenario, 'message'), 'Hello world');

      // Get the submit button
      const submitButton = scenario.locator('#submitErrorTest button');
      await expect(submitButton).toBeEnabled();

      // Click submit
      await submitButton.click();

      // Button should be disabled during submission
      await expect(submitButton).toBeDisabled();
      await expect(page.locator('[data-testid="submitting-indicator"]')).toBeVisible();

      // Wait for submission to complete
      await expect(page.locator('[data-testid="submission-result"]')).toBeVisible({ timeout: 5000 });

      // Check success message
      await expect(page.locator('[data-testid="submission-result"]')).toContainText('Form submitted successfully!');

      // Verify the request was intercepted
      const requests = mockApi.getInterceptedRequests('/api/error-handling-test');
      expect(requests).toHaveLength(1);
      expect(requests[0].body).toEqual({
        username: 'testuser',
        email: 'test@example.com',
        message: 'Hello world',
      });
    });

    test('should handle HTTP error response', async ({ page, helpers, mockApi }) => {
      // Set up mock endpoint with error response
      await mockApi.mockError('/api/error-handling-test', {
        delay: 300,
        status: 500,
        body: { error: 'Database connection failed' },
      });

      const scenario = helpers.getScenario('http-error-handling');
      await expect(scenario).toBeVisible();

      // Fill required fields
      await helpers.fillInput(helpers.getInput(scenario, 'username'), 'testuser');
      await helpers.fillInput(helpers.getInput(scenario, 'email'), 'test@example.com');

      // Submit
      const submitButton = scenario.locator('#submitErrorTest button');
      await submitButton.click();

      // Wait for error response
      await expect(page.locator('[data-testid="submission-result"]')).toBeVisible({ timeout: 5000 });

      // Check error message
      await expect(page.locator('[data-testid="submission-result"]')).toContainText('Server error: 500');
      await expect(page.locator('[data-testid="submission-result"]')).toHaveClass(/error/);
    });

    test('should handle validation error response', async ({ page, helpers, mockApi }) => {
      // Set up mock endpoint with validation error (server-side validation)
      await mockApi.mockValidationError(
        '/api/error-handling-test',
        { email: 'Email already registered', username: 'Username already taken' },
        { delay: 200 },
      );

      const scenario = helpers.getScenario('http-error-handling');
      await expect(scenario).toBeVisible();

      // Fill fields with valid format (server will reject with validation errors)
      // Note: Use valid email format to pass client-side HTML5 validation
      await helpers.fillInput(helpers.getInput(scenario, 'username'), 'testuser');
      await helpers.fillInput(helpers.getInput(scenario, 'email'), 'test@example.com');

      // Submit
      const submitButton = scenario.locator('#submitErrorTest button');
      await submitButton.click();

      // Wait for response
      await expect(page.locator('[data-testid="submission-result"]')).toBeVisible({ timeout: 5000 });

      // Should show error status (422 is not 2xx)
      await expect(page.locator('[data-testid="submission-result"]')).toHaveClass(/error/);
    });
  });

  test.describe('Submit Button Inside Group', () => {
    test.beforeEach(async ({ helpers }) => {
      await helpers.navigateToScenario('/test/submission-behavior/submit-inside-group');
    });

    test('should disable submit button inside group when form is invalid (issue #157)', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('submit-inside-group');
      await expect(scenario).toBeVisible();

      // Submit button inside group should be disabled initially (form is empty/invalid)
      const submitButton = scenario.locator('#submitInGroup button');
      await expect(submitButton).toBeDisabled();

      // Fill one field (still invalid)
      await helpers.fillInput(helpers.getInput(scenario, 'email'), 'test@example.com');
      await expect(submitButton).toBeDisabled();

      // Fill all required fields (now valid)
      await helpers.fillInput(helpers.getInput(scenario, 'name'), 'Test User');

      // Submit button should be enabled now
      await expect(submitButton).toBeEnabled();

      // Clear one field to make form invalid again
      await helpers.fillInput(helpers.getInput(scenario, 'email'), '');

      // Submit button should be disabled again
      await expect(submitButton).toBeDisabled();
    });
  });

  test.describe('Hidden Field', () => {
    test.beforeEach(async ({ helpers, mockApi }) => {
      await mockApi.mockSuccess('/api/hidden-field-submit', { delay: 300 });
      await helpers.navigateToScenario('/test/submission-behavior/hidden-field');
    });

    test('should include hidden field values in form submission including inside groups', async ({ page, helpers, mockApi }) => {
      const scenario = helpers.getScenario('hidden-field');
      await expect(scenario).toBeVisible();

      // Fill the visible input fields
      await helpers.fillInput(helpers.getInput(scenario, 'name'), 'John Doe');
      await helpers.fillInput(helpers.getInput(scenario, 'description'), 'Test description');

      // Hidden fields should not have any visible elements
      await expect(scenario.locator('[id="id"]')).not.toBeVisible();
      await expect(scenario.locator('[id="version"]')).not.toBeVisible();
      await expect(scenario.locator('[id="isActive"]')).not.toBeVisible();
      await expect(scenario.locator('[id="tagIds"]')).not.toBeVisible();
      await expect(scenario.locator('[id="labels"]')).not.toBeVisible();
      // Hidden fields inside groups should also not be visible
      await expect(scenario.locator('[id="createdBy"]')).not.toBeVisible();
      await expect(scenario.locator('[id="source"]')).not.toBeVisible();

      // Submit the form
      const submitButton = scenario.locator('#submitHidden button');
      await expect(submitButton).toBeEnabled();
      await submitButton.click();

      // Wait for submission to complete
      await expect(page.locator('[data-testid="submission-result"]')).toBeVisible({ timeout: 5000 });

      // Verify the request was intercepted with all hidden values including nested ones
      const requests = mockApi.getInterceptedRequests('/api/hidden-field-submit');
      expect(requests).toHaveLength(1);
      expect(requests[0].body).toEqual({
        id: 'uuid-550e8400-e29b-41d4-a716-446655440000',
        version: 42,
        isActive: true,
        tagIds: [1, 2, 3],
        labels: ['draft', 'review'],
        metadata: {
          createdBy: 'user-admin',
          source: 'web-form',
          description: 'Test description',
        },
        name: 'John Doe',
      });
    });

    test('should not render any DOM elements for hidden fields', async ({ helpers }) => {
      const scenario = helpers.getScenario('hidden-field');
      await expect(scenario).toBeVisible();

      // Count the field containers - should only have visible input fields and submit button
      // Hidden fields should not create any DOM elements
      const visibleFields = scenario.locator('mat-form-field, button[type="submit"]');

      // We expect to see: 2 input fields (name + description) + 1 submit button = 3 visible elements
      // Hidden fields (id, version, isActive, tagIds, labels, createdBy, source) should not add any visible elements
      await expect(visibleFields).toHaveCount(3);
    });
  });

  test.describe('Submit Nested Arrays', () => {
    test('should submit correct JSON shape with array data', async ({ page, helpers }) => {
      await page.goto('/#/test/submission-behavior/submit-nested-arrays');
      await page.waitForLoadState('networkidle');
      const scenario = helpers.getScenario('submit-nested-arrays');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      const data = await helpers.submitFormAndCapture(scenario);
      expect(data['projectName']).toBe('My Project');
      expect(data['tasks']).toHaveLength(2);
      const tasks = data['tasks'] as Record<string, unknown>[];
      expect(tasks[0]['taskName']).toBe('Task 1');
      expect(tasks[0]['priority']).toBe('medium');
      expect(tasks[1]['taskName']).toBe('Task 2');
      expect(tasks[1]['priority']).toBe('high');
    });
  });
});
