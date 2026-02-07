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

test.describe('Config Reactivity - Two-Phase Transition', () => {
  test('adding fields at runtime preserves existing values', async ({ helpers, page }) => {
    await helpers.navigateToScenario('/test/essential-tests/reactive-config-changes');

    const scenario = helpers.getScenario('reactive-config-changes');
    await expect(scenario).toBeVisible();

    // Verify initial config has 3 fields
    const firstNameInput = helpers.getInput(scenario, 'firstName');
    const lastNameInput = helpers.getInput(scenario, 'lastName');
    const emailInput = helpers.getInput(scenario, 'email');

    await expect(firstNameInput).toBeVisible();
    await expect(lastNameInput).toBeVisible();
    await expect(emailInput).toBeVisible();

    // Fill in values
    await helpers.fillInput(firstNameInput, 'John');
    await helpers.fillInput(lastNameInput, 'Doe');

    // Switch to config with extra phone field
    const switchButton = page.locator('[data-testid="switch-to-withExtraField"]');
    await switchButton.click();

    // Wait for config transition
    await page.waitForTimeout(100);

    // Verify phone field appears
    const phoneInput = helpers.getInput(scenario, 'phone');
    await expect(phoneInput).toBeVisible();

    // Verify original values are preserved
    await expect(firstNameInput).toHaveValue('John');
    await expect(lastNameInput).toHaveValue('Doe');
  });

  test('removing fields at runtime works without NG01902 error', async ({ helpers, page }) => {
    await helpers.navigateToScenario('/test/essential-tests/reactive-config-changes');

    const scenario = helpers.getScenario('reactive-config-changes');
    await expect(scenario).toBeVisible();

    // Verify initial config
    const firstNameInput = helpers.getInput(scenario, 'firstName');
    const lastNameInput = helpers.getInput(scenario, 'lastName');
    const emailInput = helpers.getInput(scenario, 'email');

    await expect(firstNameInput).toBeVisible();
    await expect(emailInput).toBeVisible();

    // Fill in values
    await helpers.fillInput(firstNameInput, 'Jane');
    await helpers.fillInput(lastNameInput, 'Smith');
    await helpers.fillInput(emailInput, 'jane@example.com');

    // Switch to config with email field removed
    const switchButton = page.locator('[data-testid="switch-to-withFieldRemoved"]');
    await switchButton.click();

    // Wait for config transition
    await page.waitForTimeout(150);

    // Verify email field is gone
    await expect(emailInput).not.toBeVisible();

    // Verify firstName and lastName are still present and have preserved values
    await expect(firstNameInput).toBeVisible();
    await expect(lastNameInput).toBeVisible();
    await expect(firstNameInput).toHaveValue('Jane');
    await expect(lastNameInput).toHaveValue('Smith');
  });

  test('reordering fields at runtime preserves values', async ({ helpers, page }) => {
    await helpers.navigateToScenario('/test/essential-tests/reactive-config-changes');

    const scenario = helpers.getScenario('reactive-config-changes');
    await expect(scenario).toBeVisible();

    // Fill in values with initial config
    const firstNameInput = helpers.getInput(scenario, 'firstName');
    const lastNameInput = helpers.getInput(scenario, 'lastName');
    const emailInput = helpers.getInput(scenario, 'email');

    await helpers.fillInput(firstNameInput, 'Alice');
    await helpers.fillInput(lastNameInput, 'Wonder');
    await helpers.fillInput(emailInput, 'alice@example.com');

    // Switch to reordered config
    const switchButton = page.locator('[data-testid="switch-to-reordered"]');
    await switchButton.click();

    // Wait for config transition
    await page.waitForTimeout(100);

    // All fields should still be visible
    await expect(firstNameInput).toBeVisible();
    await expect(lastNameInput).toBeVisible();
    await expect(emailInput).toBeVisible();

    // Values should be preserved
    await expect(firstNameInput).toHaveValue('Alice');
    await expect(lastNameInput).toHaveValue('Wonder');
    await expect(emailInput).toHaveValue('alice@example.com');
  });

  test('rapid config changes settle to final config', async ({ helpers, page }) => {
    await helpers.navigateToScenario('/test/essential-tests/reactive-config-changes');

    const scenario = helpers.getScenario('reactive-config-changes');
    await expect(scenario).toBeVisible();

    // Fill initial values
    const firstNameInput = helpers.getInput(scenario, 'firstName');
    await helpers.fillInput(firstNameInput, 'Test');

    // Rapid config switches
    const withExtraButton = page.locator('[data-testid="switch-to-withExtraField"]');
    const withRemovedButton = page.locator('[data-testid="switch-to-withFieldRemoved"]');
    const reorderedButton = page.locator('[data-testid="switch-to-reordered"]');

    // Fire rapid changes
    await withExtraButton.click();
    await withRemovedButton.click();
    await reorderedButton.click();

    // Wait for transitions to settle
    await page.waitForTimeout(200);

    // Should end up with reordered config (all 3 fields visible)
    const emailInput = helpers.getInput(scenario, 'email');
    const lastNameInput = helpers.getInput(scenario, 'lastName');

    await expect(firstNameInput).toBeVisible();
    await expect(lastNameInput).toBeVisible();
    await expect(emailInput).toBeVisible();

    // Active config indicator should show reordered
    const activeConfigIndicator = page.locator('[data-testid="active-config-key"]');
    await expect(activeConfigIndicator).toContainText('reordered');
  });
});
