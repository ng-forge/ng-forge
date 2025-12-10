import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck();

test.describe('Essential Tests - Quick Validation', () => {
  test('basic form functionality works', async ({ helpers, page }) => {
    await helpers.navigateToScenario('/test/essential-tests/basic-form');

    const scenario = helpers.getScenario('basic-form');
    await expect(scenario).toBeVisible({ timeout: 10000 });

    // Wait for inputs to be visible before getting locators
    await page.waitForSelector('[data-testid="basic-form"] #password input', { state: 'visible', timeout: 10000 });
    await page.waitForSelector('[data-testid="basic-form"] #confirmPassword input', { state: 'visible', timeout: 10000 });

    const passwordInput = helpers.getInput(scenario, 'password');
    const confirmPasswordInput = helpers.getInput(scenario, 'confirmPassword');
    const submitButton = helpers.getSubmitButton(scenario);

    await expect(passwordInput).toBeVisible({ timeout: 10000 });
    await expect(confirmPasswordInput).toBeVisible({ timeout: 10000 });
    await expect(submitButton).toBeDisabled({ timeout: 10000 });

    await helpers.fillInput(passwordInput, 'SecurePass123');
    await expect(passwordInput).toHaveValue('SecurePass123', { timeout: 5000 });
    await passwordInput.blur();

    await helpers.fillInput(confirmPasswordInput, 'SecurePass123');
    await expect(confirmPasswordInput).toHaveValue('SecurePass123', { timeout: 5000 });
    await confirmPasswordInput.blur();

    // Wait for button to become enabled
    await page.waitForSelector('[data-testid="basic-form"] #submit button:not([disabled])', { state: 'visible', timeout: 10000 });
    await expect(submitButton).toBeEnabled({ timeout: 10000 });

    const submittedData = await helpers.submitFormAndCapture(scenario);

    expect(submittedData).toMatchObject({
      password: 'SecurePass123',
      confirmPassword: 'SecurePass123',
    });
  });

  test('age-based logic works correctly', async ({ helpers, page }) => {
    await helpers.navigateToScenario('/test/essential-tests/age-based-logic');

    const scenario = helpers.getScenario('age-based-logic');
    await expect(scenario).toBeVisible({ timeout: 10000 });

    // Wait for input to be visible before getting locators
    await page.waitForSelector('[data-testid="age-based-logic"] #age input', { state: 'visible', timeout: 10000 });

    const ageInput = helpers.getInput(scenario, 'age');
    const guardianConsentCheckbox = helpers.getCheckbox(scenario, 'guardianConsent');

    // Test age under 18 - guardian consent should be visible
    await helpers.fillInput(ageInput, '16');
    await expect(ageInput).toHaveValue('16', { timeout: 5000 });
    await ageInput.blur();

    await helpers.waitForFieldVisible(guardianConsentCheckbox);

    // Test age 18 or above - guardian consent should be hidden
    await helpers.clearAndFill(ageInput, '25');
    await expect(ageInput).toHaveValue('25', { timeout: 5000 });
    await ageInput.blur();

    await helpers.waitForFieldHidden(guardianConsentCheckbox);

    // Test age exactly 18 - guardian consent should be hidden
    await helpers.clearAndFill(ageInput, '18');
    await expect(ageInput).toHaveValue('18', { timeout: 5000 });
    await ageInput.blur();

    await helpers.waitForFieldHidden(guardianConsentCheckbox);
  });

  test('multi-page navigation works', async ({ helpers, page }) => {
    await helpers.navigateToScenario('/test/essential-tests/multi-page-navigation');

    const scenario = helpers.getScenario('multi-page-navigation');
    await expect(scenario).toBeVisible({ timeout: 10000 });

    // Wait for inputs to be visible before getting locators
    await page.waitForSelector('[data-testid="multi-page-navigation"] #firstName input', { state: 'visible', timeout: 10000 });
    await page.waitForSelector('[data-testid="multi-page-navigation"] #lastName input', { state: 'visible', timeout: 10000 });
    await page.waitForSelector('[data-testid="multi-page-navigation"] #email input', { state: 'visible', timeout: 10000 });

    const firstNameInput = helpers.getInput(scenario, 'firstName');
    const lastNameInput = helpers.getInput(scenario, 'lastName');
    const emailInput = helpers.getInput(scenario, 'email');
    const submitButton = helpers.getSubmitButton(scenario);

    await expect(firstNameInput).toBeVisible({ timeout: 10000 });
    await expect(lastNameInput).toBeVisible({ timeout: 10000 });
    await expect(emailInput).toBeVisible({ timeout: 10000 });
    await expect(submitButton).toBeDisabled({ timeout: 10000 });

    await helpers.fillInput(firstNameInput, 'John');
    await expect(firstNameInput).toHaveValue('John', { timeout: 5000 });
    await firstNameInput.blur();

    await helpers.fillInput(lastNameInput, 'Doe');
    await expect(lastNameInput).toHaveValue('Doe', { timeout: 5000 });
    await lastNameInput.blur();

    await helpers.fillInput(emailInput, 'john.doe@example.com');
    await expect(emailInput).toHaveValue('john.doe@example.com', { timeout: 5000 });
    await emailInput.blur();

    // Wait for button to become enabled
    await page.waitForSelector('[data-testid="multi-page-navigation"] #submit button:not([disabled])', {
      state: 'visible',
      timeout: 10000,
    });
    await expect(submitButton).toBeEnabled({ timeout: 10000 });

    const submittedData = await helpers.submitFormAndCapture(scenario);

    expect(submittedData).toMatchObject({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
    });
  });
});
