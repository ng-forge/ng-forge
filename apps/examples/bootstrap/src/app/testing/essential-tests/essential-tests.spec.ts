import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck();

test.describe('Essential Tests - Quick Validation', () => {
  test('basic form functionality works', async ({ helpers }) => {
    await helpers.navigateToScenario('/test/essential-tests/basic-form');

    const scenario = helpers.getScenario('basic-form');
    await expect(scenario).toBeVisible();

    const passwordInput = helpers.getInput(scenario, 'password');
    const confirmPasswordInput = helpers.getInput(scenario, 'confirmPassword');
    const submitButton = helpers.getSubmitButton(scenario);

    await expect(passwordInput).toBeVisible();
    await expect(confirmPasswordInput).toBeVisible();
    await expect(submitButton).toBeDisabled();

    await helpers.fillInput(passwordInput, 'SecurePass123');
    await helpers.fillInput(confirmPasswordInput, 'SecurePass123');

    await expect(submitButton).toBeEnabled();

    const submittedData = await helpers.submitFormAndCapture(scenario);

    expect(submittedData).toMatchObject({
      password: 'SecurePass123',
      confirmPassword: 'SecurePass123',
    });
  });

  test('age-based logic works correctly', async ({ helpers }) => {
    await helpers.navigateToScenario('/test/essential-tests/age-based-logic');

    const scenario = helpers.getScenario('age-based-logic');
    await expect(scenario).toBeVisible();

    const ageInput = helpers.getInput(scenario, 'age');
    const guardianConsentCheckbox = helpers.getCheckbox(scenario, 'guardianConsent');

    // Test age under 18 - guardian consent should be visible
    await helpers.fillInput(ageInput, '16');
    await ageInput.blur();

    await helpers.waitForFieldVisible(guardianConsentCheckbox);

    // Test age 18 or above - guardian consent should be hidden
    await helpers.clearAndFill(ageInput, '25');
    await ageInput.blur();

    await helpers.waitForFieldHidden(guardianConsentCheckbox);

    // Test age exactly 18 - guardian consent should be hidden
    await helpers.clearAndFill(ageInput, '18');
    await ageInput.blur();

    await helpers.waitForFieldHidden(guardianConsentCheckbox);
  });

  test('multi-page navigation works', async ({ helpers }) => {
    await helpers.navigateToScenario('/test/essential-tests/multi-page-navigation');

    const scenario = helpers.getScenario('multi-page-navigation');
    await expect(scenario).toBeVisible();

    const firstNameInput = helpers.getInput(scenario, 'firstName');
    const lastNameInput = helpers.getInput(scenario, 'lastName');
    const emailInput = helpers.getInput(scenario, 'email');
    const submitButton = helpers.getSubmitButton(scenario);

    await expect(firstNameInput).toBeVisible();
    await expect(lastNameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(submitButton).toBeDisabled();

    await helpers.fillInput(firstNameInput, 'John');
    await helpers.fillInput(lastNameInput, 'Doe');
    await helpers.fillInput(emailInput, 'john.doe@example.com');

    await expect(submitButton).toBeEnabled();

    const submittedData = await helpers.submitFormAndCapture(scenario);

    expect(submittedData).toMatchObject({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
    });
  });
});
