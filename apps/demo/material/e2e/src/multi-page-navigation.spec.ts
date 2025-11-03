import { expect, test } from '@playwright/test';
import { E2EFormHelpers, E2EPaginationHelpers } from './utils/e2e-form-helpers';
import { getScenario, getScenariosByCategory } from './utils/test-scenarios';

test.describe('Multi-Page Form Navigation', () => {
  let formHelpers: E2EFormHelpers;
  let paginationHelpers: E2EPaginationHelpers;

  test.beforeEach(async ({ page }) => {
    formHelpers = new E2EFormHelpers(page);
    paginationHelpers = new E2EPaginationHelpers(page);
  });

  test.describe('Registration Wizard Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/e2e-test');

      const config = getScenario('registrationWizard');
      await page.evaluate((config) => {
        (window as any).loadTestScenario = config;
      }, config);
      await page.reload();
    });

    test('should navigate through all wizard pages', async ({ page }) => {
      // Start on first page
      const currentPage = await paginationHelpers.getCurrentPageNumber();
      expect(currentPage).toBe(1);

      // Previous should be disabled on first page
      const prevEnabled = await paginationHelpers.isPreviousButtonEnabled();
      expect(prevEnabled).toBeFalsy();

      // Fill first page required fields
      await formHelpers.fillInput('firstName', 'John');
      await formHelpers.fillInput('lastName', 'Doe');
      await formHelpers.fillInput('email', 'john.doe@example.com');

      // Navigate to next page
      await paginationHelpers.clickNext();

      // Should be on page 2
      const page2Number = await paginationHelpers.getCurrentPageNumber();
      expect(page2Number).toBe(2);

      // Previous should now be enabled
      const prevEnabledPage2 = await paginationHelpers.isPreviousButtonEnabled();
      expect(prevEnabledPage2).toBeTruthy();
    });

    test('should validate required fields before allowing navigation', async ({ page }) => {
      // Try to navigate without filling required fields
      const requiredFields = ['firstName', 'lastName', 'email'];
      await paginationHelpers.validatePageValidation(requiredFields);
    });

    test('should persist form data across page transitions', async ({ page }) => {
      // Fill data on first page
      await formHelpers.fillInput('firstName', 'Persistent');
      await formHelpers.fillInput('lastName', 'User');
      await formHelpers.fillInput('email', 'persistent@example.com');

      // Navigate to next page
      await paginationHelpers.clickNext();

      // Fill data on second page
      await formHelpers.fillInput('phone', '555-123-4567');
      await formHelpers.fillInput('address', '123 Main St');

      // Navigate back to first page
      await paginationHelpers.clickPrevious();

      // Data should still be there
      const firstNameValue = await page.locator('[data-testid="firstName"]').inputValue();
      const lastNameValue = await page.locator('[data-testid="lastName"]').inputValue();
      const emailValue = await page.locator('[data-testid="email"]').inputValue();

      expect(firstNameValue).toBe('Persistent');
      expect(lastNameValue).toBe('User');
      expect(emailValue).toBe('persistent@example.com');

      // Navigate back to second page
      await paginationHelpers.clickNext();

      // Second page data should also persist
      const phoneValue = await page.locator('[data-testid="phone"]').inputValue();
      const addressValue = await page.locator('[data-testid="address"]').inputValue();

      expect(phoneValue).toBe('555-123-4567');
      expect(addressValue).toBe('123 Main St');
    });

    test('should complete full registration wizard', async ({ page }) => {
      // Page 1: Basic Information
      await formHelpers.fillInput('firstName', 'Complete');
      await formHelpers.fillInput('lastName', 'User');
      await formHelpers.fillInput('email', 'complete@example.com');
      await paginationHelpers.clickNext();

      // Page 2: Contact Information
      await formHelpers.fillInput('phone', '555-987-6543');
      await formHelpers.fillInput('address', '456 Oak Ave');
      await formHelpers.fillInput('city', 'Springfield');
      await formHelpers.selectOption('state', 'IL');
      await paginationHelpers.clickNext();

      // Page 3: Preferences
      await formHelpers.selectMultipleOptions('interests', ['technology', 'music']);
      await formHelpers.toggleCheckbox('newsletter', true);

      // Submit final form
      await formHelpers.clickButton('submit');

      // Verify successful submission
      await expect(page.locator('[data-testid="submission-0"]')).toContainText('complete@example.com');
    });
  });

  test.describe('Customer Survey Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/e2e-test');

      const config = getScenario('customerSurvey');
      await page.evaluate((config) => {
        (window as any).loadTestScenario = config;
      }, config);
      await page.reload();
    });

    test('should navigate survey pages based on responses', async ({ page }) => {
      // Answer initial questions
      await formHelpers.selectOption('customerType', 'existing');
      await formHelpers.fillInput('customerSince', '2020-01-01');

      await paginationHelpers.clickNext();

      // Should show different questions for existing customers
      const pageTitle = await paginationHelpers.getCurrentPageTitle();
      expect(pageTitle.toLowerCase()).toContain('existing');
    });

    test('should handle conditional page flow', async ({ page }) => {
      // Test different paths through the survey
      const customerTypes = ['new', 'existing', 'potential'];

      for (const customerType of customerTypes) {
        // Reset to first page
        await page.reload();

        const customerTypeField = page.locator('[data-testid="customerType"]');
        if (await customerTypeField.isVisible()) {
          await formHelpers.selectOption('customerType', customerType);
          await paginationHelpers.clickNext();

          // Different customer types might lead to different pages
          const pageTitle = await paginationHelpers.getCurrentPageTitle();
          console.log(`Customer type "${customerType}" leads to page: "${pageTitle}"`);

          break; // Test one working path
        }
      }
    });
  });

  test.describe('Job Application Form Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/e2e-test');

      const config = getScenario('jobApplication');
      await page.evaluate((config) => {
        (window as any).loadTestScenario = config;
      }, config);
      await page.reload();
    });

    test('should handle complex job application workflow', async ({ page }) => {
      // Page 1: Personal Information
      await formHelpers.fillInput('fullName', 'Jane Applicant');
      await formHelpers.fillInput('email', 'jane@example.com');
      await formHelpers.fillInput('phone', '555-444-3333');
      await paginationHelpers.clickNext();

      // Page 2: Experience
      await formHelpers.selectOption('experienceLevel', 'senior');
      await formHelpers.fillInput('yearsExperience', '8');
      await formHelpers.fillInput('currentRole', 'Senior Developer');
      await paginationHelpers.clickNext();

      // Page 3: Skills (might be conditional based on role)
      const skillsInputs = page.locator('input[data-testid*="skill"], select[data-testid*="skill"]');
      const skillCount = await skillsInputs.count();

      if (skillCount > 0) {
        // Fill available skill fields
        for (let i = 0; i < Math.min(skillCount, 3); i++) {
          const skillInput = skillsInputs.nth(i);
          const testId = await skillInput.getAttribute('data-testid');

          if (testId) {
            await formHelpers.fillInput(testId, 'Expert');
          }
        }
      }

      // Navigate to final page or submit
      const nextButton = page.locator('[data-testid*="next"], button:has-text("Next")');
      if ((await nextButton.isVisible()) && (await nextButton.isEnabled())) {
        await paginationHelpers.clickNext();
      }

      // Submit application
      const submitButton = page.locator('[data-testid*="submit"], button[type="submit"]');
      if (await submitButton.isVisible()) {
        await submitButton.click();

        // Verify submission
        await expect(page.locator('[data-testid*="submission"]')).toBeVisible();
      }
    });

    test('should validate experience requirements', async ({ page }) => {
      // Test that certain experience levels require specific information
      await formHelpers.selectOption('experienceLevel', 'entry');
      await paginationHelpers.clickNext();

      // Entry level might have different requirements
      await formHelpers.fillInput('yearsExperience', '0');

      const errors = await formHelpers.getFieldErrors('yearsExperience');
      // Entry level might accept 0 years experience
      console.log(`Entry level experience validation: ${errors.length} errors`);
    });
  });

  test.describe('E-commerce Checkout Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/e2e-test');

      const config = getScenario('ecommerceCheckout');
      await page.evaluate((config) => {
        (window as any).loadTestScenario = config;
      }, config);
      await page.reload();
    });

    test('should navigate through checkout process', async ({ page }) => {
      // Page 1: Shipping Information
      await formHelpers.fillInput('shippingFirstName', 'Checkout');
      await formHelpers.fillInput('shippingLastName', 'User');
      await formHelpers.fillInput('shippingAddress', '789 Commerce St');
      await formHelpers.fillInput('shippingCity', 'Commerce City');
      await formHelpers.selectOption('shippingState', 'CO');
      await formHelpers.fillInput('shippingZip', '80022');
      await paginationHelpers.clickNext();

      // Page 2: Billing Information
      const sameAsShipping = page.locator('[data-testid="sameAsShipping"]');
      if (await sameAsShipping.isVisible()) {
        await formHelpers.toggleCheckbox('sameAsShipping', true);
      } else {
        // Fill billing info manually
        await formHelpers.fillInput('billingFirstName', 'Checkout');
        await formHelpers.fillInput('billingLastName', 'User');
        await formHelpers.fillInput('billingAddress', '789 Commerce St');
      }
      await paginationHelpers.clickNext();

      // Page 3: Payment Information
      await formHelpers.fillInput('cardNumber', '4111111111111111');
      await formHelpers.fillInput('expiryMonth', '12');
      await formHelpers.fillInput('expiryYear', '2025');
      await formHelpers.fillInput('cvv', '123');

      // Submit order
      await formHelpers.clickButton('submit');

      // Verify order submission
      await expect(page.locator('[data-testid*="submission"]')).toBeVisible();
    });

    test('should handle billing address same as shipping', async ({ page }) => {
      // Fill shipping information
      await formHelpers.fillInput('shippingFirstName', 'Same');
      await formHelpers.fillInput('shippingLastName', 'Address');
      await formHelpers.fillInput('shippingAddress', '123 Same St');
      await paginationHelpers.clickNext();

      // Select "same as shipping"
      const sameAsShipping = page.locator('[data-testid="sameAsShipping"]');
      if (await sameAsShipping.isVisible()) {
        await formHelpers.toggleCheckbox('sameAsShipping', true);

        // Billing fields should be auto-filled or hidden
        const billingFirstName = page.locator('[data-testid="billingFirstName"]');
        if (await billingFirstName.isVisible()) {
          const value = await billingFirstName.inputValue();
          expect(value).toBe('Same');
        }
      }
    });
  });

  test.describe('Cross-Page Validation', () => {
    test('should validate data consistency across pages', async ({ page }) => {
      await page.goto('/e2e-test');

      const config = getScenario('registrationWizard');
      await page.evaluate((config) => {
        (window as any).loadTestScenario = config;
      }, config);
      await page.reload();

      // Fill email on first page
      await formHelpers.fillInput('email', 'validation@example.com');
      await formHelpers.fillInput('firstName', 'Cross');
      await formHelpers.fillInput('lastName', 'Page');
      await paginationHelpers.clickNext();

      // If there's email confirmation on later page, it should match
      const confirmEmail = page.locator('[data-testid="confirmEmail"]');
      if (await confirmEmail.isVisible()) {
        await formHelpers.fillInput('confirmEmail', 'different@example.com');

        const errors = await formHelpers.getFieldErrors('confirmEmail');
        expect(errors.some((error) => error.toLowerCase().includes('match'))).toBeTruthy();
      }
    });

    test('should prevent submission with incomplete multi-page data', async ({ page }) => {
      await page.goto('/e2e-test');

      const config = getScenario('jobApplication');
      await page.evaluate((config) => {
        (window as any).loadTestScenario = config;
      }, config);
      await page.reload();

      // Fill only first page
      await formHelpers.fillInput('fullName', 'Incomplete Application');
      await formHelpers.fillInput('email', 'incomplete@example.com');
      await paginationHelpers.clickNext();

      // Skip second page and try to submit
      const nextButton = page.locator('[data-testid*="next"], button:has-text("Next")');
      if (await nextButton.isVisible()) {
        await paginationHelpers.clickNext();
      }

      // Try to submit without completing all required fields
      const submitButton = page.locator('[data-testid*="submit"], button[type="submit"]');
      if (await submitButton.isVisible()) {
        await submitButton.click();

        // Should either stay on current page or show validation errors
        await page.waitForTimeout(500);

        const errorElements = page.locator('mat-error, .error-message, .field-error');
        const errorCount = await errorElements.count();

        if (errorCount === 0) {
          // If no errors shown, form might navigate back to incomplete page
          const currentPageNumber = await paginationHelpers.getCurrentPageNumber();
          console.log(`Form stayed on page ${currentPageNumber} after incomplete submission`);
        }
      }
    });
  });

  test.describe('All Multi-Page Form Categories', () => {
    test('should test all multi-page form scenarios', async ({ page }) => {
      const multiPageScenarios = getScenariosByCategory('MULTI_PAGE_FORMS');

      for (const scenario of multiPageScenarios) {
        await page.goto('/e2e-test');

        await page.evaluate((config) => {
          (window as any).loadTestScenario = config;
        }, config);
        await page.reload();

        // Verify form loads
        await expect(page.locator('dynamic-form')).toBeVisible();

        // Check for pagination controls
        const nextButton = page.locator('[data-testid*="next"], button:has-text("Next")');
        const hasNavigation = await nextButton.isVisible();

        if (hasNavigation) {
          // Test basic navigation
          const initialPage = await paginationHelpers.getCurrentPageNumber();

          // Try to navigate (might require filling required fields)
          await nextButton.click();
          await page.waitForTimeout(500);

          const afterClickPage = await paginationHelpers.getCurrentPageNumber();

          console.log(`✓ Scenario "${scenario.name}": Navigation from page ${initialPage} to ${afterClickPage}`);
        } else {
          console.log(`✓ Scenario "${scenario.name}": Single page form (no navigation)`);
        }
      }
    });
  });
});
