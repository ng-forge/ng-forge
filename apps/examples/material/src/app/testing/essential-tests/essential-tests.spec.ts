import { expect, test } from '@playwright/test';

test.describe('Essential Tests - Quick Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4201/#/test/essential-tests/basic-form');
    await page.waitForLoadState('networkidle');
  });

  test('basic form functionality works', async ({ page }) => {
    // Locate the specific test scenario
    const scenario = page.locator('[data-testid="basic-form"]');
    await expect(scenario).toBeVisible();

    // Verify form elements are visible
    const passwordInput = scenario.locator('#password input');
    const confirmPasswordInput = scenario.locator('#confirmPassword input');
    const submitButton = scenario.locator('#submit button');

    await expect(passwordInput).toBeVisible();
    await expect(confirmPasswordInput).toBeVisible();

    // Submit button should be disabled initially (form invalid)
    await expect(submitButton).toBeDisabled();

    // Fill in passwords
    await passwordInput.fill('SecurePass123');
    await confirmPasswordInput.fill('SecurePass123');
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
      password: 'SecurePass123',
      confirmPassword: 'SecurePass123',
    });

    console.log('✅ Basic form functionality test passed');
  });

  test('age-based logic works correctly', async ({ page }) => {
    // Navigate to age-based logic test
    await page.goto('http://localhost:4201/#/test/essential-tests/age-based-logic');
    await page.waitForLoadState('networkidle');

    // Locate the specific test scenario
    const scenario = page.locator('[data-testid="age-based-logic"]');
    await expect(scenario).toBeVisible();

    const ageInput = scenario.locator('#age input');
    const guardianConsentCheckbox = scenario.locator('#guardianConsent mat-checkbox');

    // Test age under 18 - guardian consent should be visible
    await ageInput.fill('16');
    await ageInput.blur();
    await page.waitForTimeout(200);

    await expect(guardianConsentCheckbox).toBeVisible();

    // Test age 18 or above - guardian consent should be hidden
    await ageInput.clear();
    await ageInput.fill('25');
    await ageInput.blur();
    await page.waitForTimeout(200);

    await expect(guardianConsentCheckbox).not.toBeVisible();

    // Test age exactly 18 - guardian consent should be hidden
    await ageInput.clear();
    await ageInput.fill('18');
    await ageInput.blur();
    await page.waitForTimeout(200);

    await expect(guardianConsentCheckbox).not.toBeVisible();

    console.log('✅ Age logic test passed');
  });

  test('multi-page navigation works', async ({ page }) => {
    // Navigate to multi-page navigation test
    await page.goto('http://localhost:4201/#/test/essential-tests/multi-page-navigation');
    await page.waitForLoadState('networkidle');

    // Locate the specific test scenario
    const scenario = page.locator('[data-testid="multi-page-navigation"]');
    await expect(scenario).toBeVisible();

    const firstNameInput = scenario.locator('#firstName input');
    const lastNameInput = scenario.locator('#lastName input');
    const emailInput = scenario.locator('#email input');
    const submitButton = scenario.locator('#submit button');

    // Verify all fields are visible
    await expect(firstNameInput).toBeVisible();
    await expect(lastNameInput).toBeVisible();
    await expect(emailInput).toBeVisible();

    // Submit button should be disabled initially
    await expect(submitButton).toBeDisabled();

    // Fill in the form
    await firstNameInput.fill('John');
    await lastNameInput.fill('Doe');
    await emailInput.fill('john.doe@example.com');
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
    });

    console.log('✅ Multi-page navigation test passed');
  });
});
