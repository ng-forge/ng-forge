import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';
import { ionBlur } from '../shared/test-utils';

setupTestLogging();
setupConsoleCheck();

test.describe('User Workflows E2E Tests', () => {
  test.beforeEach(async ({ helpers }) => {
    await helpers.navigateToScenario('/testing/user-workflows');
  });

  test.describe('User Registration Workflow', () => {
    test('should complete full registration workflow', async ({ page, helpers }) => {
      // Navigate to the specific scenario
      await helpers.navigateToScenario('/testing/user-workflows/registration');

      // Locate the specific test scenario
      const scenario = helpers.getScenario('registration-workflow');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for first input to be visible before interacting
      await page.waitForSelector('[data-testid="registration-workflow"] #firstName input', { state: 'visible', timeout: 10000 });

      // Submit button should be disabled initially (form invalid)
      const submitButton = scenario.locator('#submit ion-button');
      await expect(submitButton).toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });

      // Fill in registration form with blur to trigger validation - confirm each value
      const firstNameInput = scenario.locator('#firstName input');
      const lastNameInput = scenario.locator('#lastName input');
      const emailInput = scenario.locator('#email input');
      const passwordInput = scenario.locator('#password input');
      const confirmPasswordInput = scenario.locator('#confirmPassword input');

      await firstNameInput.fill('John');
      await expect(firstNameInput).toHaveValue('John', { timeout: 5000 });
      await ionBlur(firstNameInput);

      await lastNameInput.fill('Doe');
      await expect(lastNameInput).toHaveValue('Doe', { timeout: 5000 });
      await ionBlur(lastNameInput);

      await emailInput.fill('john.doe@example.com');
      await expect(emailInput).toHaveValue('john.doe@example.com', { timeout: 5000 });
      await ionBlur(emailInput);

      await passwordInput.fill('SecurePass123');
      await expect(passwordInput).toHaveValue('SecurePass123', { timeout: 5000 });
      await ionBlur(passwordInput);

      await confirmPasswordInput.fill('SecurePass123');
      await expect(confirmPasswordInput).toHaveValue('SecurePass123', { timeout: 5000 });
      await ionBlur(confirmPasswordInput);

      // Still disabled - need to agree to terms
      await expect(submitButton).toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });

      // Agree to terms - Ionic checkbox
      await page.waitForSelector('[data-testid="registration-workflow"] #agreeTerms ion-checkbox', {
        state: 'visible',
        timeout: 10000,
      });
      const agreeTermsCheckbox = scenario.locator('#agreeTerms ion-checkbox');
      await helpers.checkIonCheckbox(agreeTermsCheckbox);
      await expect(agreeTermsCheckbox).toBeChecked({ timeout: 5000 });

      // Submit button should now be enabled - wait for it explicitly
      await page.waitForSelector('[data-testid="registration-workflow"] #submit ion-button:not([aria-disabled="true"])', {
        state: 'visible',
        timeout: 15000,
      });
      await expect(submitButton).not.toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });

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
      await helpers.navigateToScenario('/testing/user-workflows/profile-edit');

      // Locate the specific test scenario
      const scenario = helpers.getScenario('profile-edit');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for first input to be visible before interacting
      await page.waitForSelector('[data-testid="profile-edit"] #firstName input', { state: 'visible', timeout: 10000 });

      const firstNameInput = scenario.locator('#firstName input');
      const lastNameInput = scenario.locator('#lastName input');
      const bioTextarea = scenario.locator('#bio textarea');
      const submitButton = scenario.locator('#submit ion-button');

      // Verify initial values
      await expect(firstNameInput).toHaveValue('John', { timeout: 5000 });
      await expect(lastNameInput).toHaveValue('Doe', { timeout: 5000 });

      // Modify profile
      await firstNameInput.fill('Jane');
      await expect(firstNameInput).toHaveValue('Jane', { timeout: 5000 });
      await ionBlur(firstNameInput);

      await bioTextarea.fill('Senior software engineer with 10 years experience');
      await expect(bioTextarea).toHaveValue('Senior software engineer with 10 years experience', { timeout: 5000 });
      await ionBlur(bioTextarea);

      // Wait for submit button to be enabled
      await page.waitForSelector('[data-testid="profile-edit"] #submit ion-button:not([aria-disabled="true"])', {
        state: 'visible',
        timeout: 10000,
      });
      await expect(submitButton).not.toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });

      // Submit changes
      await submitButton.click();

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
      await helpers.navigateToScenario('/testing/user-workflows/validation');

      // Locate the specific test scenario
      const scenario = helpers.getScenario('validation-workflow');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for first input to be visible before interacting
      await page.waitForSelector('[data-testid="validation-workflow"] #username input', { state: 'visible', timeout: 10000 });

      const usernameInput = scenario.locator('#username input');
      const emailInput = scenario.locator('#email input');
      const ageInput = scenario.locator('#age input');
      const submitButton = scenario.locator('#submit ion-button');

      // Wait for all inputs to be visible before interacting
      await expect(usernameInput).toBeVisible({ timeout: 10000 });
      await expect(emailInput).toBeVisible({ timeout: 10000 });
      await expect(ageInput).toBeVisible({ timeout: 10000 });
      await expect(submitButton).toBeVisible({ timeout: 10000 });

      // Form is invalid initially
      await expect(submitButton).toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });

      // Fill username (but too short)
      await usernameInput.fill('ab');
      await expect(usernameInput).toHaveValue('ab', { timeout: 5000 });
      await ionBlur(usernameInput);
      await expect(submitButton).toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });

      // Fix username
      await usernameInput.fill('johndoe');
      await expect(usernameInput).toHaveValue('johndoe', { timeout: 5000 });
      await ionBlur(usernameInput);
      await expect(submitButton).toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });

      // Add invalid email
      await emailInput.fill('invalid-email');
      await expect(emailInput).toHaveValue('invalid-email', { timeout: 5000 });
      await ionBlur(emailInput);
      await expect(submitButton).toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });

      // Fix email
      await emailInput.fill('john@example.com');
      await expect(emailInput).toHaveValue('john@example.com', { timeout: 5000 });
      await ionBlur(emailInput);
      await expect(submitButton).toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });

      // Add valid age
      await ageInput.fill('25');
      await expect(ageInput).toHaveValue('25', { timeout: 5000 });
      await ionBlur(ageInput);

      // Wait for submit button to be enabled
      await page.waitForSelector('[data-testid="validation-workflow"] #submit ion-button:not([aria-disabled="true"])', {
        state: 'visible',
        timeout: 10000,
      });

      // Form should now be valid
      await expect(submitButton).not.toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });
    });
  });

  test.describe('Form Reset Workflow', () => {
    test('should reset form after modification', async ({ page, helpers }) => {
      // Navigate to the specific scenario
      await helpers.navigateToScenario('/testing/user-workflows/reset');

      // Locate the specific test scenario
      const scenario = helpers.getScenario('reset-workflow');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for first input to be visible before interacting
      await page.waitForSelector('[data-testid="reset-workflow"] #name input', { state: 'visible', timeout: 10000 });

      const nameInput = scenario.locator('#name input');
      const descriptionTextarea = scenario.locator('#description textarea');
      const activeCheckbox = scenario.locator('#active ion-checkbox');
      const resetButton = scenario.locator('#reset ion-button');

      // Verify defaults
      await expect(nameInput).toHaveValue('Default Name', { timeout: 5000 });
      await expect(activeCheckbox).toBeChecked({ timeout: 5000 });

      // Modify all fields
      await nameInput.fill('Modified Name');
      await expect(nameInput).toHaveValue('Modified Name', { timeout: 5000 });
      await ionBlur(nameInput);

      await descriptionTextarea.fill('Modified description');
      await expect(descriptionTextarea).toHaveValue('Modified description', { timeout: 5000 });
      await ionBlur(descriptionTextarea);

      await page.waitForSelector('[data-testid="reset-workflow"] #active ion-checkbox', { state: 'visible', timeout: 10000 });
      await activeCheckbox.click();

      // Verify modifications
      await expect(nameInput).toHaveValue('Modified Name', { timeout: 5000 });
      await expect(descriptionTextarea).toHaveValue('Modified description', { timeout: 5000 });
      await expect(activeCheckbox).not.toBeChecked({ timeout: 5000 });

      // Reset form
      await expect(resetButton).toBeVisible({ timeout: 10000 });
      await resetButton.click();

      // Verify reset to defaults
      await expect(nameInput).toHaveValue('Default Name', { timeout: 5000 });
      await expect(descriptionTextarea).toHaveValue('Default description', { timeout: 5000 });
      await expect(activeCheckbox).toBeChecked({ timeout: 5000 });
    });
  });

  test.describe('Complex Form Workflow', () => {
    test('should complete contact form', async ({ page, helpers }) => {
      // Navigate to the specific scenario
      await helpers.navigateToScenario('/testing/user-workflows/contact-form');

      // Locate the specific test scenario
      const scenario = helpers.getScenario('contact-form');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for first input to be visible before interacting
      await page.waitForSelector('[data-testid="contact-form"] #name input', { state: 'visible', timeout: 10000 });

      const nameInput = scenario.locator('#name input');
      const emailInput = scenario.locator('#email input');
      const messageTextarea = scenario.locator('#message textarea');
      const submitButton = scenario.locator('#submit ion-button');

      // Form is invalid initially
      await expect(submitButton).toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });

      // Fill contact form
      await nameInput.fill('Alice Johnson');
      await expect(nameInput).toHaveValue('Alice Johnson', { timeout: 5000 });
      await ionBlur(nameInput);

      await emailInput.fill('alice@example.com');
      await expect(emailInput).toHaveValue('alice@example.com', { timeout: 5000 });
      await ionBlur(emailInput);

      await messageTextarea.fill('I would like to inquire about your services.');
      await expect(messageTextarea).toHaveValue('I would like to inquire about your services.', { timeout: 5000 });
      await ionBlur(messageTextarea);

      // Wait for submit button to be enabled
      await page.waitForSelector('[data-testid="contact-form"] #submit ion-button:not([aria-disabled="true"])', {
        state: 'visible',
        timeout: 10000,
      });

      // Form should be valid
      await expect(submitButton).not.toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });

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
