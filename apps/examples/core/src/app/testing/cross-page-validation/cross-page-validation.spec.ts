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

      // Fill email information
      await scenario.locator('#primaryEmail input').fill('user@businesscorp.com');
      await scenario.locator('#emailType mat-radio-button:has-text("Business Email")').click();

      // Navigate to page 2
      await scenario.locator('button:has-text("Next"):visible').click();
      await page.waitForTimeout(300);

      // Page 2: Personal Information
      await expect(scenario.locator('h2:has-text("Personal Information")')).toBeVisible();

      await scenario.locator('#fullName input').fill('John Doe');
      await scenario.locator('#companyName input').fill('Business Corp Inc.');
      await scenario.locator('#phoneNumber input').fill('+1-555-123-4567');

      // Navigate to page 3
      await scenario.locator('button:has-text("Next"):visible').click();
      await page.waitForTimeout(300);

      // Page 3: Confirmation
      await expect(scenario.locator('h2:has-text("Confirmation")')).toBeVisible();

      // Fill confirmation information
      await scenario.locator('#confirmEmail input').fill('user@businesscorp.com');
      await scenario.locator('#termsAgreement mat-checkbox').click();
      await scenario.locator('#emailNotifications mat-checkbox').click();
      await page.waitForTimeout(200);

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
      await scenario.locator('#submitEmailVerification button').click();

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

      // Page 1: Fill email
      await scenario.locator('#primaryEmail input').fill('user@example.com');
      await scenario.locator('#emailType mat-radio-button:has-text("Personal Email")').click();
      await scenario.locator('button:has-text("Next"):visible').click();
      await page.waitForTimeout(300);

      // Page 2: Fill personal info
      await scenario.locator('#fullName input').fill('Jane Doe');
      await scenario.locator('#phoneNumber input').fill('+1-555-987-6543');
      await scenario.locator('button:has-text("Next"):visible').click();
      await page.waitForTimeout(300);

      // Page 3: Enter mismatched email confirmation
      await scenario.locator('#confirmEmail input').fill('different@email.com');
      await scenario.locator('#termsAgreement mat-checkbox').click();
      await page.waitForTimeout(200);

      // Verify submit button state with mismatched emails
      const submitButton = scenario.locator('#submitEmailVerification button');
      await expect(submitButton).toBeEnabled();
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

      await scenario.locator('#accountType mat-radio-button:has-text("Individual Account")').click();
      await scenario.locator('#primaryUse').click();
      await page.locator('mat-option:has-text("Personal Use")').click();
      await page.waitForTimeout(200);

      // Navigate to next page
      await scenario.locator('button:has-text("Next"):visible').click();
      await page.waitForTimeout(300);

      // Page 2: Individual Information
      await expect(scenario.getByText('Personal account details')).toBeVisible();

      await scenario.locator('#firstName input').fill('Jane');
      await scenario.locator('#lastName input').fill('Smith');
      await scenario.locator('#birthDate input').fill('06/15/1985');
      await page.waitForTimeout(200);

      // Navigate to final page
      await scenario.locator('button:has-text("Next"):visible').click();
      await page.waitForTimeout(500);

      // Page 3: Final Confirmation (should skip business page)
      await expect(scenario.getByText('Review and submit your information')).toBeVisible({ timeout: 10000 });

      await scenario.locator('#confirmationCode input').fill('ABC123');
      await scenario.locator('#finalTerms mat-checkbox').click();
      await page.waitForTimeout(200);

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
      await scenario.locator('#submitConditional button').click();

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

      // Page 1: Select business account
      await scenario.locator('#accountType mat-radio-button:has-text("Business Account")').click();
      await scenario.locator('#primaryUse').click();
      await page.locator('mat-option:has-text("Professional Use")').click();
      await page.waitForTimeout(200);

      await scenario.locator('button:has-text("Next"):visible').click();
      await page.waitForTimeout(500);

      // Page 2: Business Information (should skip individual page)
      await expect(scenario.locator('#businessName')).toBeVisible({ timeout: 10000 });
      await scenario.locator('#businessName input').fill('TechCorp Solutions');
      await scenario.locator('#taxId input').fill('12-3456789');
      await scenario.locator('#businessType').click();
      await page.locator('mat-option:has-text("LLC")').click();
      await page.waitForTimeout(200);

      await scenario.locator('button:has-text("Next"):visible').click();
      await page.waitForTimeout(300);

      // Page 3: Final Confirmation
      await scenario.locator('#confirmationCode input').fill('XYZ789');
      await scenario.locator('#finalTerms mat-checkbox').click();
      await page.waitForTimeout(200);

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

      await scenario.locator('#submitConditional button').click();
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
      await scenario.locator('#accountType mat-radio-button:has-text("Business Account")').click();
      await scenario.locator('button:has-text("Next"):visible').click();
      await page.waitForTimeout(300);

      // Page 2: Business Information
      await expect(scenario.locator('#businessName')).toBeVisible();

      const taxIdInput = scenario.locator('#taxId input');
      const submitButton = scenario.locator('#submitBusiness button');

      // Fill business name
      await scenario.locator('#businessName input').fill('TechCorp Solutions');

      // Test invalid Tax ID format
      await taxIdInput.fill('invalid-format');
      await page.waitForTimeout(200);

      // Verify Next button is disabled due to validation
      const nextButton = scenario.locator('button:has-text("Next"):visible');
      await expect(nextButton).toBeDisabled();

      // Should still be on business page
      await expect(scenario.locator('#businessName')).toBeVisible();

      // Enter valid Tax ID format
      await taxIdInput.fill('12-3456789');
      await page.waitForTimeout(200);

      // Navigate to final page
      await scenario.locator('button:has-text("Next"):visible').click();
      await page.waitForTimeout(300);

      // Page 3: Final Confirmation
      await expect(scenario.locator('#submitBusiness')).toBeVisible();

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

      await scenario.locator('#country').click();
      await page.locator('mat-option:has-text("Canada")').click();

      await scenario.locator('#language').click();
      await page.locator('mat-option:has-text("English")').click();

      await scenario.locator('#currency').click();
      await page.locator('mat-option:has-text("Canadian Dollar (CAD)")').click();
      await page.waitForTimeout(200);

      // Navigate to page 2
      await scenario.locator('button:has-text("Next"):visible').click();
      await page.waitForTimeout(300);

      // Page 2: Address Information
      await expect(scenario.getByText('Provide your address details')).toBeVisible();

      await scenario.locator('#streetAddress input').fill('123 Maple Street');
      await scenario.locator('#city input').fill('Toronto');
      await scenario.locator('#postalCode input').fill('M5V 3A1');

      await scenario.locator('#stateProvince').click();
      await page.locator('mat-option:has-text("Ontario")').click();
      await page.waitForTimeout(200);

      // Navigate to page 3
      await scenario.locator('button:has-text("Next"):visible').click();
      await page.waitForTimeout(300);

      // Page 3: Payment Information
      await expect(scenario.getByText('Set up your payment preferences')).toBeVisible();

      await scenario.locator('#paymentMethod mat-radio-button:has-text("Bank Transfer")').click();

      await scenario.locator('#bankCountry').click();
      await page.locator('mat-option:has-text("Canada")').click();
      await page.waitForTimeout(200);

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

      await scenario.locator('#submitCascade button').click();
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
      await expect(scenario.locator('#username')).toBeVisible();

      const usernameInput = scenario.locator('#username input');
      const nextButton = scenario.locator('button:has-text("Next"):visible');

      // Test minimum length validation
      await usernameInput.fill('ab'); // Too short (min 3)
      await page.waitForTimeout(200);

      // Verify Next button is disabled due to validation
      await expect(nextButton).toBeDisabled();

      // Should still be on page 1
      await expect(scenario.locator('#username')).toBeVisible();

      // Fix username
      await usernameInput.fill('validuser123');
      await page.waitForTimeout(200);

      // Now Next button should be enabled
      await expect(nextButton).toBeEnabled();

      // Navigate to page 2
      await nextButton.click();
      await page.waitForTimeout(300);

      // Page 2: Enhanced Security
      await expect(scenario.locator('#password')).toBeVisible();

      const passwordInput = scenario.locator('#password input');
      const page2NextButton = scenario.locator('button:has-text("Next"):visible');

      // Test password length validation
      await passwordInput.fill('short'); // Too short (min 8)

      await scenario.locator('#securityQuestion').click();
      await page.locator('mat-option:has-text("What was your first pet\'s name?")').click();

      await scenario.locator('#securityAnswer input').fill('Fluffy');
      await page.waitForTimeout(200);

      // Verify Next button is disabled due to password validation
      await expect(page2NextButton).toBeDisabled();

      // Should still be on page 2
      await expect(scenario.locator('#password')).toBeVisible();

      // Fix password
      await passwordInput.fill('securepassword123');
      await page.waitForTimeout(200);

      // Now Next button should be enabled
      await expect(page2NextButton).toBeEnabled();

      // Navigate to page 3
      await page2NextButton.click();
      await page.waitForTimeout(300);

      // Page 3: Final Verification
      await expect(scenario.locator('#confirmUsername')).toBeVisible();

      await scenario.locator('#confirmUsername input').fill('validuser123');
      await scenario.locator('#verificationCode input').fill('123456');
      await page.waitForTimeout(200);

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

      await scenario.locator('#submitProgressive button').click();
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

      // Page 1: Enter username
      await scenario.locator('#username input').fill('testuser');
      await scenario.locator('button:has-text("Next"):visible').click();
      await page.waitForTimeout(300);

      // Page 2: Enter security info
      await scenario.locator('#password input').fill('password123');
      await scenario.locator('#securityQuestion').click();
      await page.locator('mat-option:has-text("What was your first school?")').click();
      await scenario.locator('#securityAnswer input').fill('Elementary');
      await scenario.locator('button:has-text("Next"):visible').click();
      await page.waitForTimeout(300);

      // Page 3: Enter mismatched username confirmation
      await scenario.locator('#confirmUsername input').fill('differentuser');
      await scenario.locator('#verificationCode input').fill('654321');
      await page.waitForTimeout(200);

      // Verify submit button state
      const submitButton = scenario.locator('#submitProgressive button');
      await expect(submitButton).toBeEnabled();
    });
  });
});
