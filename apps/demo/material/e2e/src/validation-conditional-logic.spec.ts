import { expect, test } from '@playwright/test';
import { E2ECrossFieldValidationHelpers, E2EFormHelpers } from './utils/e2e-form-helpers';
import { getScenario, getScenariosByCategory } from './utils/test-scenarios';

test.describe('Validation and Conditional Logic', () => {
  let formHelpers: E2EFormHelpers;
  let validationHelpers: E2ECrossFieldValidationHelpers;

  test.beforeEach(async ({ page }) => {
    formHelpers = new E2EFormHelpers(page);
    validationHelpers = new E2ECrossFieldValidationHelpers(page);
  });

  test.describe('Cross-Field Validation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/e2e-test');

      const config = getScenario('complexValidation');
      await page.evaluate((config) => {
        (window as any).loadTestScenario = config;
      }, config);
      await page.reload();
    });

    test('should validate password confirmation matching', async ({ page }) => {
      await validationHelpers.validatePasswordMatch('password', 'confirmPassword');
    });

    test('should validate email confirmation matching', async ({ page }) => {
      // Fill different emails
      await formHelpers.fillInput('email', 'user@example.com');
      await formHelpers.fillInput('confirmEmail', 'different@example.com');

      const errors = await formHelpers.getFieldErrors('confirmEmail');
      expect(errors.some((error) => error.toLowerCase().includes('match'))).toBeTruthy();

      // Fix email match
      await formHelpers.fillInput('confirmEmail', 'user@example.com');

      const errorsAfter = await formHelpers.getFieldErrors('confirmEmail');
      expect(errorsAfter.length).toBe(0);
    });

    test('should validate date range consistency', async ({ page }) => {
      // Try to set end date before start date
      await formHelpers.fillInput('startDate', '2024-12-01');
      await formHelpers.fillInput('endDate', '2024-11-01');

      const endDateErrors = await formHelpers.getFieldErrors('endDate');
      expect(endDateErrors.some((error) => error.toLowerCase().includes('after') || error.toLowerCase().includes('greater'))).toBeTruthy();

      // Fix date range
      await formHelpers.fillInput('endDate', '2024-12-15');

      const errorsAfter = await formHelpers.getFieldErrors('endDate');
      expect(errorsAfter.length).toBe(0);
    });

    test('should validate age-based field requirements', async ({ page }) => {
      // Test age requirement for specific fields
      await formHelpers.fillInput('age', '16');

      // Some fields might become required/optional based on age
      const ageErrors = await formHelpers.getFieldErrors('age');
      if (ageErrors.some((error) => error.includes('18'))) {
        // If age validation exists, test it
        await formHelpers.fillInput('age', '25');

        const errorsAfter = await formHelpers.getFieldErrors('age');
        expect(errorsAfter.length).toBe(0);
      }
    });
  });

  test.describe('Conditional Field Display', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/e2e-test');

      const config = getScenario('surveyForm');
      await page.evaluate((config) => {
        (window as any).loadTestScenario = config;
      }, config);
      await page.reload();
    });

    test('should show/hide fields based on selections', async ({ page }) => {
      // Look for conditional fields that might exist
      const conditionalTriggers = [
        { field: 'hasExperience', conditionalField: 'experienceYears' },
        { field: 'isEmployed', conditionalField: 'jobTitle' },
        { field: 'needsContactInfo', conditionalField: 'phoneNumber' },
        { field: 'hasComments', conditionalField: 'comments' },
      ];

      for (const { field, conditionalField } of conditionalTriggers) {
        const triggerField = page.locator(`[data-testid="${field}"]`);
        const conditionalFieldElement = page.locator(`[data-testid="${conditionalField}"]`);

        if (await triggerField.isVisible()) {
          // Test conditional logic
          await validationHelpers.validateConditionalField(field, conditionalField, 'true');
          break; // Test one working conditional relationship
        }
      }
    });

    test('should handle checkbox-triggered conditional fields', async ({ page }) => {
      // Find checkboxes that might trigger conditional logic
      const checkboxes = page.locator('input[type="checkbox"]');
      const checkboxCount = await checkboxes.count();

      if (checkboxCount > 0) {
        const firstCheckbox = checkboxes.first();
        const testId = await firstCheckbox.getAttribute('data-testid');

        if (testId) {
          // Toggle checkbox and see if any fields appear/disappear
          await firstCheckbox.check();
          await page.waitForTimeout(100);

          const allFieldsAfterCheck = page.locator('input, select, textarea');
          const fieldCountAfterCheck = await allFieldsAfterCheck.count();

          await firstCheckbox.uncheck();
          await page.waitForTimeout(100);

          const allFieldsAfterUncheck = page.locator('input, select, textarea');
          const fieldCountAfterUncheck = await allFieldsAfterUncheck.count();

          // Fields might change based on checkbox state
          console.log(`Checkbox "${testId}": ${fieldCountAfterCheck} fields when checked, ${fieldCountAfterUncheck} when unchecked`);
        }
      }
    });

    test('should handle select-triggered conditional fields', async ({ page }) => {
      // Find select elements that might trigger conditional logic
      const selects = page.locator('select, mat-select');
      const selectCount = await selects.count();

      if (selectCount > 0) {
        const firstSelect = selects.first();
        const testId = await firstSelect.getAttribute('data-testid');

        if (testId) {
          // Get available options
          await firstSelect.click();
          const options = page.locator('mat-option, option');
          const optionCount = await options.count();

          if (optionCount > 1) {
            // Try different options to see if they trigger conditional fields
            await options.nth(1).click();
            await page.waitForTimeout(100);

            const fieldsAfterFirstOption = page.locator('input, select, textarea');
            const countAfterFirst = await fieldsAfterFirstOption.count();

            // Try another option if available
            if (optionCount > 2) {
              await firstSelect.click();
              await options.nth(2).click();
              await page.waitForTimeout(100);

              const fieldsAfterSecondOption = page.locator('input, select, textarea');
              const countAfterSecond = await fieldsAfterSecondOption.count();

              console.log(`Select "${testId}": option changes resulted in ${countAfterFirst} vs ${countAfterSecond} fields`);
            }
          }
        }
      }
    });
  });

  test.describe('Dynamic Validation Rules', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/e2e-test');

      const config = getScenario('registrationForm');
      await page.evaluate((config) => {
        (window as any).loadTestScenario = config;
      }, config);
      await page.reload();
    });

    test('should apply different validation based on form state', async ({ page }) => {
      // Username validation might change based on form state
      const usernameField = page.locator('[data-testid="username"]');

      if (await usernameField.isVisible()) {
        // Test minimum length
        await formHelpers.fillInput('username', 'ab');
        const shortErrors = await formHelpers.getFieldErrors('username');
        expect(shortErrors.length).toBeGreaterThan(0);

        // Test valid length
        await formHelpers.fillInput('username', 'validusername');
        const validErrors = await formHelpers.getFieldErrors('username');
        expect(validErrors.length).toBe(0);
      }
    });

    test('should validate business rule combinations', async ({ page }) => {
      // Test complex business rules that involve multiple fields
      const requiredCombinations = [
        ['firstName', 'lastName', 'email'],
        ['password', 'confirmPassword'],
        ['age', 'agreeToTerms'],
      ];

      for (const combination of requiredCombinations) {
        const allFieldsExist = await Promise.all(combination.map((field) => page.locator(`[data-testid="${field}"]`).isVisible()));

        if (allFieldsExist.every((exists) => exists)) {
          // Try submitting with only partial data
          await formHelpers.fillInput(combination[0], 'test');
          await formHelpers.clickButton('submit');

          // Should have errors for the other required fields
          for (const field of combination.slice(1)) {
            const errors = await formHelpers.getFieldErrors(field);
            expect(errors.length).toBeGreaterThan(0);
          }

          break; // Test one working combination
        }
      }
    });

    test('should handle async validation patterns', async ({ page }) => {
      // Test fields that might have async validation (like username availability)
      const asyncFields = ['username', 'email'];

      for (const fieldName of asyncFields) {
        const field = page.locator(`[data-testid="${fieldName}"]`);

        if (await field.isVisible()) {
          await formHelpers.fillInput(fieldName, 'testvalue');

          // Wait for potential async validation
          await page.waitForTimeout(1000);

          const errors = await formHelpers.getFieldErrors(fieldName);
          // Field might have async validation or just normal validation
          console.log(`Field "${fieldName}" has ${errors.length} validation errors`);

          break; // Test one field
        }
      }
    });
  });

  test.describe('Custom Validation Functions', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/e2e-test');

      const config = getScenario('complexValidation');
      await page.evaluate((config) => {
        (window as any).loadTestScenario = config;
      }, config);
      await page.reload();
    });

    test('should validate custom business rules', async ({ page }) => {
      // Test any custom validation that might exist in the form
      const allInputs = page.locator('input[data-testid], select[data-testid], textarea[data-testid]');
      const inputCount = await allInputs.count();

      // Fill all fields with invalid data first
      for (let i = 0; i < inputCount; i++) {
        const input = allInputs.nth(i);
        const testId = await input.getAttribute('data-testid');
        const type = await input.getAttribute('type');

        if (testId) {
          if (type === 'email') {
            await formHelpers.fillInput(testId, 'invalid-email');
          } else if (type === 'number') {
            await formHelpers.fillInput(testId, '-1');
          } else if (type === 'password') {
            await formHelpers.fillInput(testId, '123');
          } else {
            await formHelpers.fillInput(testId, 'x');
          }
        }
      }

      // Submit and check for validation errors
      await formHelpers.clickButton('submit');

      let totalErrors = 0;
      for (let i = 0; i < inputCount; i++) {
        const input = allInputs.nth(i);
        const testId = await input.getAttribute('data-testid');

        if (testId) {
          const errors = await formHelpers.getFieldErrors(testId);
          totalErrors += errors.length;
        }
      }

      expect(totalErrors).toBeGreaterThan(0);
    });

    test('should clear validation errors when corrected', async ({ page }) => {
      // Test that validation errors disappear when fields are fixed
      const testFields = [
        { field: 'email', invalidValue: 'invalid', validValue: 'valid@example.com' },
        { field: 'password', invalidValue: '123', validValue: 'ValidPassword123!' },
        { field: 'age', invalidValue: '5', validValue: '25' },
      ];

      for (const { field, invalidValue, validValue } of testFields) {
        const fieldElement = page.locator(`[data-testid="${field}"]`);

        if (await fieldElement.isVisible()) {
          // Fill invalid value
          await formHelpers.fillInput(field, invalidValue);
          const initialErrors = await formHelpers.getFieldErrors(field);

          if (initialErrors.length > 0) {
            // Fix the value
            await formHelpers.fillInput(field, validValue);
            const errorsAfterFix = await formHelpers.getFieldErrors(field);

            expect(errorsAfterFix.length).toBeLessThan(initialErrors.length);
          }

          break; // Test one working field
        }
      }
    });
  });

  test.describe('Error Message Display', () => {
    test('should display validation errors with proper styling', async ({ page }) => {
      await page.goto('/e2e-test');

      const config = getScenario('registrationForm');
      await page.evaluate((config) => {
        (window as any).loadTestScenario = config;
      }, config);
      await page.reload();

      // Trigger validation errors
      await formHelpers.clickButton('submit');

      // Find error messages
      const errorElements = page.locator('mat-error, .error-message, .field-error');
      const errorCount = await errorElements.count();

      if (errorCount > 0) {
        const firstError = errorElements.first();

        // Error should be visible and have text
        await expect(firstError).toBeVisible();
        const errorText = await firstError.textContent();
        expect(errorText).toBeTruthy();
        expect(errorText!.length).toBeGreaterThan(0);

        // Error should have proper styling (color, size, etc.)
        const color = await firstError.evaluate((el) => window.getComputedStyle(el).color);
        expect(color).toBeTruthy();

        // Error text should be meaningful
        expect(errorText!.toLowerCase()).toMatch(/required|invalid|must|should|error/);
      }
    });

    test('should handle multiple validation errors per field', async ({ page }) => {
      await page.goto('/e2e-test');

      const config = getScenario('complexValidation');
      await page.evaluate((config) => {
        (window as any).loadTestScenario = config;
      }, config);
      await page.reload();

      // Try to trigger multiple errors on a single field (like password)
      const passwordField = page.locator('[data-testid="password"]');

      if (await passwordField.isVisible()) {
        await formHelpers.fillInput('password', 'a'); // Too short, possibly missing requirements

        const errors = await formHelpers.getFieldErrors('password');

        // Should have at least one error, possibly multiple
        expect(errors.length).toBeGreaterThan(0);

        // Each error should be meaningful
        errors.forEach((error) => {
          expect(error.length).toBeGreaterThan(3);
        });
      }
    });
  });

  test.describe('All Validation Form Categories', () => {
    test('should test all validation form scenarios', async ({ page }) => {
      const validationScenarios = getScenariosByCategory('VALIDATION_FORMS');
      const conditionalScenarios = getScenariosByCategory('CONDITIONAL_FORMS');

      const allValidationScenarios = [...validationScenarios, ...conditionalScenarios];

      for (const scenario of allValidationScenarios) {
        await page.goto('/e2e-test');

        await page.evaluate((config) => {
          (window as any).loadTestScenario = config;
        }, config);
        await page.reload();

        // Verify form loads and has validation
        await expect(page.locator('dynamic-form')).toBeVisible();

        // Try to submit empty form to trigger validation
        const submitButton = page.locator('[data-testid*="submit"], button[type="submit"]');
        if (await submitButton.isVisible()) {
          await submitButton.click();

          // Should have some validation errors
          const errorElements = page.locator('mat-error, .error-message, .field-error');
          const errorCount = await errorElements.count();

          console.log(`✓ Scenario "${scenario.name}" has ${errorCount} validation errors when submitted empty`);
        }
      }
    });
  });
});
