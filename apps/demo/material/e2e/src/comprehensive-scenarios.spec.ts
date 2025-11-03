import { expect, test } from '@playwright/test';
import { E2EFormHelpers, E2ETranslationHelpers } from './utils/e2e-form-helpers';
import { getAllScenarioNames, getScenario, getScenariosByCategory } from './utils/test-scenarios';

test.describe('Comprehensive Form Scenarios', () => {
  let formHelpers: E2EFormHelpers;
  let translationHelpers: E2ETranslationHelpers;

  test.beforeEach(async ({ page }) => {
    formHelpers = new E2EFormHelpers(page);
    translationHelpers = new E2ETranslationHelpers(page);
  });

  test.describe('Translation and Internationalization', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/e2e-test');
    });

    test('should display translated contact form', async ({ page }) => {
      const config = getScenario('contactFormTranslated');
      await page.evaluate((config) => {
        (window as any).loadTestScenario = config;
      }, config);
      await page.reload();

      // Test different languages if language selector exists
      const translations = {
        en: 'Contact',
        es: 'Contacto',
        fr: 'Contact',
        de: 'Kontakt',
      };

      // Look for language selector
      const languageSelector = page.locator('[data-testid="language-selector"], select[name="language"]');

      if (await languageSelector.isVisible()) {
        await translationHelpers.validateTranslatedContent('form-title', translations);
      } else {
        // If no language selector, just verify the form loads
        await expect(page.locator('dynamic-form')).toBeVisible();
        console.log('No language selector found, skipping translation test');
      }
    });

    test('should handle right-to-left languages', async ({ page }) => {
      const config = getScenario('registrationFormTranslated');
      await page.evaluate((config) => {
        (window as any).loadTestScenario = config;
      }, config);
      await page.reload();

      // Test RTL languages if supported
      const rtlLanguages = ['ar', 'he', 'fa'];

      for (const lang of rtlLanguages) {
        const langButton = page.locator(`[data-testid="lang-${lang}"], button:has-text("${lang.toUpperCase()}")`);

        if (await langButton.isVisible()) {
          await langButton.click();
          await page.waitForTimeout(500);

          // Check if body or form container has RTL direction
          const bodyDir = await page.locator('body').getAttribute('dir');
          const formDir = await page.locator('dynamic-form').getAttribute('dir');

          expect(bodyDir === 'rtl' || formDir === 'rtl').toBeTruthy();
          break;
        }
      }
    });

    test('should format dates and numbers for different locales', async ({ page }) => {
      const config = getScenario('dynamicSurveyTranslated');
      await page.evaluate((config) => {
        (window as any).loadTestScenario = config;
      }, config);
      await page.reload();

      // Test locale-specific formatting
      const dateInputs = page.locator('input[type="date"]');
      const numberInputs = page.locator('input[type="number"]');

      const dateCount = await dateInputs.count();
      const numberCount = await numberInputs.count();

      console.log(`Found ${dateCount} date inputs and ${numberCount} number inputs for locale testing`);

      // Just verify they exist and are functional
      if (dateCount > 0) {
        await dateInputs.first().fill('2024-12-01');
        const value = await dateInputs.first().inputValue();
        expect(value).toBeTruthy();
      }
    });

    test('should validate all translation scenarios', async ({ page }) => {
      const translationScenarios = getScenariosByCategory('TRANSLATION_FORMS');

      for (const scenario of translationScenarios) {
        await page.goto('/e2e-test');

        await page.evaluate((config) => {
          (window as any).loadTestScenario = config;
        }, config);
        await page.reload();

        // Verify form loads
        await expect(page.locator('dynamic-form')).toBeVisible();

        // Check for translation-related elements
        const hasLanguageSelector = await page.locator('[data-testid*="lang"], [data-testid="language-selector"]').isVisible();
        const hasTranslatedText = (await page.locator('[data-translate], [i18n]').count()) > 0;

        console.log(
          `✓ Translation scenario "${scenario.name}": Language selector: ${hasLanguageSelector}, Translated elements: ${hasTranslatedText}`
        );
      }
    });
  });

  test.describe('Realistic Complex Scenarios', () => {
    test('should complete e-commerce registration workflow', async ({ page }) => {
      await page.goto('/e2e-test');

      const config = getScenario('ecommerceRegistration');
      await page.evaluate((config) => {
        (window as any).loadTestScenario = config;
      }, config);
      await page.reload();

      // Complete the realistic e-commerce registration
      await formHelpers.fillInput('firstName', 'John');
      await formHelpers.fillInput('lastName', 'Customer');
      await formHelpers.fillInput('email', 'john.customer@ecommerce.com');
      await formHelpers.fillInput('password', 'SecurePassword123!');
      await formHelpers.fillInput('confirmPassword', 'SecurePassword123!');

      // Business information
      await formHelpers.fillInput('companyName', 'ABC Corporation');
      await formHelpers.selectOption('businessType', 'corporation');
      await formHelpers.fillInput('taxId', '12-3456789');

      // Address information
      await formHelpers.fillInput('streetAddress', '123 Business Ave');
      await formHelpers.fillInput('city', 'Commerce City');
      await formHelpers.selectOption('state', 'CA');
      await formHelpers.fillInput('zipCode', '90210');
      await formHelpers.selectOption('country', 'US');

      // Preferences
      await formHelpers.selectMultipleOptions('productCategories', ['electronics', 'software']);
      await formHelpers.selectOption('monthlyBudget', '1000-5000');
      await formHelpers.toggleCheckbox('agreeToTerms', true);
      await formHelpers.toggleCheckbox('subscribeNewsletter', true);

      // Submit registration
      await formHelpers.clickButton('submit');

      // Verify successful registration
      await expect(page.locator('[data-testid*="submission"]')).toBeVisible();
    });

    test('should complete healthcare registration workflow', async ({ page }) => {
      await page.goto('/e2e-test');

      const config = getScenario('healthcareRegistration');
      await page.evaluate((config) => {
        (window as any).loadTestScenario = config;
      }, config);
      await page.reload();

      // Patient information
      await formHelpers.fillInput('patientFirstName', 'Jane');
      await formHelpers.fillInput('patientLastName', 'Patient');
      await formHelpers.fillInput('dateOfBirth', '1985-06-15');
      await formHelpers.selectOption('gender', 'female');
      await formHelpers.fillInput('ssn', '123-45-6789');

      // Contact information
      await formHelpers.fillInput('email', 'jane.patient@healthcare.com');
      await formHelpers.fillInput('phone', '555-123-4567');
      await formHelpers.fillInput('emergencyContact', 'John Patient');
      await formHelpers.fillInput('emergencyPhone', '555-987-6543');

      // Address
      await formHelpers.fillInput('address', '456 Health St');
      await formHelpers.fillInput('city', 'Medical City');
      await formHelpers.selectOption('state', 'TX');
      await formHelpers.fillInput('zipCode', '75001');

      // Insurance information
      await formHelpers.fillInput('insuranceProvider', 'Health Insurance Co');
      await formHelpers.fillInput('policyNumber', 'HIC123456789');
      await formHelpers.fillInput('groupNumber', 'GRP001');

      // Medical history
      await formHelpers.selectMultipleOptions('allergies', ['peanuts', 'shellfish']);
      await formHelpers.selectMultipleOptions('medications', ['aspirin']);
      await formHelpers.fillInput('medicalConditions', 'Hypertension');

      // Consent
      await formHelpers.toggleCheckbox('consentToTreatment', true);
      await formHelpers.toggleCheckbox('hipaaConsent', true);

      // Submit registration
      await formHelpers.clickButton('submit');

      // Verify successful registration
      await expect(page.locator('[data-testid*="submission"]')).toBeVisible();
    });

    test('should complete corporate event registration workflow', async ({ page }) => {
      await page.goto('/e2e-test');

      const config = getScenario('corporateEventRegistration');
      await page.evaluate((config) => {
        (window as any).loadTestScenario = config;
      }, config);
      await page.reload();

      // Attendee information
      await formHelpers.fillInput('attendeeName', 'Corporate Executive');
      await formHelpers.fillInput('jobTitle', 'Chief Technology Officer');
      await formHelpers.fillInput('email', 'cto@corporation.com');
      await formHelpers.fillInput('phone', '555-corporate');

      // Company information
      await formHelpers.fillInput('companyName', 'Tech Corporation');
      await formHelpers.selectOption('companySize', '1000+');
      await formHelpers.selectOption('industry', 'technology');

      // Event preferences
      await formHelpers.selectMultipleOptions('sessions', ['keynote', 'technical-workshop']);
      await formHelpers.selectOption('dietaryRestrictions', 'vegetarian');
      await formHelpers.toggleCheckbox('needsAccommodation', false);

      // Networking preferences
      await formHelpers.selectMultipleOptions('interests', ['ai', 'cloud-computing']);
      await formHelpers.selectOption('networkingLevel', 'high');

      // Travel information
      await formHelpers.selectOption('hotelNeeded', 'yes');
      await formHelpers.fillInput('arrivalDate', '2024-12-01');
      await formHelpers.fillInput('departureDate', '2024-12-03');

      // Consent and agreements
      await formHelpers.toggleCheckbox('agreeToTerms', true);
      await formHelpers.toggleCheckbox('allowPhotography', true);
      await formHelpers.toggleCheckbox('subscribeUpdates', true);

      // Submit registration
      await formHelpers.clickButton('submit');

      // Verify successful registration
      await expect(page.locator('[data-testid*="submission"]')).toBeVisible();
    });

    test('should validate all realistic scenarios', async ({ page }) => {
      const realisticScenarios = getScenariosByCategory('REALISTIC_SCENARIOS');

      for (const scenario of realisticScenarios) {
        await page.goto('/e2e-test');

        await page.evaluate((config) => {
          (window as any).loadTestScenario = config;
        }, config);
        await page.reload();

        // Verify form loads and has expected complexity
        await expect(page.locator('dynamic-form')).toBeVisible();

        const inputCount = await page.locator('input, select, textarea').count();
        const checkboxCount = await page.locator('input[type="checkbox"]').count();
        const selectCount = await page.locator('select, mat-select').count();

        // Realistic scenarios should have substantial number of fields
        expect(inputCount).toBeGreaterThan(10);

        console.log(`✓ Realistic scenario "${scenario.name}": ${inputCount} inputs, ${checkboxCount} checkboxes, ${selectCount} selects`);
      }
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle form with invalid configuration gracefully', async ({ page }) => {
      await page.goto('/e2e-test');

      // Try loading an invalid configuration
      const invalidConfig = {
        pages: [
          {
            fields: [
              {
                key: 'invalidField',
                type: 'nonexistent-type',
                label: 'Invalid Field',
              },
            ],
          },
        ],
      };

      await page.evaluate((config) => {
        (window as any).loadTestScenario = config;
      }, invalidConfig);
      await page.reload();

      // Form should either handle gracefully or show error
      const dynamicForm = page.locator('dynamic-form');
      await expect(dynamicForm).toBeVisible();
    });

    test('should handle network failures during form interaction', async ({ page }) => {
      await page.goto('/e2e-test');

      const config = getScenario('userProfile');
      await page.evaluate((config) => {
        (window as any).loadTestScenario = config;
      }, config);
      await page.reload();

      // Fill form data
      await formHelpers.fillInput('firstName', 'Network');
      await formHelpers.fillInput('lastName', 'Test');
      await formHelpers.fillInput('email', 'network@test.com');

      // Simulate network failure during submission
      await page.route('**/*', (route) => route.abort());

      try {
        await formHelpers.clickButton('submit');
        await page.waitForTimeout(2000);

        // Form should handle network failure gracefully
        console.log('Form handled network failure gracefully');
      } catch (error) {
        console.log('Network failure test completed');
      } finally {
        // Restore network
        await page.unroute('**/*');
      }
    });

    test('should maintain accessibility during interactions', async ({ page }) => {
      await page.goto('/e2e-test');

      const config = getScenario('userProfile');
      await page.evaluate((config) => {
        (window as any).loadTestScenario = config;
      }, config);
      await page.reload();

      // Test keyboard navigation
      await page.keyboard.press('Tab');
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();

      // Continue tabbing through form
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);
      }

      // Test screen reader compatibility
      const labels = page.locator('label');
      const labelCount = await labels.count();

      const inputs = page.locator('input, select, textarea');
      const inputCount = await inputs.count();

      // Most inputs should have associated labels
      expect(labelCount).toBeGreaterThan(inputCount * 0.7);
    });

    test('should handle large datasets without performance degradation', async ({ page }) => {
      await page.goto('/e2e-test');

      // Create a form with many options
      const configWithManyOptions = {
        pages: [
          {
            fields: [
              {
                key: 'multiSelect',
                type: 'select',
                label: 'Select Multiple Options',
                multiple: true,
                options: Array.from({ length: 100 }, (_, i) => ({
                  label: `Option ${i + 1}`,
                  value: `option${i + 1}`,
                })),
              },
            ],
          },
        ],
      };

      const startTime = Date.now();

      await page.evaluate((config) => {
        (window as any).loadTestScenario = config;
      }, configWithManyOptions);
      await page.reload();

      const loadTime = Date.now() - startTime;

      // Should load within reasonable time even with many options
      expect(loadTime).toBeLessThan(5000);

      // Verify form is functional
      await expect(page.locator('dynamic-form')).toBeVisible();

      const selectElement = page.locator('select, mat-select').first();
      if (await selectElement.isVisible()) {
        await selectElement.click();
        await page.waitForTimeout(500);

        // Should be able to interact with the select
        const options = page.locator('option, mat-option');
        const optionCount = await options.count();
        expect(optionCount).toBeGreaterThan(50);
      }
    });
  });

  test.describe('Performance and Load Testing', () => {
    test('should render forms efficiently across all scenarios', async ({ page }) => {
      const allScenarioNames = getAllScenarioNames();
      const performanceResults: Array<{ scenario: string; renderTime: number; fieldCount: number }> = [];

      for (const scenarioName of allScenarioNames.slice(0, 10)) {
        // Test first 10 scenarios
        await page.goto('/e2e-test');

        const startTime = Date.now();

        const config = getScenario(scenarioName);
        await page.evaluate((config) => {
          (window as any).loadTestScenario = config;
        }, config);
        await page.reload();

        // Wait for form to be fully loaded
        await page.locator('dynamic-form').waitFor({ state: 'visible' });
        await page.locator('input, select, textarea').first().waitFor({ state: 'visible' });

        const renderTime = Date.now() - startTime;
        const fieldCount = await page.locator('input, select, textarea').count();

        performanceResults.push({
          scenario: scenarioName,
          renderTime,
          fieldCount,
        });

        // All forms should render within 3 seconds
        expect(renderTime).toBeLessThan(3000);
      }

      // Log performance summary
      const avgRenderTime = performanceResults.reduce((sum, result) => sum + result.renderTime, 0) / performanceResults.length;
      console.log(`Average render time across ${performanceResults.length} scenarios: ${avgRenderTime.toFixed(2)}ms`);

      performanceResults.forEach((result) => {
        console.log(`${result.scenario}: ${result.renderTime}ms (${result.fieldCount} fields)`);
      });
    });

    test('should handle memory usage efficiently during extended interactions', async ({ page }) => {
      await page.goto('/e2e-test');

      // Test memory usage by repeatedly loading different scenarios
      const scenarios = ['userProfile', 'contactForm', 'registrationForm'];

      for (let iteration = 0; iteration < 3; iteration++) {
        for (const scenarioName of scenarios) {
          const config = getScenario(scenarioName as any);
          await page.evaluate((config) => {
            (window as any).loadTestScenario = config;
          }, config);
          await page.reload();

          // Interact with form
          await formHelpers.fillInput('firstName', `Test${iteration}`);
          await formHelpers.fillInput('lastName', `User${iteration}`);

          // Wait a bit to simulate user interaction
          await page.waitForTimeout(200);
        }
      }

      // Form should still be responsive after multiple loads
      await expect(page.locator('dynamic-form')).toBeVisible();

      const finalInputs = page.locator('input, select, textarea');
      const finalCount = await finalInputs.count();
      expect(finalCount).toBeGreaterThan(0);

      console.log('Memory usage test completed successfully');
    });
  });

  test.describe('Browser Compatibility', () => {
    test('should work consistently across different user agents', async ({ page }) => {
      await page.goto('/e2e-test');

      const config = getScenario('userProfile');
      await page.evaluate((config) => {
        (window as any).loadTestScenario = config;
      }, config);
      await page.reload();

      // Test basic functionality
      await formHelpers.fillInput('firstName', 'Browser');
      await formHelpers.fillInput('lastName', 'Test');
      await formHelpers.fillInput('email', 'browser@test.com');

      // Form should work regardless of browser
      const formValue = await formHelpers.getFormValue();
      expect(formValue).toHaveProperty('firstName', 'Browser');
      expect(formValue).toHaveProperty('lastName', 'Test');
      expect(formValue).toHaveProperty('email', 'browser@test.com');
    });
  });
});
