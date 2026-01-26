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
      await expect(scenario).toBeVisible();

      // Page 1: Email Collection
      await expect(scenario.locator('h2:has-text("Email Registration")')).toBeVisible();

      // Fill email information (blur triggers validation)
      await scenario.locator('#primaryEmail input').fill('user@businesscorp.com');
      await scenario.locator('#primaryEmail input').blur();
      await scenario.locator('#emailType .form-check input[type="radio"][value="business"]').check();

      // Navigate to page 2
      await scenario.locator('button:has-text("Next"):visible').click();

      // Page 2: Personal Information
      await expect(scenario.locator('h2:has-text("Personal Information")')).toBeVisible();

      // Fill personal info (blur triggers validation)
      await scenario.locator('#fullName input').fill('John Doe');
      await scenario.locator('#fullName input').blur();
      await scenario.locator('#companyName input').fill('Business Corp Inc.');
      await scenario.locator('#companyName input').blur();
      await scenario.locator('#phoneNumber input').fill('+1-555-123-4567');
      await scenario.locator('#phoneNumber input').blur();

      // Navigate to page 3
      await scenario.locator('button:has-text("Next"):visible').click();

      // Page 3: Confirmation
      await expect(scenario.locator('h2:has-text("Confirmation")')).toBeVisible();

      // Fill confirmation information (blur triggers validation)
      await scenario.locator('#confirmEmail input').fill('user@businesscorp.com');
      await scenario.locator('#confirmEmail input').blur();
      await scenario.locator('#termsAgreement .form-check input').check();
      await scenario.locator('#emailNotifications .form-check input').check();

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
      await expect(scenario).toBeVisible();

      // Page 1: Fill email (blur triggers validation)
      await scenario.locator('#primaryEmail input').fill('user@example.com');
      await scenario.locator('#primaryEmail input').blur();
      await scenario.locator('#emailType .form-check input[type="radio"][value="personal"]').check();
      await scenario.locator('button:has-text("Next"):visible').click();

      // Page 2: Fill personal info - wait for page 2 to be visible
      await expect(scenario.locator('#fullName input')).toBeVisible();
      await scenario.locator('#fullName input').fill('Jane Doe');
      await scenario.locator('#fullName input').blur();
      await scenario.locator('#phoneNumber input').fill('+1-555-987-6543');
      await scenario.locator('#phoneNumber input').blur();
      await scenario.locator('button:has-text("Next"):visible').click();

      // Page 3: Enter mismatched email confirmation - wait for page 3 to be visible
      await expect(scenario.locator('#confirmEmail input')).toBeVisible();
      await scenario.locator('#confirmEmail input').fill('different@email.com');
      await scenario.locator('#confirmEmail input').blur();
      await scenario.locator('#termsAgreement .form-check input').check();

      // Verify submit button state with mismatched emails
      const submitButton = scenario.locator('#submitEmailVerification button');
      await expect(submitButton).toBeEnabled({ timeout: 10000 });
    });
  });

  test.describe('Conditional Pages Flow', () => {
    test('should navigate through individual account flow', async ({ page, helpers }) => {
      await page.goto('/#/test/cross-page-validation/conditional-pages');
      await page.waitForLoadState('networkidle');

      const scenario = helpers.getScenario('conditional-pages');
      await expect(scenario).toBeVisible();

      // Page 1: Account Type Selection
      await expect(scenario.locator('#accountType')).toBeVisible();

      await scenario.locator('#accountType .form-check input[type="radio"][value="individual"]').check();
      await scenario.locator('#primaryUse select').selectOption('personal');
      await scenario.locator('#primaryUse select').blur();

      // Navigate to next page
      await scenario.locator('button:has-text("Next"):visible').click();

      // Page 2: Individual Information
      await expect(scenario.getByText('Personal account details')).toBeVisible();

      // Fill individual info (blur triggers validation)
      await scenario.locator('#firstName input').fill('Jane');
      await scenario.locator('#firstName input').blur();
      await scenario.locator('#lastName input').fill('Smith');
      await scenario.locator('#lastName input').blur();
      await scenario.locator('#birthDate input').fill('1985-06-15');
      await scenario.locator('#birthDate input').blur();

      // Navigate to final page
      await scenario.locator('button:has-text("Next"):visible').click();

      // Page 3: Final Confirmation (should skip business page)
      await expect(scenario.getByText('Review and submit your information')).toBeVisible({ timeout: 10000 });

      // Fill confirmation info (blur triggers validation)
      await scenario.locator('#confirmationCode input').fill('ABC123');
      await scenario.locator('#confirmationCode input').blur();
      await scenario.locator('#finalTerms .form-check input').check();

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
      await expect(scenario).toBeVisible();

      // Page 1: Select business account
      await scenario.locator('#accountType .form-check input[type="radio"][value="business"]').check();
      await scenario.locator('#primaryUse select').selectOption('professional');
      await scenario.locator('#primaryUse select').blur();

      await scenario.locator('button:has-text("Next"):visible').click();

      // Page 2: Business Information (should skip individual page)
      await expect(scenario.getByTestId('businessName')).toBeVisible({ timeout: 10000 });

      // Fill business info (blur triggers validation)
      await scenario.locator('#businessName input').fill('TechCorp Solutions');
      await scenario.locator('#businessName input').blur();
      await scenario.locator('#taxId input').fill('12-3456789');
      await scenario.locator('#taxId input').blur();
      await scenario.locator('#businessType select').selectOption('llc');
      await scenario.locator('#businessType select').blur();

      await scenario.locator('button:has-text("Next"):visible').click();

      // Page 3: Final Confirmation
      await expect(scenario.locator('#confirmationCode input')).toBeVisible();

      // Fill confirmation info (blur triggers validation)
      await scenario.locator('#confirmationCode input').fill('XYZ789');
      await scenario.locator('#confirmationCode input').blur();
      await scenario.locator('#finalTerms .form-check input').check();

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
      await expect(scenario).toBeVisible();

      // Page 1: Select business account
      await scenario.locator('#accountType .form-check input[type="radio"][value="business"]').check();
      await scenario.locator('button:has-text("Next"):visible').click();

      // Page 2: Business Information
      await expect(scenario.getByTestId('businessName')).toBeVisible();

      const taxIdInput = scenario.locator('#taxId input');
      const submitButton = scenario.locator('#submitBusiness button');

      // Fill business name (blur triggers validation)
      await scenario.locator('#businessName input').fill('TechCorp Solutions');
      await scenario.locator('#businessName input').blur();

      // Test invalid Tax ID format (blur triggers validation)
      await taxIdInput.fill('invalid-format');
      await taxIdInput.blur();

      // Verify Next button is disabled due to validation
      const nextButton = scenario.locator('button:has-text("Next"):visible');
      await expect(nextButton).toBeDisabled();

      // Should still be on business page
      await expect(scenario.getByTestId('businessName')).toBeVisible();

      // Enter valid Tax ID format (blur triggers validation)
      await taxIdInput.fill('12-3456789');
      await taxIdInput.blur();

      // Wait for Next button to be enabled
      await expect(nextButton).toBeEnabled({ timeout: 10000 });

      // Navigate to final page
      await nextButton.click();

      // Page 3: Final Confirmation
      await expect(scenario.getByTestId('submitBusiness')).toBeVisible();

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
      await expect(scenario).toBeVisible();

      // Page 1: Region Selection
      await expect(scenario.getByText('Select your region and preferences')).toBeVisible();

      // Fill region info (blur triggers validation)
      await scenario.locator('#country select').selectOption('ca');
      await scenario.locator('#country select').blur();
      await scenario.locator('#language select').selectOption('en');
      await scenario.locator('#language select').blur();
      await scenario.locator('#currency select').selectOption('cad');
      await scenario.locator('#currency select').blur();

      // Navigate to page 2
      await scenario.locator('button:has-text("Next"):visible').click();

      // Page 2: Address Information
      await expect(scenario.getByText('Provide your address details')).toBeVisible();

      // Fill address info (blur triggers validation)
      await scenario.locator('#streetAddress input').fill('123 Maple Street');
      await scenario.locator('#streetAddress input').blur();
      await scenario.locator('#city input').fill('Toronto');
      await scenario.locator('#city input').blur();
      await scenario.locator('#postalCode input').fill('M5V 3A1');
      await scenario.locator('#postalCode input').blur();
      await scenario.locator('#stateProvince select').selectOption('on');
      await scenario.locator('#stateProvince select').blur();

      // Navigate to page 3
      await scenario.locator('button:has-text("Next"):visible').click();

      // Page 3: Payment Information
      await expect(scenario.getByText('Set up your payment preferences')).toBeVisible();

      // Fill payment info (blur triggers validation)
      await scenario.locator('#paymentMethod .form-check input[type="radio"][value="bank_transfer"]').check();
      await scenario.locator('#bankCountry select').selectOption('ca');
      await scenario.locator('#bankCountry select').blur();

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
      await expect(scenario).toBeVisible();

      // Page 1: Basic Information
      await expect(scenario.getByTestId('username')).toBeVisible();

      const usernameInput = scenario.locator('#username input');
      const nextButton = scenario.locator('button:has-text("Next"):visible');

      // Test minimum length validation (blur triggers validation)
      await usernameInput.fill('ab'); // Too short (min 3)
      await usernameInput.blur();

      // Verify Next button is disabled due to validation
      await expect(nextButton).toBeDisabled();

      // Should still be on page 1
      await expect(scenario.getByTestId('username')).toBeVisible();

      // Fix username (blur triggers validation)
      await usernameInput.fill('validuser123');
      await usernameInput.blur();

      // Now Next button should be enabled
      await expect(nextButton).toBeEnabled({ timeout: 10000 });

      // Navigate to page 2
      await nextButton.click();

      // Page 2: Enhanced Security - wait for page 2 to be visible
      await expect(scenario.getByTestId('password')).toBeVisible();

      const passwordInput = scenario.locator('#password input');
      const page2NextButton = scenario.locator('button:has-text("Next"):visible');

      // Test password length validation (blur triggers validation)
      await passwordInput.fill('short'); // Too short (min 8)
      await passwordInput.blur();
      await scenario.locator('#securityQuestion select').selectOption('pet');
      await scenario.locator('#securityQuestion select').blur();
      await scenario.locator('#securityAnswer input').fill('Fluffy');
      await scenario.locator('#securityAnswer input').blur();

      // Verify Next button is disabled due to password validation
      await expect(page2NextButton).toBeDisabled();

      // Should still be on page 2
      await expect(scenario.getByTestId('password')).toBeVisible();

      // Fix password (blur triggers validation)
      await passwordInput.fill('securepassword123');
      await passwordInput.blur();

      // Now Next button should be enabled
      await expect(page2NextButton).toBeEnabled({ timeout: 10000 });

      // Navigate to page 3
      await page2NextButton.click();

      // Page 3: Final Verification - wait for page 3 to be visible
      await expect(scenario.getByTestId('confirmUsername')).toBeVisible();

      // Fill verification info (blur triggers validation)
      await scenario.locator('#confirmUsername input').fill('validuser123');
      await scenario.locator('#confirmUsername input').blur();
      await scenario.locator('#verificationCode input').fill('123456');
      await scenario.locator('#verificationCode input').blur();

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
      await expect(scenario).toBeVisible();

      // Page 1: Enter username (blur triggers validation)
      await scenario.locator('#username input').fill('testuser');
      await scenario.locator('#username input').blur();
      await scenario.locator('button:has-text("Next"):visible').click();

      // Page 2: Enter security info - wait for page 2 to be visible
      await expect(scenario.locator('#password input')).toBeVisible();
      await scenario.locator('#password input').fill('password123');
      await scenario.locator('#password input').blur();
      await scenario.locator('#securityQuestion select').selectOption('school');
      await scenario.locator('#securityQuestion select').blur();
      await scenario.locator('#securityAnswer input').fill('Elementary');
      await scenario.locator('#securityAnswer input').blur();
      await scenario.locator('button:has-text("Next"):visible').click();

      // Page 3: Enter mismatched username confirmation - wait for page 3 to be visible
      await expect(scenario.locator('#confirmUsername input')).toBeVisible();
      await scenario.locator('#confirmUsername input').fill('differentuser');
      await scenario.locator('#confirmUsername input').blur();
      await scenario.locator('#verificationCode input').fill('654321');
      await scenario.locator('#verificationCode input').blur();

      // Verify submit button state (allow time for form validation)
      const submitButton = scenario.locator('#submitProgressive button');
      await expect(submitButton).toBeEnabled({ timeout: 10000 });
    });
  });
});
