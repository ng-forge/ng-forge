import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck();

test.describe('User Workflows E2E Tests', () => {
  test.beforeEach(async ({ helpers }) => {
    await helpers.navigateToScenario('/test/user-workflows');
  });

  test.describe('User Registration Workflow', () => {
    test('should complete full registration workflow', async ({ page, helpers }) => {
      // Navigate to the specific scenario
      await helpers.navigateToScenario('/test/user-workflows/registration');

      // Locate the specific test scenario
      const scenario = helpers.getScenario('registration-workflow');
      await expect(scenario).toBeVisible();

      // Submit button should be disabled initially (form invalid)
      const submitButton = scenario.locator('#submit button');
      await expect(submitButton).toBeDisabled();

      // Fill in registration form
      await scenario.locator('#firstName input').fill('John');
      await scenario.locator('#lastName input').fill('Doe');
      await scenario.locator('#email input').fill('john.doe@example.com');
      await scenario.locator('#password input').fill('SecurePass123');
      await scenario.locator('#confirmPassword input').fill('SecurePass123');

      // Still disabled - need to agree to terms
      await expect(submitButton).toBeDisabled();

      // Agree to terms - Bootstrap uses .form-check element
      await scenario.locator('#agreeTerms .form-check input').click();

      // Submit button should now be enabled
      await expect(submitButton).toBeEnabled();

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

      // Submit the form
      await submitButton.click();

      // Wait for formSubmitted event
      const submittedData = await submittedDataPromise;

      // Verify submitted data
      expect(submittedData).toMatchObject({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        agreeTerms: true,
      });
    });
  });

  test.describe('Profile Edit Workflow', () => {
    test('should edit and save user profile', async ({ page, helpers }) => {
      // Navigate to the specific scenario
      await helpers.navigateToScenario('/test/user-workflows/profile-edit');

      // Locate the specific test scenario
      const scenario = helpers.getScenario('profile-edit');
      await expect(scenario).toBeVisible();

      // Verify initial values
      await expect(scenario.locator('#firstName input')).toHaveValue('John');
      await expect(scenario.locator('#lastName input')).toHaveValue('Doe');

      // Modify profile
      await scenario.locator('#firstName input').fill('Jane');
      await scenario.locator('#bio textarea').fill('Senior software engineer with 10 years experience');

      // Submit changes
      await scenario.locator('#submit button').click();

      // Verify form value was updated
      const formValue = await page.evaluate(() => {
        const pre = document.querySelector('[data-testid="form-value-profile-edit"]');
        return pre ? JSON.parse(pre.textContent || '{}') : null;
      });

      expect(formValue).toMatchObject({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        bio: 'Senior software engineer with 10 years experience',
      });
    });
  });

  test.describe('Multi-Field Validation Workflow', () => {
    test('should validate required fields before allowing submission', async ({ page, helpers }) => {
      // Navigate to the specific scenario
      await helpers.navigateToScenario('/test/user-workflows/validation');

      // Locate the specific test scenario
      const scenario = helpers.getScenario('validation-workflow');
      await expect(scenario).toBeVisible();

      const usernameInput = scenario.locator('#username input');
      const emailInput = scenario.locator('#email input');
      const ageInput = scenario.locator('#age input');
      const submitButton = scenario.locator('#submit button');

      // Form is invalid initially
      await expect(submitButton).toBeDisabled();

      // Fill username (but too short)
      await usernameInput.fill('ab');
      await expect(submitButton).toBeDisabled();

      // Fix username
      await usernameInput.fill('johndoe');
      await expect(submitButton).toBeDisabled();

      // Add invalid email
      await emailInput.fill('invalid-email');
      await expect(submitButton).toBeDisabled();

      // Fix email
      await emailInput.fill('john@example.com');
      await expect(submitButton).toBeDisabled();

      // Add valid age
      await ageInput.fill('25');

      // Form should now be valid
      await expect(submitButton).toBeEnabled();
    });
  });

  test.describe('Form Reset Workflow', () => {
    test('should reset form after modification', async ({ page, helpers }) => {
      // Navigate to the specific scenario
      await helpers.navigateToScenario('/test/user-workflows/reset');

      // Locate the specific test scenario
      const scenario = helpers.getScenario('reset-workflow');
      await expect(scenario).toBeVisible();

      const nameInput = scenario.locator('#name input');
      const descriptionTextarea = scenario.locator('#description textarea');
      const activeCheckbox = scenario.locator('#active .form-check input');
      const resetButton = scenario.locator('#reset button');

      // Verify defaults
      await expect(nameInput).toHaveValue('Default Name');
      await expect(activeCheckbox).toBeChecked();

      // Modify all fields
      await nameInput.fill('Modified Name');
      await descriptionTextarea.fill('Modified description');
      await activeCheckbox.click();

      // Verify modifications
      await expect(nameInput).toHaveValue('Modified Name');
      await expect(descriptionTextarea).toHaveValue('Modified description');
      await expect(activeCheckbox).not.toBeChecked();

      // Reset form
      await resetButton.click();

      // Verify reset to defaults
      await expect(nameInput).toHaveValue('Default Name');
      await expect(descriptionTextarea).toHaveValue('Default description');
      await expect(activeCheckbox).toBeChecked();
    });
  });

  test.describe('Complex Form Workflow', () => {
    test('should complete contact form', async ({ page, helpers }) => {
      // Navigate to the specific scenario
      await helpers.navigateToScenario('/test/user-workflows/contact-form');

      // Locate the specific test scenario
      const scenario = helpers.getScenario('contact-form');
      await expect(scenario).toBeVisible();

      const submitButton = scenario.locator('#submit button');

      // Form is invalid initially
      await expect(submitButton).toBeDisabled();

      // Fill contact form
      await scenario.locator('#name input').fill('Alice Johnson');
      await scenario.locator('#email input').fill('alice@example.com');
      await scenario.locator('#message textarea').fill('I would like to inquire about your services.');

      // Form should be valid
      await expect(submitButton).toBeEnabled();

      // Submit
      await submitButton.click();

      // Verify submission
      const formValue = await page.evaluate(() => {
        const pre = document.querySelector('[data-testid="form-value-contact-form"]');
        return pre ? JSON.parse(pre.textContent || '{}') : null;
      });

      expect(formValue).toMatchObject({
        name: 'Alice Johnson',
        email: 'alice@example.com',
        message: 'I would like to inquire about your services.',
      });
    });
  });
});
