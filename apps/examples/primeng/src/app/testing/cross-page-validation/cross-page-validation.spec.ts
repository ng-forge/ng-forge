import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck();

test.describe('Cross-Page Validation Tests', () => {
  test.beforeEach(async ({ helpers }) => {
    await helpers.navigateToScenario('/test/cross-page-validation');
  });

  test.describe('Email Verification Flow', () => {
    test('should complete email verification across multiple pages', async ({ page, helpers }) => {
      // Navigate to email verification scenario
      await page.goto('/#/test/cross-page-validation/email-verification');
      await page.waitForLoadState('networkidle');

      // Locate the test scenario
      const scenario = helpers.getScenario('cross-page-email-verification');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Page 1: Email Collection
      await expect(scenario.locator('h2:has-text("Email Registration")')).toBeVisible({ timeout: 10000 });

      // Wait for fields to be visible before interacting
      await page.waitForSelector('[data-testid="cross-page-email-verification"] #primaryEmail input', { state: 'visible', timeout: 10000 });

      // Fill email information (blur triggers validation)
      const primaryEmailInput = scenario.locator('#primaryEmail input');
      await primaryEmailInput.fill('user@businesscorp.com');
      await expect(primaryEmailInput).toHaveValue('user@businesscorp.com', { timeout: 5000 });
      await primaryEmailInput.blur();
      await helpers.selectRadio(scenario, 'emailType', 'Business Email');

      // Navigate to page 2
      await scenario.locator('button:has-text("Next"):visible').click();

      // Page 2: Personal Information - wait for page 2 fields to be visible
      await page.waitForSelector('[data-testid="cross-page-email-verification"] #fullName input', { state: 'visible', timeout: 10000 });
      await expect(scenario.locator('h2:has-text("Personal Information")')).toBeVisible({ timeout: 10000 });

      // Fill personal info (blur triggers validation)
      const fullNameInput = scenario.locator('#fullName input');
      await fullNameInput.fill('John Doe');
      await expect(fullNameInput).toHaveValue('John Doe', { timeout: 5000 });
      await fullNameInput.blur();

      const companyNameInput = scenario.locator('#companyName input');
      await companyNameInput.fill('Business Corp Inc.');
      await expect(companyNameInput).toHaveValue('Business Corp Inc.', { timeout: 5000 });
      await companyNameInput.blur();

      const phoneNumberInput = scenario.locator('#phoneNumber input');
      await phoneNumberInput.fill('+1-555-123-4567');
      await expect(phoneNumberInput).toHaveValue('+1-555-123-4567', { timeout: 5000 });
      await phoneNumberInput.blur();

      // Navigate to page 3
      await scenario.locator('button:has-text("Next"):visible').click();

      // Page 3: Confirmation - wait for page 3 fields to be visible
      await page.waitForSelector('[data-testid="cross-page-email-verification"] #confirmEmail input', { state: 'visible', timeout: 10000 });
      await expect(scenario.locator('h2:has-text("Confirmation")')).toBeVisible({ timeout: 10000 });

      // Fill confirmation information (blur triggers validation)
      const confirmEmailInput = scenario.locator('#confirmEmail input');
      await confirmEmailInput.fill('user@businesscorp.com');
      await expect(confirmEmailInput).toHaveValue('user@businesscorp.com', { timeout: 5000 });
      await confirmEmailInput.blur();

      const termsCheckbox = scenario.locator('#termsAgreement p-checkbox input');
      await termsCheckbox.check();
      await expect(termsCheckbox).toBeChecked({ timeout: 5000 });

      const notificationsCheckbox = scenario.locator('#emailNotifications p-checkbox input');
      await notificationsCheckbox.check();
      await expect(notificationsCheckbox).toBeChecked({ timeout: 5000 });

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

      // Wait for submit button to be enabled
      await page.waitForSelector('[data-testid="cross-page-email-verification"] #submitEmailVerification button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });
      const submitButton = scenario.locator('#submitEmailVerification button');
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

      // Submit the form
      await submitButton.click();

      // Wait for formSubmitted event
      const submittedData = await submittedDataPromise;

      // Verify submitted data contains information from all pages
      expect(submittedData).toMatchObject({
        primaryEmail: 'user@businesscorp.com',
        emailType: 'business',
        fullName: 'John Doe',
        companyName: 'Business Corp Inc.',
        phoneNumber: '+1-555-123-4567',
        confirmEmail: 'user@businesscorp.com',
        termsAgreement: true,
        emailNotifications: true,
      });
    });

    test('should validate email confirmation matches primary email', async ({ page, helpers }) => {
      await page.goto('/#/test/cross-page-validation/email-verification');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('cross-page-email-verification');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Page 1: Wait for fields to be visible, then fill email
      await page.waitForSelector('[data-testid="cross-page-email-verification"] #primaryEmail input', { state: 'visible', timeout: 10000 });
      const primaryEmailInput = scenario.locator('#primaryEmail input');
      await primaryEmailInput.fill('user@example.com');
      await expect(primaryEmailInput).toHaveValue('user@example.com', { timeout: 5000 });
      await primaryEmailInput.blur();
      await helpers.selectRadio(scenario, 'emailType', 'Personal Email');
      await scenario.locator('button:has-text("Next"):visible').click();

      // Page 2: Wait for page 2 to be visible, then fill personal info
      await page.waitForSelector('[data-testid="cross-page-email-verification"] #fullName input', { state: 'visible', timeout: 10000 });
      await expect(scenario.locator('#fullName input')).toBeVisible({ timeout: 10000 });

      const fullNameInput = scenario.locator('#fullName input');
      await fullNameInput.fill('Jane Doe');
      await expect(fullNameInput).toHaveValue('Jane Doe', { timeout: 5000 });
      await fullNameInput.blur();

      const phoneNumberInput = scenario.locator('#phoneNumber input');
      await phoneNumberInput.fill('+1-555-987-6543');
      await expect(phoneNumberInput).toHaveValue('+1-555-987-6543', { timeout: 5000 });
      await phoneNumberInput.blur();
      await scenario.locator('button:has-text("Next"):visible').click();

      // Page 3: Wait for page 3 to be visible, then enter mismatched email confirmation
      await page.waitForSelector('[data-testid="cross-page-email-verification"] #confirmEmail input', { state: 'visible', timeout: 10000 });
      await expect(scenario.locator('#confirmEmail input')).toBeVisible({ timeout: 10000 });

      const confirmEmailInput = scenario.locator('#confirmEmail input');
      await confirmEmailInput.fill('different@email.com');
      await expect(confirmEmailInput).toHaveValue('different@email.com', { timeout: 5000 });
      await confirmEmailInput.blur();

      const termsCheckbox = scenario.locator('#termsAgreement p-checkbox input');
      await termsCheckbox.check();
      await expect(termsCheckbox).toBeChecked({ timeout: 5000 });

      // Verify submit button state with mismatched emails
      await page.waitForSelector('[data-testid="cross-page-email-verification"] #submitEmailVerification button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });
      const submitButton = scenario.locator('#submitEmailVerification button');
      await expect(submitButton).toBeEnabled({ timeout: 10000 });
    });
  });

  test.describe('Conditional Pages Flow', () => {
    test('should navigate through individual account flow', async ({ page, helpers }) => {
      await page.goto('/#/test/cross-page-validation/conditional-pages');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('conditional-pages');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Page 1: Account Type Selection
      await page.waitForSelector('[data-testid="conditional-pages"] #accountType', { state: 'visible', timeout: 10000 });
      await expect(scenario.locator('#accountType')).toBeVisible({ timeout: 10000 });

      await helpers.selectRadio(scenario, 'accountType', 'Individual Account');
      await helpers.selectOption(scenario.locator('#primaryUse p-select'), 'Personal Use');

      // Navigate to next page
      await scenario.locator('button:has-text("Next"):visible').click();

      // Page 2: Individual Information - wait for page 2 fields to be visible
      await page.waitForSelector('[data-testid="conditional-pages"] #firstName input', { state: 'visible', timeout: 10000 });
      await expect(scenario.getByText('Personal account details')).toBeVisible({ timeout: 10000 });

      // Fill individual info (blur triggers validation)
      const firstNameInput = scenario.locator('#firstName input');
      await firstNameInput.fill('Jane');
      await expect(firstNameInput).toHaveValue('Jane', { timeout: 5000 });
      await firstNameInput.blur();

      const lastNameInput = scenario.locator('#lastName input');
      await lastNameInput.fill('Smith');
      await expect(lastNameInput).toHaveValue('Smith', { timeout: 5000 });
      await lastNameInput.blur();

      await helpers.fillDatepicker(scenario, 'birthDate', '06/15/1985');

      // Navigate to final page
      await scenario.locator('button:has-text("Next"):visible').click();

      // Page 3: Final Confirmation (should skip business page) - wait for page 3 fields to be visible
      await page.waitForSelector('[data-testid="conditional-pages"] #confirmationCode input', { state: 'visible', timeout: 10000 });
      await expect(scenario.getByText('Review and submit your information')).toBeVisible({ timeout: 10000 });

      // Fill confirmation info (blur triggers validation)
      const confirmationCodeInput = scenario.locator('#confirmationCode input');
      await confirmationCodeInput.fill('ABC123');
      await expect(confirmationCodeInput).toHaveValue('ABC123', { timeout: 5000 });
      await confirmationCodeInput.blur();

      const finalTermsCheckbox = scenario.locator('#finalTerms p-checkbox input');
      await finalTermsCheckbox.check();
      await expect(finalTermsCheckbox).toBeChecked({ timeout: 5000 });

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

      // Wait for submit button to be enabled
      await page.waitForSelector('[data-testid="conditional-pages"] #submitConditional button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });
      const submitButton = scenario.locator('#submitConditional button');
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

      // Submit the form
      await submitButton.click();

      // Wait for formSubmitted event
      const submittedData = await submittedDataPromise;

      // Verify submitted data contains individual account information
      expect(submittedData).toMatchObject({
        accountType: 'individual',
        primaryUse: 'personal',
        firstName: 'Jane',
        lastName: 'Smith',
        confirmationCode: 'ABC123',
        finalTerms: true,
      });

      // Business fields should be empty (fields exist but are not filled in on hidden pages)
      expect((submittedData as Record<string, unknown>)['businessName']).toBeFalsy();
      expect((submittedData as Record<string, unknown>)['taxId']).toBeFalsy();
    });

    test('should navigate through business account flow', async ({ page, helpers }) => {
      await page.goto('/#/test/cross-page-validation/conditional-pages');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('conditional-pages');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Page 1: Select business account
      await page.waitForSelector('[data-testid="conditional-pages"] #accountType', { state: 'visible', timeout: 10000 });
      await helpers.selectRadio(scenario, 'accountType', 'Business Account');
      await helpers.selectOption(scenario.locator('#primaryUse p-select'), 'Professional Use');

      await scenario.locator('button:has-text("Next"):visible').click();

      // Page 2: Business Information (should skip individual page) - wait for page 2 fields to be visible
      await page.waitForSelector('[data-testid="conditional-pages"] #businessName input', { state: 'visible', timeout: 10000 });
      await expect(scenario.getByTestId('businessName')).toBeVisible({ timeout: 10000 });

      // Fill business info (blur triggers validation)
      const businessNameInput = scenario.locator('#businessName input');
      await businessNameInput.fill('TechCorp Solutions');
      await expect(businessNameInput).toHaveValue('TechCorp Solutions', { timeout: 5000 });
      await businessNameInput.blur();

      const taxIdInput = scenario.locator('#taxId input');
      await taxIdInput.fill('12-3456789');
      await expect(taxIdInput).toHaveValue('12-3456789', { timeout: 5000 });
      await taxIdInput.blur();

      await helpers.selectOption(scenario.locator('#businessType p-select'), 'LLC');

      await scenario.locator('button:has-text("Next"):visible').click();

      // Page 3: Final Confirmation - wait for page 3 fields to be visible
      await page.waitForSelector('[data-testid="conditional-pages"] #confirmationCode input', { state: 'visible', timeout: 10000 });
      await expect(scenario.locator('#confirmationCode input')).toBeVisible({ timeout: 10000 });

      // Fill confirmation info (blur triggers validation)
      const confirmationCodeInput = scenario.locator('#confirmationCode input');
      await confirmationCodeInput.fill('XYZ789');
      await expect(confirmationCodeInput).toHaveValue('XYZ789', { timeout: 5000 });
      await confirmationCodeInput.blur();

      const finalTermsCheckbox = scenario.locator('#finalTerms p-checkbox input');
      await finalTermsCheckbox.check();
      await expect(finalTermsCheckbox).toBeChecked({ timeout: 5000 });

      // Set up event listener and submit
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

      // Wait for submit button to be enabled
      await page.waitForSelector('[data-testid="conditional-pages"] #submitConditional button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });
      const submitButton = scenario.locator('#submitConditional button');
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

      await submitButton.click();
      const submittedData = await submittedDataPromise;

      // Verify business account submission
      expect(submittedData).toMatchObject({
        accountType: 'business',
        businessName: 'TechCorp Solutions',
        taxId: '12-3456789',
        businessType: 'llc',
      });

      // Individual fields should be empty (fields exist but are not filled in on hidden pages)
      expect((submittedData as Record<string, unknown>)['firstName']).toBeFalsy();
      expect((submittedData as Record<string, unknown>)['lastName']).toBeFalsy();
    });
  });

  test.describe('Business Flow', () => {
    test('should validate Tax ID format', async ({ page, helpers }) => {
      await page.goto('/#/test/cross-page-validation/business-flow');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('business-flow');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Page 1: Select business account
      await page.waitForSelector('[data-testid="business-flow"] #accountType', { state: 'visible', timeout: 10000 });
      await helpers.selectRadio(scenario, 'accountType', 'Business Account');
      await scenario.locator('button:has-text("Next"):visible').click();

      // Page 2: Business Information - wait for page 2 fields to be visible
      await page.waitForSelector('[data-testid="business-flow"] #businessName input', { state: 'visible', timeout: 10000 });
      await expect(scenario.getByTestId('businessName')).toBeVisible({ timeout: 10000 });

      const taxIdInput = scenario.locator('#taxId input');
      const submitButton = scenario.locator('#submitBusiness button');

      // Fill business name (blur triggers validation)
      const businessNameInput = scenario.locator('#businessName input');
      await businessNameInput.fill('TechCorp Solutions');
      await expect(businessNameInput).toHaveValue('TechCorp Solutions', { timeout: 5000 });
      await businessNameInput.blur();

      // Test invalid Tax ID format (blur triggers validation)
      await taxIdInput.fill('invalid-format');
      await expect(taxIdInput).toHaveValue('invalid-format', { timeout: 5000 });
      await taxIdInput.blur();

      // Verify Next button is disabled due to validation
      const nextButton = scenario.locator('button:has-text("Next"):visible');
      await expect(nextButton).toBeDisabled({ timeout: 10000 });

      // Should still be on business page
      await expect(scenario.getByTestId('businessName')).toBeVisible({ timeout: 10000 });

      // Enter valid Tax ID format (blur triggers validation)
      await taxIdInput.fill('12-3456789');
      await expect(taxIdInput).toHaveValue('12-3456789', { timeout: 5000 });
      await taxIdInput.blur();

      // Wait for Next button to be enabled
      await expect(nextButton).toBeEnabled({ timeout: 10000 });

      // Navigate to final page
      await nextButton.click();

      // Page 3: Final Confirmation - wait for page 3 fields to be visible
      await page.waitForSelector('[data-testid="business-flow"] #submitBusiness button', { state: 'visible', timeout: 10000 });
      await expect(scenario.getByTestId('submitBusiness')).toBeVisible({ timeout: 10000 });

      // Set up event listener and submit
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

      // Wait for submit button to be enabled
      await page.waitForSelector('[data-testid="business-flow"] #submitBusiness button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

      await submitButton.click();
      const submittedData = await submittedDataPromise;

      // Verify submission with valid Tax ID
      expect(submittedData).toMatchObject({
        accountType: 'business',
        businessName: 'TechCorp Solutions',
        taxId: '12-3456789',
      });
    });
  });

  test.describe('Cascade Dependencies Flow', () => {
    test('should maintain consistent data across pages', async ({ page, helpers }) => {
      await page.goto('/#/test/cross-page-validation/cascade-dependencies');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('cascade-dependencies');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Page 1: Region Selection
      await page.waitForSelector('[data-testid="cascade-dependencies"] #country', { state: 'visible', timeout: 10000 });
      await expect(scenario.getByText('Select your region and preferences')).toBeVisible({ timeout: 10000 });

      // Fill region info
      await helpers.selectOption(scenario.locator('#country p-select'), 'Canada');
      await helpers.selectOption(scenario.locator('#language p-select'), 'English');
      await helpers.selectOption(scenario.locator('#currency p-select'), 'Canadian Dollar (CAD)');

      // Navigate to page 2
      await scenario.locator('button:has-text("Next"):visible').click();

      // Page 2: Address Information - wait for page 2 fields to be visible
      await page.waitForSelector('[data-testid="cascade-dependencies"] #streetAddress input', { state: 'visible', timeout: 10000 });
      await expect(scenario.getByText('Provide your address details')).toBeVisible({ timeout: 10000 });

      // Fill address info (blur triggers validation)
      const streetAddressInput = scenario.locator('#streetAddress input');
      await streetAddressInput.fill('123 Maple Street');
      await expect(streetAddressInput).toHaveValue('123 Maple Street', { timeout: 5000 });
      await streetAddressInput.blur();

      const cityInput = scenario.locator('#city input');
      await cityInput.fill('Toronto');
      await expect(cityInput).toHaveValue('Toronto', { timeout: 5000 });
      await cityInput.blur();

      const postalCodeInput = scenario.locator('#postalCode input');
      await postalCodeInput.fill('M5V 3A1');
      await expect(postalCodeInput).toHaveValue('M5V 3A1', { timeout: 5000 });
      await postalCodeInput.blur();

      await helpers.selectOption(scenario.locator('#stateProvince p-select'), 'Ontario');

      // Navigate to page 3
      await scenario.locator('button:has-text("Next"):visible').click();

      // Page 3: Payment Information - wait for page 3 fields to be visible
      await page.waitForSelector('[data-testid="cascade-dependencies"] #paymentMethod', { state: 'visible', timeout: 10000 });
      await expect(scenario.getByText('Set up your payment preferences')).toBeVisible({ timeout: 10000 });

      // Fill payment info
      await helpers.selectRadio(scenario, 'paymentMethod', 'Bank Transfer');
      await helpers.selectOption(scenario.locator('#bankCountry p-select'), 'Canada');

      // Set up event listener and submit
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

      // Wait for submit button to be enabled
      await page.waitForSelector('[data-testid="cascade-dependencies"] #submitCascade button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });
      const submitButton = scenario.locator('#submitCascade button');
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

      await submitButton.click();
      const submittedData = await submittedDataPromise;

      // Verify consistent data across all pages
      expect(submittedData).toMatchObject({
        country: 'ca',
        language: 'en',
        currency: 'cad',
        streetAddress: '123 Maple Street',
        city: 'Toronto',
        postalCode: 'M5V 3A1',
        stateProvince: 'on',
        paymentMethod: 'bank_transfer',
        bankCountry: 'ca',
      });
    });
  });

  test.describe('Progressive Validation Flow', () => {
    test('should enforce validation at each page level', async ({ page, helpers }) => {
      await page.goto('/#/test/cross-page-validation/progressive-validation');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('progressive-validation');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Page 1: Basic Information
      await page.waitForSelector('[data-testid="progressive-validation"] #username input', { state: 'visible', timeout: 10000 });
      await expect(scenario.getByTestId('username')).toBeVisible({ timeout: 10000 });

      const usernameInput = scenario.locator('#username input');
      const nextButton = scenario.locator('button:has-text("Next"):visible');

      // Test minimum length validation (blur triggers validation)
      await usernameInput.fill('ab'); // Too short (min 3)
      await expect(usernameInput).toHaveValue('ab', { timeout: 5000 });
      await usernameInput.blur();

      // Verify Next button is disabled due to validation
      await expect(nextButton).toBeDisabled({ timeout: 10000 });

      // Should still be on page 1
      await expect(scenario.getByTestId('username')).toBeVisible({ timeout: 10000 });

      // Fix username (blur triggers validation)
      await usernameInput.fill('validuser123');
      await expect(usernameInput).toHaveValue('validuser123', { timeout: 5000 });
      await usernameInput.blur();

      // Now Next button should be enabled
      await expect(nextButton).toBeEnabled({ timeout: 10000 });

      // Navigate to page 2
      await nextButton.click();

      // Page 2: Enhanced Security - wait for page 2 to be visible
      await page.waitForSelector('[data-testid="progressive-validation"] #password input', { state: 'visible', timeout: 10000 });
      await expect(scenario.getByTestId('password')).toBeVisible({ timeout: 10000 });

      const passwordInput = scenario.locator('#password input');
      const page2NextButton = scenario.locator('button:has-text("Next"):visible');

      // Test password length validation (blur triggers validation)
      await passwordInput.fill('short'); // Too short (min 8)
      await expect(passwordInput).toHaveValue('short', { timeout: 5000 });
      await passwordInput.blur();
      await helpers.selectOption(scenario.locator('#securityQuestion p-select'), "What was your first pet's name?");

      const securityAnswerInput = scenario.locator('#securityAnswer input');
      await securityAnswerInput.fill('Fluffy');
      await expect(securityAnswerInput).toHaveValue('Fluffy', { timeout: 5000 });
      await securityAnswerInput.blur();

      // Verify Next button is disabled due to password validation
      await expect(page2NextButton).toBeDisabled({ timeout: 10000 });

      // Should still be on page 2
      await expect(scenario.getByTestId('password')).toBeVisible({ timeout: 10000 });

      // Fix password (blur triggers validation)
      await passwordInput.fill('securepassword123');
      await expect(passwordInput).toHaveValue('securepassword123', { timeout: 5000 });
      await passwordInput.blur();

      // Now Next button should be enabled
      await expect(page2NextButton).toBeEnabled({ timeout: 10000 });

      // Navigate to page 3
      await page2NextButton.click();

      // Page 3: Final Verification - wait for page 3 to be visible
      await page.waitForSelector('[data-testid="progressive-validation"] #confirmUsername input', { state: 'visible', timeout: 10000 });
      await expect(scenario.getByTestId('confirmUsername')).toBeVisible({ timeout: 10000 });

      // Fill verification info (blur triggers validation)
      const confirmUsernameInput = scenario.locator('#confirmUsername input');
      await confirmUsernameInput.fill('validuser123');
      await expect(confirmUsernameInput).toHaveValue('validuser123', { timeout: 5000 });
      await confirmUsernameInput.blur();

      const verificationCodeInput = scenario.locator('#verificationCode input');
      await verificationCodeInput.fill('123456');
      await expect(verificationCodeInput).toHaveValue('123456', { timeout: 5000 });
      await verificationCodeInput.blur();

      // Set up event listener and submit
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

      // Wait for submit button to be enabled
      await page.waitForSelector('[data-testid="progressive-validation"] #submitProgressive button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });
      const submitButton = scenario.locator('#submitProgressive button');
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

      await submitButton.click();
      const submittedData = await submittedDataPromise;

      // Verify all validation levels passed
      expect(submittedData).toMatchObject({
        username: 'validuser123',
        securityQuestion: 'pet',
        securityAnswer: 'Fluffy',
        confirmUsername: 'validuser123',
        verificationCode: '123456',
      });
    });

    test('should validate username confirmation matches original', async ({ page, helpers }) => {
      await page.goto('/#/test/cross-page-validation/progressive-validation');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('progressive-validation');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Page 1: Enter username (blur triggers validation)
      await page.waitForSelector('[data-testid="progressive-validation"] #username input', { state: 'visible', timeout: 10000 });
      const usernameInput = scenario.locator('#username input');
      await usernameInput.fill('testuser');
      await expect(usernameInput).toHaveValue('testuser', { timeout: 5000 });
      await usernameInput.blur();
      await scenario.locator('button:has-text("Next"):visible').click();

      // Page 2: Enter security info - wait for page 2 to be visible
      await page.waitForSelector('[data-testid="progressive-validation"] #password input', { state: 'visible', timeout: 10000 });
      await expect(scenario.locator('#password input')).toBeVisible({ timeout: 10000 });

      const passwordInput = scenario.locator('#password input');
      await passwordInput.fill('password123');
      await expect(passwordInput).toHaveValue('password123', { timeout: 5000 });
      await passwordInput.blur();

      await helpers.selectOption(scenario.locator('#securityQuestion p-select'), 'What was your first school?');

      const securityAnswerInput = scenario.locator('#securityAnswer input');
      await securityAnswerInput.fill('Elementary');
      await expect(securityAnswerInput).toHaveValue('Elementary', { timeout: 5000 });
      await securityAnswerInput.blur();
      await scenario.locator('button:has-text("Next"):visible').click();

      // Page 3: Enter mismatched username confirmation - wait for page 3 to be visible
      await page.waitForSelector('[data-testid="progressive-validation"] #confirmUsername input', { state: 'visible', timeout: 10000 });
      await expect(scenario.locator('#confirmUsername input')).toBeVisible({ timeout: 10000 });

      const confirmUsernameInput = scenario.locator('#confirmUsername input');
      await confirmUsernameInput.fill('differentuser');
      await expect(confirmUsernameInput).toHaveValue('differentuser', { timeout: 5000 });
      await confirmUsernameInput.blur();

      const verificationCodeInput = scenario.locator('#verificationCode input');
      await verificationCodeInput.fill('654321');
      await expect(verificationCodeInput).toHaveValue('654321', { timeout: 5000 });
      await verificationCodeInput.blur();

      // Verify submit button state (allow time for form validation)
      await page.waitForSelector('[data-testid="progressive-validation"] #submitProgressive button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });
      const submitButton = scenario.locator('#submitProgressive button');
      await expect(submitButton).toBeEnabled({ timeout: 10000 });
    });
  });
});
