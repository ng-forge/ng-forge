import { expect, test } from '@playwright/test';

test.describe('User Workflows E2E Tests', () => {
  test.afterEach(async (_, testInfo) => {
    if (testInfo.status === 'passed') {
      console.info(`✅ TEST PASSED: ${testInfo.title}`);
    }
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4201/#/test/user-workflows');
    await page.waitForLoadState('networkidle');
  });

  test.describe('User Registration Workflow', () => {
    test('should complete full registration workflow', async ({ page }) => {
      // Locate the specific test scenario
      const scenario = page.locator('[data-testid="registration-workflow"]');
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

      // Agree to terms
      await scenario.locator('#agreeTerms mat-checkbox').click();
      await page.waitForTimeout(200);

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
    test('should edit and save user profile', async ({ page }) => {
      // Locate the specific test scenario
      const scenario = page.locator('[data-testid="profile-edit"]');
      await expect(scenario).toBeVisible();

      // Verify initial values
      expect(await scenario.locator('#firstName input').inputValue()).toBe('John');
      expect(await scenario.locator('#lastName input').inputValue()).toBe('Doe');

      // Modify profile
      await scenario.locator('#firstName input').fill('Jane');
      await scenario.locator('#bio textarea').fill('Senior software engineer with 10 years experience');

      // Submit changes
      await scenario.locator('#submit button').click();
      await page.waitForTimeout(500);

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
    test('should validate required fields before allowing submission', async ({ page }) => {
      // Locate the specific test scenario
      const scenario = page.locator('[data-testid="validation-workflow"]');
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
      await page.waitForTimeout(200);

      // Form should now be valid
      await expect(submitButton).toBeEnabled();
    });
  });

  test.describe('Form Reset Workflow', () => {
    test('should reset form after modification', async ({ page }) => {
      // Locate the specific test scenario
      const scenario = page.locator('[data-testid="reset-workflow"]');
      await expect(scenario).toBeVisible();

      const nameInput = scenario.locator('#name input');
      const descriptionTextarea = scenario.locator('#description textarea');
      const activeCheckbox = scenario.locator('#active mat-checkbox');
      const resetButton = scenario.locator('#reset button');

      // Verify defaults
      expect(await nameInput.inputValue()).toBe('Default Name');
      await expect(activeCheckbox).toHaveClass(/mat-mdc-checkbox-checked/);

      // Modify all fields
      await nameInput.fill('Modified Name');
      await descriptionTextarea.fill('Modified description');
      await activeCheckbox.click();
      await page.waitForTimeout(200);

      // Verify modifications
      expect(await nameInput.inputValue()).toBe('Modified Name');
      expect(await descriptionTextarea.inputValue()).toBe('Modified description');
      await expect(activeCheckbox).not.toHaveClass(/mat-mdc-checkbox-checked/);

      // Reset form
      await resetButton.click();
      await page.waitForTimeout(300);

      // Verify reset to defaults
      expect(await nameInput.inputValue()).toBe('Default Name');
      expect(await descriptionTextarea.inputValue()).toBe('Default description');
      await expect(activeCheckbox).toHaveClass(/mat-mdc-checkbox-checked/);
    });
  });

  test.describe('Complex Form Workflow', () => {
    test('should complete contact form', async ({ page }) => {
      // Locate the specific test scenario
      const scenario = page.locator('[data-testid="contact-form"]');
      await expect(scenario).toBeVisible();

      const submitButton = scenario.locator('#submit button');

      // Form is invalid initially
      await expect(submitButton).toBeDisabled();

      // Fill contact form
      await scenario.locator('#name input').fill('Alice Johnson');
      await scenario.locator('#email input').fill('alice@example.com');
      await scenario.locator('#message textarea').fill('I would like to inquire about your services.');

      await page.waitForTimeout(200);

      // Form should be valid
      await expect(submitButton).toBeEnabled();

      // Submit
      await submitButton.click();
      await page.waitForTimeout(500);

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
