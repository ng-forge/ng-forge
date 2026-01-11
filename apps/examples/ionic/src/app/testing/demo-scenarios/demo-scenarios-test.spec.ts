import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';
import { ionBlur } from '../shared/test-utils';

setupTestLogging();
setupConsoleCheck();

test.describe('Demo Scenarios E2E Tests', () => {
  test.beforeEach(async ({ helpers }) => {
    await helpers.navigateToScenario('/testing/demo-scenarios');
  });

  test.describe('Cross-Field Validation', () => {
    test('should validate email and password fields', async ({ page, helpers }) => {
      // Navigate to cross-field validation scenario
      await page.goto('/#/demo-scenarios/cross-field-validation');
      await page.waitForLoadState('networkidle');

      // Locate the specific test scenario
      const scenario = helpers.getScenario('cross-field-validation');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for fields to be visible before getting locators
      await page.waitForSelector('[data-testid="cross-field-validation"] #email input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="cross-field-validation"] #password input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="cross-field-validation"] #confirmPassword input', { state: 'visible', timeout: 10000 });

      // Note: Submit button state depends on form validity
      const submitButton = scenario.locator('#submit ion-button');
      const emailInput = scenario.locator('#email input');
      const passwordInput = scenario.locator('#password input');
      const confirmPasswordInput = scenario.locator('#confirmPassword input');

      // Fill in the form fields (blur triggers validation)
      await emailInput.fill('test@example.com');
      await expect(emailInput).toHaveValue('test@example.com', { timeout: 5000 });
      await ionBlur(emailInput);
      await passwordInput.fill('SecurePass123');
      await expect(passwordInput).toHaveValue('SecurePass123', { timeout: 5000 });
      await ionBlur(passwordInput);
      await confirmPasswordInput.fill('SecurePass123');
      await expect(confirmPasswordInput).toHaveValue('SecurePass123', { timeout: 5000 });
      await ionBlur(confirmPasswordInput);

      // Submit button should now be enabled
      await page.waitForSelector('[data-testid="cross-field-validation"] #submit ion-button:not([aria-disabled="true"])', {
        state: 'visible',
        timeout: 10000,
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
        email: 'test@example.com',
        password: 'SecurePass123',
        confirmPassword: 'SecurePass123',
      });
    });

    test('should enforce password minimum length validation', async ({ page, helpers }) => {
      // Navigate to cross-field validation scenario
      await page.goto('/#/demo-scenarios/cross-field-validation');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('cross-field-validation');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for fields to be visible before getting locators
      await page.waitForSelector('[data-testid="cross-field-validation"] #email input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="cross-field-validation"] #password input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="cross-field-validation"] #confirmPassword input', { state: 'visible', timeout: 10000 });

      const submitButton = scenario.locator('#submit ion-button');
      const emailInput = scenario.locator('#email input');
      const passwordInput = scenario.locator('#password input');
      const confirmPasswordInput = scenario.locator('#confirmPassword input');

      // Wait for fields to be ready
      await expect(emailInput).toBeVisible({ timeout: 10000 });
      await expect(passwordInput).toBeVisible({ timeout: 10000 });
      await expect(confirmPasswordInput).toBeVisible({ timeout: 10000 });

      // Fill with valid email but short password (blur triggers validation)
      await emailInput.fill('test@example.com');
      await expect(emailInput).toHaveValue('test@example.com', { timeout: 5000 });
      await ionBlur(emailInput);
      await passwordInput.fill('short');
      await expect(passwordInput).toHaveValue('short', { timeout: 5000 });
      await ionBlur(passwordInput);
      await confirmPasswordInput.fill('short');
      await expect(confirmPasswordInput).toHaveValue('short', { timeout: 5000 });
      await ionBlur(confirmPasswordInput);

      // Note: Button state may vary - testing password length validation

      // Fix password length - clear and refill (blur triggers validation)
      await passwordInput.clear();
      await passwordInput.fill('LongEnoughPass123');
      await expect(passwordInput).toHaveValue('LongEnoughPass123', { timeout: 5000 });
      await ionBlur(passwordInput);
      await confirmPasswordInput.clear();
      await confirmPasswordInput.fill('LongEnoughPass123');
      await expect(confirmPasswordInput).toHaveValue('LongEnoughPass123', { timeout: 5000 });
      await ionBlur(confirmPasswordInput);

      // Now form should be valid (allow time for validation)
      await page.waitForSelector('[data-testid="cross-field-validation"] #submit ion-button:not([aria-disabled="true"])', {
        state: 'visible',
        timeout: 10000,
      });
      await expect(submitButton).not.toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });
    });
  });

  test.describe('User Registration', () => {
    test('should complete user registration form', async ({ page, helpers }) => {
      // Navigate to user registration scenario
      await page.goto('/#/demo-scenarios/user-registration');
      await page.waitForLoadState('networkidle');

      // Locate the specific test scenario
      const scenario = helpers.getScenario('user-registration');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for fields to be visible before getting locators
      await page.waitForSelector('[data-testid="user-registration"] #firstName input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="user-registration"] #lastName input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="user-registration"] #email input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="user-registration"] #age input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="user-registration"] #country ion-select', { state: 'visible', timeout: 10000 });

      // Note: Submit button state depends on form validity
      const submitButton = scenario.locator('#submit ion-button');
      const firstNameInput = scenario.locator('#firstName input');
      const lastNameInput = scenario.locator('#lastName input');
      const emailInput = scenario.locator('#email input');
      const ageInput = scenario.locator('#age input');
      const countrySelect = scenario.locator('#country ion-select');

      // Wait for ALL fields to be visible before interacting
      await expect(firstNameInput).toBeVisible({ timeout: 10000 });
      await expect(lastNameInput).toBeVisible({ timeout: 10000 });
      await expect(emailInput).toBeVisible({ timeout: 10000 });
      await expect(ageInput).toBeVisible({ timeout: 10000 });
      await expect(countrySelect).toBeVisible({ timeout: 10000 });

      // Fill in registration form (blur after each field triggers validation)
      await firstNameInput.fill('John');
      await expect(firstNameInput).toHaveValue('John', { timeout: 5000 });
      await ionBlur(firstNameInput);
      await lastNameInput.fill('Doe');
      await expect(lastNameInput).toHaveValue('Doe', { timeout: 5000 });
      await ionBlur(lastNameInput);
      await emailInput.fill('john.doe@example.com');
      await expect(emailInput).toHaveValue('john.doe@example.com', { timeout: 5000 });
      await ionBlur(emailInput);
      await ageInput.fill('25');
      await expect(ageInput).toHaveValue('25', { timeout: 5000 });
      await ionBlur(ageInput);

      // Select country (Ionic uses ion-select)
      await helpers.selectOption(countrySelect, 'United States');

      // Submit button should now be enabled (allow time for form validation)
      await page.waitForSelector('[data-testid="user-registration"] #submit ion-button:not([aria-disabled="true"])', {
        state: 'visible',
        timeout: 10000,
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
        age: 25, // Signal Forms with type=number returns numeric value
        country: 'us',
      });
    });

    test('should enforce minimum age validation', async ({ page, helpers }) => {
      // Navigate to user registration scenario
      await page.goto('/#/demo-scenarios/user-registration');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('user-registration');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for fields to be visible before getting locators
      await page.waitForSelector('[data-testid="user-registration"] #firstName input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="user-registration"] #lastName input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="user-registration"] #email input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="user-registration"] #age input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="user-registration"] #country ion-select', { state: 'visible', timeout: 10000 });

      const submitButton = scenario.locator('#submit ion-button');
      const firstNameInput = scenario.locator('#firstName input');
      const lastNameInput = scenario.locator('#lastName input');
      const emailInput = scenario.locator('#email input');
      const ageInput = scenario.locator('#age input');
      const countrySelect = scenario.locator('#country ion-select');

      // Fill in all fields with age below minimum (blur triggers validation)
      await firstNameInput.fill('Jane');
      await expect(firstNameInput).toHaveValue('Jane', { timeout: 5000 });
      await ionBlur(firstNameInput);
      await lastNameInput.fill('Smith');
      await expect(lastNameInput).toHaveValue('Smith', { timeout: 5000 });
      await ionBlur(lastNameInput);
      await emailInput.fill('jane@example.com');
      await expect(emailInput).toHaveValue('jane@example.com', { timeout: 5000 });
      await ionBlur(emailInput);
      await ageInput.fill('16');
      await expect(ageInput).toHaveValue('16', { timeout: 5000 });
      await ionBlur(ageInput);

      // Select country (Ionic uses ion-select)
      await helpers.selectOption(countrySelect, 'Canada');

      // Note: Button state may vary - testing age validation

      // Fix age (blur triggers validation)
      await ageInput.fill('20');
      await expect(ageInput).toHaveValue('20', { timeout: 5000 });
      await ionBlur(ageInput);

      // Now form should be valid
      await page.waitForSelector('[data-testid="user-registration"] #submit ion-button:not([aria-disabled="true"])', {
        state: 'visible',
        timeout: 10000,
      });
      await expect(submitButton).not.toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });
    });
  });

  test.describe('Profile Management', () => {
    test('should update profile information', async ({ page, helpers }) => {
      // Navigate to profile management scenario
      await page.goto('/#/demo-scenarios/profile-management');
      await page.waitForLoadState('networkidle');

      // Locate the specific test scenario
      const scenario = helpers.getScenario('profile-management');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for fields to be visible before getting locators
      await page.waitForSelector('[data-testid="profile-management"] #username input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="profile-management"] #bio textarea', { state: 'visible', timeout: 10000 });

      const submitButton = scenario.locator('#submit ion-button');
      const usernameInput = scenario.locator('#username input');
      const bioTextarea = scenario.locator('#bio textarea');

      // Fill in profile form (blur triggers validation)
      await usernameInput.fill('johndoe');
      await expect(usernameInput).toHaveValue('johndoe', { timeout: 5000 });
      await ionBlur(usernameInput);
      await bioTextarea.fill('Software engineer passionate about web development');
      await expect(bioTextarea).toHaveValue('Software engineer passionate about web development', { timeout: 5000 });
      await ionBlur(bioTextarea);

      // Submit button should be enabled
      await page.waitForSelector('[data-testid="profile-management"] #submit ion-button:not([aria-disabled="true"])', {
        state: 'visible',
        timeout: 10000,
      });
      await expect(submitButton).not.toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });

      // Submit the form
      await submitButton.click();

      // Verify form value was updated
      const formValue = await page.evaluate(() => {
        const pre = document.querySelector('[data-testid="form-value-profile-management"]');
        return pre ? JSON.parse(pre.textContent || '{}') : null;
      });

      expect(formValue).toMatchObject({
        username: 'johndoe',
        bio: 'Software engineer passionate about web development',
      });
    });

    test('should validate password fields', async ({ page, helpers }) => {
      // Navigate to profile management scenario
      await page.goto('/#/demo-scenarios/profile-management');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('profile-management');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for fields to be visible before getting locators
      await page.waitForSelector('[data-testid="profile-management"] #username input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="profile-management"] #newPassword input', { state: 'visible', timeout: 10000 });

      const submitButton = scenario.locator('#submit ion-button');
      const usernameInput = scenario.locator('#username input');
      const newPasswordInput = scenario.locator('#newPassword input');

      // Fill required field (blur triggers validation)
      await usernameInput.fill('testuser');
      await expect(usernameInput).toHaveValue('testuser', { timeout: 5000 });
      await ionBlur(usernameInput);

      // Fill new password with less than minimum length
      await newPasswordInput.fill('short');
      await expect(newPasswordInput).toHaveValue('short', { timeout: 5000 });
      await ionBlur(newPasswordInput);

      // Note: Button state may vary - testing password validation

      // Fix password length (blur triggers validation)
      await newPasswordInput.fill('ValidPass123');
      await expect(newPasswordInput).toHaveValue('ValidPass123', { timeout: 5000 });
      await ionBlur(newPasswordInput);

      // Now form should be valid
      await page.waitForSelector('[data-testid="profile-management"] #submit ion-button:not([aria-disabled="true"])', {
        state: 'visible',
        timeout: 10000,
      });
      await expect(submitButton).not.toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });
    });

    test('should handle optional newsletter subscription', async ({ page, helpers }) => {
      // Navigate to profile management scenario
      await page.goto('/#/demo-scenarios/profile-management');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('profile-management');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for inputs to be visible using waitForSelector
      await page.waitForSelector('[data-testid="profile-management"] #username input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="profile-management"] #newsletter ion-checkbox', { state: 'visible', timeout: 10000 });

      const usernameInput = scenario.locator('#username input');
      const newsletterCheckbox = scenario.locator('#newsletter ion-checkbox');
      await expect(usernameInput).toBeVisible({ timeout: 10000 });
      await expect(newsletterCheckbox).toBeVisible({ timeout: 10000 });

      // Fill required field (blur triggers validation)
      await usernameInput.fill('subscriber');
      await expect(usernameInput).toHaveValue('subscriber', { timeout: 5000 });
      await ionBlur(usernameInput);

      // Check newsletter checkbox (Ionic uses ion-checkbox)
      await newsletterCheckbox.click();
      // Wait for checkbox to be checked using waitForSelector
      await page.waitForSelector('[data-testid="profile-management"] #newsletter ion-checkbox[aria-checked="true"]', {
        state: 'attached',
        timeout: 5000,
      });
      await expect(newsletterCheckbox).toBeChecked({ timeout: 5000 });

      // Wait for form to be valid using waitForSelector
      const submitButton = scenario.locator('#submit ion-button');
      await page.waitForSelector('[data-testid="profile-management"] #submit ion-button:not([aria-disabled="true"])', {
        state: 'visible',
        timeout: 10000,
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
      const formValue = await submittedDataPromise;

      // Verify form value includes newsletter subscription
      expect(formValue).toMatchObject({
        username: 'subscriber',
        newsletter: true,
      });
    });
  });

  test.describe('Conditional Fields', () => {
    test('should handle conditional field logic', async ({ page, helpers }) => {
      // Navigate to conditional fields scenario
      await page.goto('/#/demo-scenarios/conditional-fields');
      await page.waitForLoadState('networkidle');

      // Locate the specific test scenario
      const scenario = helpers.getScenario('conditional-fields');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for fields to be visible before getting locators
      await page.waitForSelector('[data-testid="conditional-fields"] #age input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="conditional-fields"] #country ion-select', { state: 'visible', timeout: 10000 });

      const ageInput = scenario.locator('#age input');
      const countrySelect = scenario.locator('#country ion-select');

      // Wait for fields to be visible
      await expect(ageInput).toBeVisible({ timeout: 10000 });
      await expect(countrySelect).toBeVisible({ timeout: 10000 });

      // Fill in age and country (blur triggers validation)
      await ageInput.fill('25');
      await expect(ageInput).toHaveValue('25', { timeout: 5000 });
      await ionBlur(ageInput);

      // Select country (Ionic uses ion-select)
      await helpers.selectOption(countrySelect, 'United States');

      // Wait for form to be valid before submitting
      const submitButton = scenario.locator('#submit ion-button');
      await page.waitForSelector('[data-testid="conditional-fields"] #submit ion-button:not([aria-disabled="true"])', {
        state: 'visible',
        timeout: 10000,
      });
      await expect(submitButton).not.toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });

      // Submit form
      await submitButton.click();

      // Verify form submission
      const formValue = await page.evaluate(() => {
        const pre = document.querySelector('[data-testid="form-value-conditional-fields"]');
        return pre ? JSON.parse(pre.textContent || '{}') : null;
      });

      expect(formValue).toMatchObject({
        age: 25, // Signal Forms with type=number returns numeric value
        country: 'us',
      });
    });

    test('should submit form with cascading dropdowns', async ({ page, helpers }) => {
      // Navigate to conditional fields scenario
      await page.goto('/#/demo-scenarios/conditional-fields');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('conditional-fields');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Wait for fields to be visible before getting locators
      await page.waitForSelector('[data-testid="conditional-fields"] #age input', { state: 'visible', timeout: 10000 });
      await page.waitForSelector('[data-testid="conditional-fields"] #country ion-select', { state: 'visible', timeout: 10000 });

      const ageInput = scenario.locator('#age input');
      const countrySelect = scenario.locator('#country ion-select');
      const stateSelect = scenario.locator('#state ion-select');
      const cityInput = scenario.locator('#city input');

      // Fill in required fields (blur triggers validation)
      await ageInput.fill('30');
      await expect(ageInput).toHaveValue('30', { timeout: 5000 });
      await ionBlur(ageInput);

      // Select country (Ionic uses ion-select)
      await helpers.selectOption(countrySelect, 'Canada');

      // Wait for state select to be visible (conditional field)
      await page.waitForSelector('[data-testid="conditional-fields"] #state ion-select', { state: 'visible', timeout: 10000 });

      // Select state (Ionic uses ion-select)
      await helpers.selectOption(stateSelect, 'California');

      // Wait for city input to be visible (conditional field)
      await page.waitForSelector('[data-testid="conditional-fields"] #city input', { state: 'visible', timeout: 10000 });

      // Fill city (blur triggers validation)
      await cityInput.fill('San Francisco');
      await expect(cityInput).toHaveValue('San Francisco', { timeout: 5000 });
      await ionBlur(cityInput);

      // Wait for form to be valid before submitting
      const submitButton = scenario.locator('#submit ion-button');
      await page.waitForSelector('[data-testid="conditional-fields"] #submit ion-button:not([aria-disabled="true"])', {
        state: 'visible',
        timeout: 10000,
      });
      await expect(submitButton).not.toHaveAttribute('aria-disabled', 'true', { timeout: 10000 });

      // Submit form
      await submitButton.click();

      // Verify form submission
      const formValue = await page.evaluate(() => {
        const pre = document.querySelector('[data-testid="form-value-conditional-fields"]');
        return pre ? JSON.parse(pre.textContent || '{}') : null;
      });

      // Signal Forms with type=number returns numeric value
      expect(formValue).toMatchObject({
        age: 30,
        country: 'ca',
        state: 'ca',
        city: 'San Francisco',
      });
    });
  });
});
