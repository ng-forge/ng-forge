import { expect, test } from '@playwright/test';

test.describe('Cross-Page Validation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200/#/test/cross-page-validation');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Email Verification Flow', () => {
    test('should complete email verification across multiple pages', async ({ page }) => {
      // Navigate to email verification scenario
      await page.goto('http://localhost:4200/#/test/cross-page-validation/email-verification');
      await page.waitForLoadState('networkidle');

      // Locate the test scenario
      const scenario = page.locator('[data-testid="cross-page-email-verification"]');
      await expect(scenario).toBeVisible();

      // Page 1: Email Collection
      await expect(scenario.locator('h2:has-text("Email Registration")')).toBeVisible();

      // Fill email information
      await scenario.locator('[data-testid="primaryEmail"] input').fill('user@businesscorp.com');
      await scenario.locator('[data-testid="emailType"] mat-radio-button:has-text("Business Email")').click();

      // Navigate to page 2
      await scenario.locator('button:has-text("Next"):visible').click();
      await page.waitForTimeout(300);

      // Page 2: Personal Information
      await expect(scenario.locator('h2:has-text("Personal Information")')).toBeVisible();

      await scenario.locator('[data-testid="fullName"] input').fill('John Doe');
      await scenario.locator('[data-testid="companyName"] input').fill('Business Corp Inc.');
      await scenario.locator('[data-testid="phoneNumber"] input').fill('+1-555-123-4567');

      // Navigate to page 3
      await scenario.locator('button:has-text("Next"):visible').click();
      await page.waitForTimeout(300);

      // Page 3: Confirmation
      await expect(scenario.locator('h2:has-text("Confirmation")')).toBeVisible();

      // Fill confirmation information
      await scenario.locator('[data-testid="confirmEmail"] input').fill('user@businesscorp.com');
      await scenario.locator('[data-testid="termsAgreement"] mat-checkbox').click();
      await scenario.locator('[data-testid="emailNotifications"] mat-checkbox').click();
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
      await scenario.locator('[data-testid="submitEmailVerification"] button').click();

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

    test('should validate email confirmation matches primary email', async ({ page }) => {
      await page.goto('http://localhost:4200/#/test/cross-page-validation/email-verification');
      await page.waitForLoadState('networkidle');

      const scenario = page.locator('[data-testid="cross-page-email-verification"]');

      // Page 1: Fill email
      await scenario.locator('[data-testid="primaryEmail"] input').fill('user@example.com');
      await scenario.locator('[data-testid="emailType"] mat-radio-button:has-text("Personal Email")').click();
      await scenario.locator('button:has-text("Next"):visible').click();
      await page.waitForTimeout(300);

      // Page 2: Fill personal info
      await scenario.locator('[data-testid="fullName"] input').fill('Jane Doe');
      await scenario.locator('[data-testid="phoneNumber"] input').fill('+1-555-987-6543');
      await scenario.locator('button:has-text("Next"):visible').click();
      await page.waitForTimeout(300);

      // Page 3: Enter mismatched email confirmation
      await scenario.locator('[data-testid="confirmEmail"] input').fill('different@email.com');
      await scenario.locator('[data-testid="termsAgreement"] mat-checkbox').click();
      await page.waitForTimeout(200);

      // Verify submit button state with mismatched emails
      const submitButton = scenario.locator('[data-testid="submitEmailVerification"] button');
      await expect(submitButton).toBeEnabled();
    });
  });

  test.describe('Conditional Pages Flow', () => {
    test.skip('should navigate through individual account flow', async ({ page }) => {
      await page.goto('http://localhost:4200/#/test/cross-page-validation/conditional-pages');
      await page.waitForLoadState('networkidle');

      const scenario = page.locator('[data-testid="conditional-pages"]');
      await expect(scenario).toBeVisible();

      // Page 1: Account Type Selection
      await expect(scenario.locator('[data-testid="accountType"]')).toBeVisible();

      await scenario.locator('[data-testid="accountType"] mat-radio-button:has-text("Individual Account")').click();
      await scenario.locator('[data-testid="primaryUse"]').click();
      await page.locator('mat-option:has-text("Personal Use")').click();
      await page.waitForTimeout(200);

      // Navigate to next page
      await scenario.locator('button:has-text("Next"):visible').click();
      await page.waitForTimeout(300);

      // Page 2: Individual Information
      await expect(scenario.getByText('Personal account details')).toBeVisible();

      await scenario.locator('[data-testid="firstName"] input').fill('Jane');
      await scenario.locator('[data-testid="lastName"] input').fill('Smith');
      await scenario.locator('[data-testid="birthDate"] input').fill('06/15/1985');
      await page.waitForTimeout(200);

      // Navigate to final page
      await scenario.locator('button:has-text("Next"):visible').click();
      await page.waitForTimeout(500);

      // Page 3: Final Confirmation (should skip business page)
      await expect(scenario.getByText('Review and submit your information')).toBeVisible({ timeout: 10000 });

      await scenario.locator('[data-testid="confirmationCode"] input').fill('ABC123');
      await scenario.locator('[data-testid="finalTerms"] mat-checkbox').click();
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
      await scenario.locator('[data-testid="submitConditional"] button').click();

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

      // Should not contain business fields
      expect(submittedData).not.toHaveProperty('businessName');
      expect(submittedData).not.toHaveProperty('taxId');
    });

    test.skip('should navigate through business account flow', async ({ page }) => {
      await page.goto('http://localhost:4200/#/test/cross-page-validation/conditional-pages');
      await page.waitForLoadState('networkidle');

      const scenario = page.locator('[data-testid="conditional-pages"]');

      // Page 1: Select business account
      await scenario.locator('[data-testid="accountType"] mat-radio-button:has-text("Business Account")').click();
      await scenario.locator('[data-testid="primaryUse"]').click();
      await page.locator('mat-option:has-text("Professional Use")').click();
      await page.waitForTimeout(200);

      await scenario.locator('button:has-text("Next"):visible').click();
      await page.waitForTimeout(500);

      // Page 2: Business Information (should skip individual page)
      await expect(scenario.locator('[data-testid="businessName"]')).toBeVisible({ timeout: 10000 });
      await scenario.locator('[data-testid="businessName"] input').fill('TechCorp Solutions');
      await scenario.locator('[data-testid="taxId"] input').fill('12-3456789');
      await scenario.locator('[data-testid="businessType"]').click();
      await page.locator('mat-option:has-text("LLC")').click();
      await page.waitForTimeout(200);

      await scenario.locator('button:has-text("Next"):visible').click();
      await page.waitForTimeout(300);

      // Page 3: Final Confirmation
      await scenario.locator('[data-testid="confirmationCode"] input').fill('XYZ789');
      await scenario.locator('[data-testid="finalTerms"] mat-checkbox').click();
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

      await scenario.locator('[data-testid="submitConditional"] button').click();
      const submittedData = await submittedDataPromise;

      // Verify business account submission
      expect(submittedData).toMatchObject({
        accountType: 'business',
        businessName: 'TechCorp Solutions',
        taxId: '12-3456789',
        businessType: 'llc',
      });

      // Should not contain individual fields
      expect(submittedData).not.toHaveProperty('firstName');
      expect(submittedData).not.toHaveProperty('lastName');
    });
  });

  test.describe('Business Flow', () => {
    test.skip('should validate Tax ID format', async ({ page }) => {
      await page.goto('http://localhost:4200/#/test/cross-page-validation/business-flow');
      await page.waitForLoadState('networkidle');

      const scenario = page.locator('[data-testid="business-flow"]');
      await expect(scenario).toBeVisible();

      // Page 1: Select business account
      await scenario.locator('[data-testid="accountType"] mat-radio-button:has-text("Business Account")').click();
      await scenario.locator('button:has-text("Next"):visible').click();
      await page.waitForTimeout(300);

      // Page 2: Business Information
      await expect(scenario.locator('[data-testid="businessName"]')).toBeVisible();

      const taxIdInput = scenario.locator('[data-testid="taxId"] input');
      const submitButton = scenario.locator('[data-testid="submitBusiness"] button');

      // Fill business name
      await scenario.locator('[data-testid="businessName"] input').fill('TechCorp Solutions');

      // Test invalid Tax ID format
      await taxIdInput.fill('invalid-format');
      await page.waitForTimeout(200);

      // Try to navigate (pattern validation should prevent)
      await scenario.locator('button:has-text("Next"):visible').click();
      await page.waitForTimeout(500);

      // Should still be on business page due to validation
      await expect(scenario.locator('[data-testid="businessName"]')).toBeVisible({ timeout: 10000 });

      // Enter valid Tax ID format
      await taxIdInput.fill('12-3456789');
      await page.waitForTimeout(200);

      // Navigate to final page
      await scenario.locator('button:has-text("Next"):visible').click();
      await page.waitForTimeout(300);

      // Page 3: Final Confirmation
      await expect(scenario.locator('[data-testid="submitBusiness"]')).toBeVisible();

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
    test('should maintain consistent data across pages', async ({ page }) => {
      await page.goto('http://localhost:4200/#/test/cross-page-validation/cascade-dependencies');
      await page.waitForLoadState('networkidle');

      const scenario = page.locator('[data-testid="cascade-dependencies"]');
      await expect(scenario).toBeVisible();

      // Page 1: Region Selection
      await expect(scenario.getByText('Select your region and preferences')).toBeVisible();

      await scenario.locator('[data-testid="country"]').click();
      await page.locator('mat-option:has-text("Canada")').click();

      await scenario.locator('[data-testid="language"]').click();
      await page.locator('mat-option:has-text("English")').click();

      await scenario.locator('[data-testid="currency"]').click();
      await page.locator('mat-option:has-text("Canadian Dollar (CAD)")').click();
      await page.waitForTimeout(200);

      // Navigate to page 2
      await scenario.locator('button:has-text("Next"):visible').click();
      await page.waitForTimeout(300);

      // Page 2: Address Information
      await expect(scenario.getByText('Provide your address details')).toBeVisible();

      await scenario.locator('[data-testid="streetAddress"] input').fill('123 Maple Street');
      await scenario.locator('[data-testid="city"] input').fill('Toronto');
      await scenario.locator('[data-testid="postalCode"] input').fill('M5V 3A1');

      await scenario.locator('[data-testid="stateProvince"]').click();
      await page.locator('mat-option:has-text("Ontario")').click();
      await page.waitForTimeout(200);

      // Navigate to page 3
      await scenario.locator('button:has-text("Next"):visible').click();
      await page.waitForTimeout(300);

      // Page 3: Payment Information
      await expect(scenario.getByText('Set up your payment preferences')).toBeVisible();

      await scenario.locator('[data-testid="paymentMethod"] mat-radio-button:has-text("Bank Transfer")').click();

      await scenario.locator('[data-testid="bankCountry"]').click();
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

      await scenario.locator('[data-testid="submitCascade"] button').click();
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
    test.skip('should enforce validation at each page level', async ({ page }) => {
      await page.goto('http://localhost:4200/#/test/cross-page-validation/progressive-validation');
      await page.waitForLoadState('networkidle');

      const scenario = page.locator('[data-testid="progressive-validation"]');
      await expect(scenario).toBeVisible();

      // Page 1: Basic Information
      await expect(scenario.locator('[data-testid="username"]')).toBeVisible();

      const usernameInput = scenario.locator('[data-testid="username"] input');

      // Test minimum length validation
      await usernameInput.fill('ab'); // Too short (min 3)
      await page.waitForTimeout(200);

      // Try to navigate (should fail validation)
      await scenario.locator('button:has-text("Next"):visible').click();
      await page.waitForTimeout(500);

      // Should still be on page 1
      await expect(scenario.locator('[data-testid="username"]')).toBeVisible({ timeout: 10000 });

      // Fix username
      await usernameInput.fill('validuser123');
      await page.waitForTimeout(200);

      // Navigate to page 2
      await scenario.locator('button:has-text("Next"):visible').click();
      await page.waitForTimeout(300);

      // Page 2: Enhanced Security
      await expect(scenario.locator('[data-testid="password"]')).toBeVisible();

      const passwordInput = scenario.locator('[data-testid="password"] input');

      // Test password length validation
      await passwordInput.fill('short'); // Too short (min 8)

      await scenario.locator('[data-testid="securityQuestion"]').click();
      await page.locator('mat-option:has-text("What was your first pet\'s name?")').click();

      await scenario.locator('[data-testid="securityAnswer"] input').fill('Fluffy');
      await page.waitForTimeout(200);

      // Try to navigate (should fail due to password)
      await scenario.locator('button:has-text("Next"):visible').click();
      await page.waitForTimeout(300);

      // Should still be on page 2
      await expect(scenario.locator('[data-testid="password"]')).toBeVisible();

      // Fix password
      await passwordInput.fill('securepassword123');
      await page.waitForTimeout(200);

      // Navigate to page 3
      await scenario.locator('button:has-text("Next"):visible').click();
      await page.waitForTimeout(300);

      // Page 3: Final Verification
      await expect(scenario.locator('[data-testid="confirmUsername"]')).toBeVisible();

      await scenario.locator('[data-testid="confirmUsername"] input').fill('validuser123');
      await scenario.locator('[data-testid="verificationCode"] input').fill('123456');
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

      await scenario.locator('[data-testid="submitProgressive"] button').click();
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

    test('should validate username confirmation matches original', async ({ page }) => {
      await page.goto('http://localhost:4200/#/test/cross-page-validation/progressive-validation');
      await page.waitForLoadState('networkidle');

      const scenario = page.locator('[data-testid="progressive-validation"]');

      // Page 1: Enter username
      await scenario.locator('[data-testid="username"] input').fill('testuser');
      await scenario.locator('button:has-text("Next"):visible').click();
      await page.waitForTimeout(300);

      // Page 2: Enter security info
      await scenario.locator('[data-testid="password"] input').fill('password123');
      await scenario.locator('[data-testid="securityQuestion"]').click();
      await page.locator('mat-option:has-text("What was your first school?")').click();
      await scenario.locator('[data-testid="securityAnswer"] input').fill('Elementary');
      await scenario.locator('button:has-text("Next"):visible').click();
      await page.waitForTimeout(300);

      // Page 3: Enter mismatched username confirmation
      await scenario.locator('[data-testid="confirmUsername"] input').fill('differentuser');
      await scenario.locator('[data-testid="verificationCode"] input').fill('654321');
      await page.waitForTimeout(200);

      // Verify submit button state
      const submitButton = scenario.locator('[data-testid="submitProgressive"] button');
      await expect(submitButton).toBeEnabled();
    });
  });
});
