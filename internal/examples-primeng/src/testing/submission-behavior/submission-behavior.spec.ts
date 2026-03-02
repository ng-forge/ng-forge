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
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for fields to be ready
      await page.waitForSelector('[data-testid="basic-submission"] #email input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="basic-submission"] #name input', { state: 'visible', timeout: 10000 });

      // Fill required fields
      const emailInput = helpers.getInput(scenario, 'email');
      await emailInput.fill('test@example.com');
      await expect(emailInput).toHaveValue('test@example.com', { timeout: 5000 });
      await emailInput.blur();

      const nameInput = helpers.getInput(scenario, 'name');
      await nameInput.fill('Test User');
      await expect(nameInput).toHaveValue('Test User', { timeout: 5000 });
      await nameInput.blur();

      // Wait for submit button to be enabled
      await page.waitForSelector('[data-testid="basic-submission"] #submitForm button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });

      // Get the submit button
      const submitButton = scenario.locator('#submitForm button');
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

      // Click submit
      await submitButton.click();

      // Button should be disabled during submission
      await expect(submitButton).toBeDisabled({ timeout: 10000 });

      // Submitting indicator should be visible
      await expect(page.locator('[data-testid="submitting-indicator"]')).toBeVisible({ timeout: 10000 });

      // Wait for submission to complete
      await expect(page.locator('[data-testid="submission-result"]')).toBeVisible({ timeout: 5000 });

      // Button should be enabled again after submission
      await expect(submitButton).toBeEnabled({ timeout: 10000 });
    });

    test('should increment submission count on successful submission', async ({ page, helpers, mockApi }) => {
      const scenario = helpers.getScenario('basic-submission');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for fields to be ready
      await page.waitForSelector('[data-testid="basic-submission"] #email input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="basic-submission"] #name input', { state: 'visible', timeout: 10000 });

      // Fill required fields
      const emailInput = helpers.getInput(scenario, 'email');
      await emailInput.fill('test@example.com');
      await expect(emailInput).toHaveValue('test@example.com', { timeout: 5000 });
      await emailInput.blur();

      const nameInput = helpers.getInput(scenario, 'name');
      await nameInput.fill('Test User');
      await expect(nameInput).toHaveValue('Test User', { timeout: 5000 });
      await nameInput.blur();

      // Initial submission count
      await expect(page.locator('[data-testid="submission-count"]')).toContainText('Submission count: 0');

      // Wait for submit button to be enabled
      await page.waitForSelector('[data-testid="basic-submission"] #submitForm button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });

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

    test('should disable submit button when form is invalid', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('button-disabled-invalid');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for fields to be ready
      await page.waitForSelector('[data-testid="button-disabled-invalid"] #email input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="button-disabled-invalid"] #name input', { state: 'visible', timeout: 10000 });

      // Submit button should be disabled initially (form is empty/invalid)
      const submitButton = scenario.locator('#submitInvalid button');
      await expect(submitButton).toBeDisabled({ timeout: 10000 });

      // Fill one field (still invalid)
      const emailInput = helpers.getInput(scenario, 'email');
      await emailInput.fill('test@example.com');
      await expect(emailInput).toHaveValue('test@example.com', { timeout: 5000 });
      await emailInput.blur();

      await expect(submitButton).toBeDisabled({ timeout: 10000 });

      // Fill all required fields (now valid)
      const nameInput = helpers.getInput(scenario, 'name');
      await nameInput.fill('Test User');
      await expect(nameInput).toHaveValue('Test User', { timeout: 5000 });
      await nameInput.blur();

      // Wait for submit button to be enabled
      await page.waitForSelector('[data-testid="button-disabled-invalid"] #submitInvalid button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });

      // Submit button should be enabled
      await expect(submitButton).toBeEnabled({ timeout: 10000 });
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
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for submit button to be enabled (form is pre-filled with valid data)
      await page.waitForSelector('[data-testid="button-disabled-submitting"] #submitSubmitting button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });

      const submitButton = scenario.locator('#submitSubmitting button');
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

      // Click submit
      await submitButton.click();

      // Button should be disabled during submission
      await expect(submitButton).toBeDisabled({ timeout: 10000 });
      await expect(page.locator('[data-testid="submitting-indicator"]')).toBeVisible({ timeout: 10000 });

      // Wait for submission to complete (increased timeout for reliability)
      await expect(page.locator('[data-testid="submission-result"]')).toBeVisible({ timeout: 5000 });

      // Button should be enabled again
      await expect(submitButton).toBeEnabled({ timeout: 10000 });
    });
  });

  test.describe('Button Never Disabled', () => {
    test.beforeEach(async ({ helpers }) => {
      await helpers.navigateToScenario('/test/submission-behavior/button-never-disabled');
    });

    test('should allow submit button to stay enabled with custom options', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('button-never-disabled');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for fields to be ready
      await page.waitForSelector('[data-testid="button-never-disabled"] #email3 input', { state: 'visible', timeout: 10000 });

      // Submit button should be enabled even though form is empty/invalid
      const submitButton = scenario.locator('#submitNeverDisabled button');
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

      // Form is empty, but button stays enabled due to options
      const emailInput = helpers.getInput(scenario, 'email3');
      await expect(emailInput).toHaveValue('');

      // Button should still be enabled
      await expect(submitButton).toBeEnabled({ timeout: 10000 });
    });
  });

  test.describe('Next Button Page Validation', () => {
    test.beforeEach(async ({ helpers }) => {
      await helpers.navigateToScenario('/test/submission-behavior/next-button-page-validation');
    });

    test('should disable next button when page is invalid', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('next-button-page-validation');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for fields to be ready
      await page.waitForSelector('[data-testid="next-button-page-validation"] #requiredField input', { state: 'visible', timeout: 10000 });

      // Next button should be disabled initially (required field is empty)
      const nextButton = scenario.locator('#nextToPage2 button');
      await expect(nextButton).toBeDisabled({ timeout: 10000 });

      // Fill the required field
      const requiredInput = helpers.getInput(scenario, 'requiredField');
      await requiredInput.fill('Valid data');
      await expect(requiredInput).toHaveValue('Valid data', { timeout: 5000 });
      await requiredInput.blur();

      // Wait for next button to be enabled
      await page.waitForSelector('[data-testid="next-button-page-validation"] #nextToPage2 button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });

      // Next button should be enabled
      await expect(nextButton).toBeEnabled({ timeout: 10000 });

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
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for fields to be ready
      await page.waitForSelector('[data-testid="next-button-never-disabled"] #requiredField2 input', { state: 'visible', timeout: 10000 });

      // Next button should be enabled even though required field is empty
      const nextButton = scenario.locator('#nextToPage2b button');
      await expect(nextButton).toBeEnabled({ timeout: 10000 });

      // Required field is empty
      const requiredInput = helpers.getInput(scenario, 'requiredField2');
      await expect(requiredInput).toHaveValue('');

      // Button should still be enabled
      await expect(nextButton).toBeEnabled({ timeout: 10000 });

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
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for submit button to be enabled (form is pre-filled with valid data)
      await page.waitForSelector('[data-testid="form-state-condition"] #submitFormState button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });

      const submitButton = scenario.locator('#submitFormState button');
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

      // Click submit
      await submitButton.click();

      // Button should be disabled during submission (formSubmitting condition)
      await expect(submitButton).toBeDisabled({ timeout: 10000 });
      await expect(page.locator('[data-testid="submitting-indicator"]')).toBeVisible({ timeout: 10000 });

      // Wait for submission to complete
      await expect(page.locator('[data-testid="submission-result"]')).toBeVisible({ timeout: 5000 });

      // Button should be enabled again
      await expect(submitButton).toBeEnabled({ timeout: 10000 });
    });
  });

  test.describe('Conditional Expression Logic', () => {
    test.beforeEach(async ({ helpers }) => {
      await helpers.navigateToScenario('/test/submission-behavior/conditional-expression');
    });

    test('should use conditional expression for disabled logic', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('conditional-expression');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for fields to be ready
      await page.waitForSelector('[data-testid="conditional-expression"] #disableSubmit input', { state: 'visible', timeout: 10000 });

      // Submit button should be enabled initially (checkbox unchecked)
      const submitButton = scenario.locator('#submitConditional button');
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

      // Check the disable checkbox
      // PrimeNG checkbox: locate the input within p-checkbox
      const checkbox = helpers.getCheckbox(scenario, 'disableSubmit').locator('input');
      await checkbox.check();
      await expect(checkbox).toBeChecked({ timeout: 5000 });

      // Submit button should be disabled
      await expect(submitButton).toBeDisabled({ timeout: 10000 });

      // Uncheck the checkbox
      await checkbox.uncheck();
      await expect(checkbox).not.toBeChecked({ timeout: 5000 });

      // Submit button should be enabled again
      await expect(submitButton).toBeEnabled({ timeout: 10000 });
    });
  });

  test.describe('Explicit Disabled', () => {
    test.beforeEach(async ({ helpers }) => {
      await helpers.navigateToScenario('/test/submission-behavior/explicit-disabled');
    });

    test('should always disable button with explicit disabled: true', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('explicit-disabled');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for fields to be ready
      await page.waitForSelector('[data-testid="explicit-disabled"] #email3 input', { state: 'visible', timeout: 10000 });

      // Submit button should always be disabled
      const submitButton = scenario.locator('#submitExplicit button');
      await expect(submitButton).toBeDisabled({ timeout: 10000 });

      // Fill the form
      const emailInput = helpers.getInput(scenario, 'email3');
      await emailInput.fill('test@example.com');
      await expect(emailInput).toHaveValue('test@example.com', { timeout: 5000 });
      await emailInput.blur();

      // Button should still be disabled
      await expect(submitButton).toBeDisabled({ timeout: 10000 });
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
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for fields to be ready
      await page.waitForSelector('[data-testid="http-error-handling"] #username input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="http-error-handling"] #email input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="http-error-handling"] #message input', { state: 'visible', timeout: 10000 });

      // Fill the form
      const usernameInput = helpers.getInput(scenario, 'username');
      await usernameInput.fill('testuser');
      await expect(usernameInput).toHaveValue('testuser', { timeout: 5000 });
      await usernameInput.blur();

      const emailInput = helpers.getInput(scenario, 'email');
      await emailInput.fill('test@example.com');
      await expect(emailInput).toHaveValue('test@example.com', { timeout: 5000 });
      await emailInput.blur();

      const messageInput = helpers.getInput(scenario, 'message');
      await messageInput.fill('Hello world');
      await expect(messageInput).toHaveValue('Hello world', { timeout: 5000 });
      await messageInput.blur();

      // Wait for submit button to be enabled
      await page.waitForSelector('[data-testid="http-error-handling"] #submitErrorTest button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });

      // Get the submit button
      const submitButton = scenario.locator('#submitErrorTest button');
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

      // Click submit
      await submitButton.click();

      // Button should be disabled during submission
      await expect(submitButton).toBeDisabled({ timeout: 10000 });
      await expect(page.locator('[data-testid="submitting-indicator"]')).toBeVisible({ timeout: 10000 });

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
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for fields to be ready
      await page.waitForSelector('[data-testid="http-error-handling"] #username input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="http-error-handling"] #email input', { state: 'visible', timeout: 10000 });

      // Fill required fields
      const usernameInput = helpers.getInput(scenario, 'username');
      await usernameInput.fill('testuser');
      await expect(usernameInput).toHaveValue('testuser', { timeout: 5000 });
      await usernameInput.blur();

      const emailInput = helpers.getInput(scenario, 'email');
      await emailInput.fill('test@example.com');
      await expect(emailInput).toHaveValue('test@example.com', { timeout: 5000 });
      await emailInput.blur();

      // Wait for submit button to be enabled
      await page.waitForSelector('[data-testid="http-error-handling"] #submitErrorTest button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });

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
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for fields to be ready
      await page.waitForSelector('[data-testid="http-error-handling"] #username input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="http-error-handling"] #email input', { state: 'visible', timeout: 10000 });

      // Fill fields with valid format (server will reject with validation errors)
      // Note: Use valid email format to pass client-side HTML5 validation
      const usernameInput = helpers.getInput(scenario, 'username');
      await usernameInput.fill('testuser');
      await expect(usernameInput).toHaveValue('testuser', { timeout: 5000 });
      await usernameInput.blur();

      const emailInput = helpers.getInput(scenario, 'email');
      await emailInput.fill('test@example.com');
      await expect(emailInput).toHaveValue('test@example.com', { timeout: 5000 });
      await emailInput.blur();

      // Wait for submit button to be enabled
      await page.waitForSelector('[data-testid="http-error-handling"] #submitErrorTest button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });

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
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for fields to be ready
      await page.waitForSelector('[data-testid="submit-inside-group"] #email input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="submit-inside-group"] #name input', { state: 'visible', timeout: 10000 });

      // Submit button inside group should be disabled initially (form is empty/invalid)
      const submitButton = scenario.locator('#submitInGroup button');
      await expect(submitButton).toBeDisabled({ timeout: 10000 });

      // Fill one field (still invalid)
      const emailInput = helpers.getInput(scenario, 'email');
      await emailInput.fill('test@example.com');
      await expect(emailInput).toHaveValue('test@example.com', { timeout: 5000 });
      await emailInput.blur();

      // Button should still be disabled (name field is empty)
      await expect(submitButton).toBeDisabled({ timeout: 10000 });

      // Fill all required fields (now valid)
      const nameInput = helpers.getInput(scenario, 'name');
      await nameInput.fill('Test User');
      await expect(nameInput).toHaveValue('Test User', { timeout: 5000 });
      await nameInput.blur();

      // Wait for submit button to be enabled
      await page.waitForSelector('[data-testid="submit-inside-group"] #submitInGroup button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });

      // Submit button should be enabled now
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

      // Clear one field to make form invalid again
      await emailInput.clear();
      await emailInput.blur();

      // Submit button should be disabled again
      await expect(submitButton).toBeDisabled({ timeout: 10000 });
    });
  });

  test.describe('Hidden Field', () => {
    test.beforeEach(async ({ helpers, mockApi }) => {
      await mockApi.mockSuccess('/api/hidden-field-submit', { delay: 300 });
      await helpers.navigateToScenario('/test/submission-behavior/hidden-field');
    });

    test('should include hidden field values in form submission including inside groups', async ({ page, helpers, mockApi }) => {
      const scenario = helpers.getScenario('hidden-field');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for fields to be ready
      await page.waitForSelector('[data-testid="hidden-field"] #name input', { state: 'visible', timeout: 10000 });

      // Fill the visible input fields
      const nameInput = helpers.getInput(scenario, 'name');
      await nameInput.fill('John Doe');
      await expect(nameInput).toHaveValue('John Doe', { timeout: 5000 });
      await nameInput.blur();

      const descriptionInput = helpers.getInput(scenario, 'description');
      await descriptionInput.fill('Test description');
      await expect(descriptionInput).toHaveValue('Test description', { timeout: 5000 });
      await descriptionInput.blur();

      // Hidden fields should not have any visible elements
      await expect(scenario.locator('[id="id"]')).not.toBeVisible();
      await expect(scenario.locator('[id="version"]')).not.toBeVisible();
      await expect(scenario.locator('[id="isActive"]')).not.toBeVisible();
      await expect(scenario.locator('[id="tagIds"]')).not.toBeVisible();
      await expect(scenario.locator('[id="labels"]')).not.toBeVisible();
      // Hidden fields inside groups should also not be visible
      await expect(scenario.locator('[id="createdBy"]')).not.toBeVisible();
      await expect(scenario.locator('[id="source"]')).not.toBeVisible();

      // Wait for submit button to be enabled
      await page.waitForSelector('[data-testid="hidden-field"] #submitHidden button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });

      // Submit the form
      const submitButton = scenario.locator('#submitHidden button');
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

    test('should not render any DOM elements for hidden fields', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('hidden-field');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for fields to be ready
      await page.waitForSelector('[data-testid="hidden-field"] #name input', { state: 'visible', timeout: 10000 });

      // Count visible field containers - should only have visible inputs and submit button
      // PrimeNG uses p-floatlabel for inputs and p-button for buttons
      const nameInput = scenario.locator('#name input');
      const descriptionInput = scenario.locator('#description input');
      const visibleButtons = scenario.locator('#submitHidden button');

      // We expect to see: 2 input fields (name + description) + 1 submit button
      // Hidden fields (id, version, isActive, tagIds, labels, createdBy, source) should not add any visible elements
      await expect(nameInput).toHaveCount(1);
      await expect(descriptionInput).toHaveCount(1);
      await expect(visibleButtons).toHaveCount(1);
    });
  });
});
