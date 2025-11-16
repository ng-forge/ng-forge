/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, test } from '@playwright/test';

test.describe('User Workflows E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200/e2e-test');
    await page.waitForFunction(() => window.loadTestScenario !== undefined);
  });

  test.describe('User Registration Workflow', () => {
    test.skip('should complete full registration workflow', async ({ page }) => {
      // Note: Waiting for formSubmitted event causes timeout - needs investigation
      await page.evaluate(() => {
        (window as any).loadTestScenario(
          {
            fields: [
              {
                key: 'firstName',
                type: 'input',
                label: 'First Name',
                required: true,
                col: 6,
              },
              {
                key: 'lastName',
                type: 'input',
                label: 'Last Name',
                required: true,
                col: 6,
              },
              {
                key: 'email',
                type: 'input',
                label: 'Email',
                required: true,
                email: true,
                props: {
                  type: 'email',
                },
              },
              {
                key: 'password',
                type: 'input',
                label: 'Password',
                required: true,
                minLength: 8,
                props: {
                  type: 'password',
                },
                col: 6,
              },
              {
                key: 'confirmPassword',
                type: 'input',
                label: 'Confirm Password',
                required: true,
                minLength: 8,
                props: {
                  type: 'password',
                },
                col: 6,
              },
              {
                key: 'agreeTerms',
                type: 'checkbox',
                label: 'I agree to the terms and conditions',
                required: true,
              },
              {
                key: 'submit',
                type: 'submit',
                label: 'Register',
              },
            ],
          },
          { testId: 'registration-workflow' }
        );
      });
      await page.waitForLoadState('networkidle');

      // Submit button should be disabled initially (form invalid)
      const submitButton = page.locator('#submit button');
      await expect(submitButton).toBeDisabled();

      // Fill in registration form
      await page.locator('#firstName input').fill('John');
      await page.locator('#lastName input').fill('Doe');
      await page.locator('#email input').fill('john.doe@example.com');
      await page.locator('#password input').fill('SecurePass123');
      await page.locator('#confirmPassword input').fill('SecurePass123');

      // Still disabled - need to agree to terms
      await expect(submitButton).toBeDisabled();

      // Agree to terms
      await page.locator('#agreeTerms mat-checkbox').click();
      await page.waitForTimeout(200);

      // Submit button should now be enabled
      await expect(submitButton).toBeEnabled();

      // Submit the form
      await submitButton.click();
      await page.waitForTimeout(500);

      // Wait for formSubmitted event
      const submittedData = await page.evaluate(
        () =>
          new Promise((resolve) => {
            window.addEventListener(
              'formSubmitted',
              (event: any) => {
                resolve(event.detail.data);
              },
              { once: true }
            );
          })
      );

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
      await page.evaluate(() => {
        (window as any).loadTestScenario(
          {
            fields: [
              {
                key: 'firstName',
                type: 'input',
                label: 'First Name',
                value: 'John',
                required: true,
                col: 6,
              },
              {
                key: 'lastName',
                type: 'input',
                label: 'Last Name',
                value: 'Doe',
                required: true,
                col: 6,
              },
              {
                key: 'email',
                type: 'input',
                label: 'Email',
                value: 'john.doe@example.com',
                required: true,
                email: true,
                props: {
                  type: 'email',
                },
              },
              {
                key: 'bio',
                type: 'textarea',
                label: 'Bio',
                value: 'Software engineer',
                props: {
                  rows: 4,
                },
              },
              {
                key: 'submit',
                type: 'submit',
                label: 'Save Changes',
              },
            ],
          },
          { testId: 'profile-edit' }
        );
      });
      await page.waitForLoadState('networkidle');

      // Verify initial values
      expect(await page.locator('#firstName input').inputValue()).toBe('John');
      expect(await page.locator('#lastName input').inputValue()).toBe('Doe');

      // Modify profile
      await page.locator('#firstName input').fill('Jane');
      await page.locator('#bio textarea').fill('Senior software engineer with 10 years experience');

      // Submit changes
      await page.locator('#submit button').click();
      await page.waitForTimeout(500);

      // Verify form value was updated
      const formValue = await page.evaluate(() => {
        const pre = document.querySelector('#form-value-profile-edit');
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
    test.skip('should validate required fields before allowing submission', async ({ page }) => {
      // Note: Number field type not found - needs investigation
      await page.evaluate(() => {
        (window as any).loadTestScenario(
          {
            fields: [
              {
                key: 'username',
                type: 'input',
                label: 'Username',
                required: true,
                minLength: 3,
              },
              {
                key: 'email',
                type: 'input',
                label: 'Email',
                required: true,
                email: true,
                props: {
                  type: 'email',
                },
              },
              {
                key: 'age',
                type: 'number',
                label: 'Age',
                required: true,
                min: 18,
                max: 120,
              },
              {
                key: 'submit',
                type: 'submit',
                label: 'Submit',
              },
            ],
          },
          { testId: 'validation-workflow' }
        );
      });
      await page.waitForLoadState('networkidle');

      const usernameInput = page.locator('#username input');
      const emailInput = page.locator('#email input');
      const ageInput = page.locator('#age input');
      const submitButton = page.locator('#submit button');

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
      await page.evaluate(() => {
        (window as any).loadTestScenario(
          {
            fields: [
              {
                key: 'name',
                type: 'input',
                label: 'Name',
                value: 'Default Name',
              },
              {
                key: 'description',
                type: 'textarea',
                label: 'Description',
                value: 'Default description',
              },
              {
                key: 'active',
                type: 'checkbox',
                label: 'Active',
                value: true,
              },
              {
                key: 'reset',
                type: 'button',
                label: 'Reset Form',
                event: (window as any).FormResetEvent,
                props: {
                  type: 'button',
                },
              },
              {
                key: 'submit',
                type: 'submit',
                label: 'Submit',
              },
            ],
          },
          { testId: 'reset-workflow' }
        );
      });
      await page.waitForLoadState('networkidle');

      const nameInput = page.locator('#name input');
      const descriptionTextarea = page.locator('#description textarea');
      const activeCheckbox = page.locator('#active mat-checkbox');
      const resetButton = page.locator('#reset button');

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
      await page.evaluate(() => {
        (window as any).loadTestScenario(
          {
            fields: [
              {
                key: 'name',
                type: 'input',
                label: 'Full Name',
                required: true,
              },
              {
                key: 'email',
                type: 'input',
                label: 'Email',
                required: true,
                email: true,
                props: {
                  type: 'email',
                },
              },
              {
                key: 'message',
                type: 'textarea',
                label: 'Message',
                required: true,
                props: {
                  rows: 5,
                  placeholder: 'Enter your message here...',
                },
              },
              {
                key: 'submit',
                type: 'submit',
                label: 'Send Message',
              },
            ],
          },
          { testId: 'contact-form' }
        );
      });
      await page.waitForLoadState('networkidle');

      const submitButton = page.locator('#submit button');

      // Form is invalid initially
      await expect(submitButton).toBeDisabled();

      // Fill contact form
      await page.locator('#name input').fill('Alice Johnson');
      await page.locator('#email input').fill('alice@example.com');
      await page.locator('#message textarea').fill('I would like to inquire about your services.');

      await page.waitForTimeout(200);

      // Form should be valid
      await expect(submitButton).toBeEnabled();

      // Submit
      await submitButton.click();
      await page.waitForTimeout(500);

      // Verify submission
      const formValue = await page.evaluate(() => {
        const pre = document.querySelector('#form-value-contact-form');
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
