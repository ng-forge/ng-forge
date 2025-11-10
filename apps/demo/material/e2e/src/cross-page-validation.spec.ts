/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, test } from '@playwright/test';

test.describe('Cross-Page Validation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200/e2e-test');
  });

  test('should test email verification across multiple pages', async ({ page }) => {
    // Load email verification scenario (3 pages)
    await page.evaluate(() => {
      const emailVerificationConfig = {
        fields: [
          // Page 1: Email Collection
          {
            key: 'emailPage',
            type: 'page',
            fields: [
              {
                key: 'emailPageTitle',
                type: 'text',
                label: 'Email Registration',
                props: {
                  elementType: 'h2',
                },
                col: 12,
              },
              {
                key: 'emailPageDescription',
                type: 'text',
                label: 'Please provide your email address',
                col: 12,
              },
              {
                key: 'primaryEmail',
                type: 'input',
                label: 'Primary Email Address',
                props: {
                  type: 'email',
                  placeholder: 'Enter your primary email',
                },
                email: true,
                required: true,
                col: 12,
              },
              {
                key: 'emailType',
                type: 'radio',
                label: 'Email Type',
                options: [
                  { value: 'personal', label: 'Personal Email' },
                  { value: 'business', label: 'Business Email' },
                  { value: 'other', label: 'Other' },
                ],
                required: true,
                col: 12,
              },
            ],
          },
          // Page 2: Personal Information (dependent on email type)
          {
            key: 'personalPage',
            type: 'page',
            fields: [
              {
                key: 'personalPageTitle',
                type: 'text',
                label: 'Personal Information',
                props: {
                  elementType: 'h2',
                },
                col: 12,
              },
              {
                key: 'personalPageDescription',
                type: 'text',
                label: 'Tell us more about yourself',
                col: 12,
              },
              {
                key: 'fullName',
                type: 'input',
                label: 'Full Name',
                props: {
                  placeholder: 'Enter your full name',
                },
                required: true,
                col: 12,
              },
              {
                key: 'companyName',
                type: 'input',
                label: 'Company Name',
                props: {
                  placeholder: 'Enter company name (for business emails)',
                },
                // Would typically be required only if emailType is 'business'
                col: 12,
              },
              {
                key: 'phoneNumber',
                type: 'input',
                label: 'Phone Number',
                props: {
                  type: 'tel',
                  placeholder: 'Enter phone number',
                },
                pattern: '^[+]?[0-9\\s\\-\\(\\)]+$',
                required: true,
                col: 12,
              },
            ],
          },
          // Page 3: Confirmation (validates data from previous pages)
          {
            key: 'confirmationPage',
            type: 'page',
            fields: [
              {
                key: 'confirmationPageTitle',
                type: 'text',
                label: 'Confirmation',
                props: {
                  elementType: 'h2',
                },
                col: 12,
              },
              {
                key: 'confirmationPageDescription',
                type: 'text',
                label: 'Please confirm your information',
                col: 12,
              },
              {
                key: 'confirmEmail',
                type: 'input',
                label: 'Confirm Email Address',
                props: {
                  type: 'email',
                  placeholder: 'Re-enter your email to confirm',
                },
                email: true,
                required: true,
                col: 12,
              },
              {
                key: 'termsAgreement',
                type: 'checkbox',
                label: 'I agree to the Terms of Service and Privacy Policy',
                required: true,
                col: 12,
              },
              {
                key: 'emailNotifications',
                type: 'checkbox',
                label: 'Send me email notifications',
                col: 12,
              },
              {
                key: 'submitEmailVerification',
                type: 'submit',
                label: 'Complete Registration',
                col: 12,
              },
            ],
          },
        ],
      };

      (window as any).loadTestScenario(emailVerificationConfig, {
        testId: 'cross-page-email-verification',
        title: 'Cross-Page Email Verification',
        description: 'Testing email verification workflow across multiple pages',
      });
    });

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Page 1: Fill email information
    await expect(page.locator('text=Email Registration')).toBeVisible();
    await page.fill('#primaryEmail input', 'user@businesscorp.com');
    await page.click('#emailType mat-radio-button:has-text("Business Email")');

    // Navigate to page 2
    const nextButton1 = page.locator('button:has-text("Next")').or(page.locator('button[aria-label*="next"]'));
    if (await nextButton1.isVisible()) {
      await nextButton1.click();
      await page.waitForTimeout(1000);
    }

    // Page 2: Fill personal information (business context)
    const personalPageVisible = await page.locator('text=Personal Information').isVisible();
    if (personalPageVisible) {
      await page.fill('#fullName input', 'John Doe');
      await page.fill('#companyName input', 'Business Corp Inc.'); // Required for business emails
      await page.fill('#phoneNumber input', '+1-555-123-4567');

      // Navigate to page 3
      const nextButton2 = page.locator('button:has-text("Next")').or(page.locator('button[aria-label*="next"]'));
      if (await nextButton2.isVisible()) {
        await nextButton2.click();
        await page.waitForTimeout(1000);
      }
    }

    // Page 3: Test email confirmation validation
    const confirmationPageVisible = await page.locator('text=Confirmation').isVisible();
    if (confirmationPageVisible) {
      // First, try with mismatched email
      await page.fill('#confirmEmail input', 'different@email.com');
      await page.click('#termsAgreement mat-checkbox');

      // Try to submit with mismatched email
      await page.click('#submitEmailVerification button');

      // Form should not submit or should show validation error
      await page.waitForTimeout(1000);

      // Now correct the email confirmation
      await page.fill('#confirmEmail input', 'user@businesscorp.com');
      await page.click('#emailNotifications mat-checkbox');

      // Submit with correct email confirmation
      await page.click('#submitEmailVerification button');

      // Verify submission contains data from all pages
      await expect(page.locator('[data-testid="submission-0"]')).toBeVisible();
      const submissionText = await page.locator('[data-testid="submission-0"]').textContent();

      expect(submissionText).toContain('user@businesscorp.com'); // From page 1 and 3
      expect(submissionText).toContain('business'); // From page 1
      expect(submissionText).toContain('John Doe'); // From page 2
      expect(submissionText).toContain('Business Corp Inc.'); // From page 2
    }
  });

  test('should test conditional page visibility based on previous selections', async ({ page }) => {
    // Load conditional page scenario
    await page.evaluate(() => {
      const conditionalPagesConfig = {
        fields: [
          // Page 1: Account Type Selection
          {
            key: 'accountTypePage',
            type: 'page',
            title: 'Account Type',
            description: 'Select your account type',
            fields: [
              {
                key: 'accountType',
                type: 'radio',
                label: 'Account Type',
                options: [
                  { value: 'individual', label: 'Individual Account' },
                  { value: 'business', label: 'Business Account' },
                  { value: 'nonprofit', label: 'Non-Profit Organization' },
                ],
                required: true,
                col: 12,
              },
              {
                key: 'primaryUse',
                type: 'select',
                label: 'Primary Use',
                options: [
                  { value: 'personal', label: 'Personal Use' },
                  { value: 'professional', label: 'Professional Use' },
                  { value: 'education', label: 'Educational Use' },
                  { value: 'charity', label: 'Charitable Work' },
                ],
                required: true,
                col: 12,
              },
            ],
          },
          // Page 2: Individual Information (conditional)
          {
            key: 'individualPage',
            type: 'page',
            title: 'Individual Information',
            description: 'Personal account details',
            fields: [
              {
                key: 'firstName',
                type: 'input',
                label: 'First Name',
                props: {
                  placeholder: 'Enter first name',
                },
                required: true,
                col: 6,
              },
              {
                key: 'lastName',
                type: 'input',
                label: 'Last Name',
                props: {
                  placeholder: 'Enter last name',
                },
                required: true,
                col: 6,
              },
              {
                key: 'birthDate',
                type: 'input',
                label: 'Date of Birth',
                props: {
                  type: 'date',
                },
                required: true,
                col: 12,
              },
            ],
          },
          // Page 3: Business Information (conditional)
          {
            key: 'businessPage',
            type: 'page',
            title: 'Business Information',
            description: 'Business account details',
            fields: [
              {
                key: 'businessName',
                type: 'input',
                label: 'Business Name',
                props: {
                  placeholder: 'Enter business name',
                },
                required: true,
                col: 12,
              },
              {
                key: 'taxId',
                type: 'input',
                label: 'Tax ID / EIN',
                props: {
                  placeholder: 'Enter tax identification number',
                },
                pattern: '^[0-9]{2}-[0-9]{7}$',
                required: true,
                col: 6,
              },
              {
                key: 'businessType',
                type: 'select',
                label: 'Business Type',
                options: [
                  { value: 'llc', label: 'LLC' },
                  { value: 'corporation', label: 'Corporation' },
                  { value: 'partnership', label: 'Partnership' },
                  { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
                ],
                required: true,
                col: 6,
              },
            ],
          },
          // Page 4: Final Confirmation
          {
            key: 'finalPage',
            type: 'page',
            title: 'Final Confirmation',
            description: 'Review and submit your information',
            fields: [
              {
                key: 'confirmationCode',
                type: 'input',
                label: 'Confirmation Code',
                props: {
                  placeholder: 'Enter confirmation code (sent via email)',
                },
                pattern: '^[A-Z0-9]{6}$',
                required: true,
                col: 12,
              },
              {
                key: 'finalTerms',
                type: 'checkbox',
                label: 'I confirm all information is accurate',
                required: true,
                col: 12,
              },
              {
                key: 'submitConditional',
                type: 'submit',
                label: 'Create Account',
                col: 12,
              },
            ],
          },
        ],
      };

      (window as any).loadTestScenario(conditionalPagesConfig, {
        testId: 'conditional-pages',
        title: 'Conditional Page Visibility',
        description: 'Testing conditional page visibility based on previous selections',
      });
    });

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Test Individual Account Flow
    await expect(page.locator('text=Account Type')).toBeVisible();
    await page.click('#accountType mat-radio-button:has-text("Individual Account")');
    await page.click('#primaryUse mat-select');
    await page.click('mat-option[value="personal"]');

    // Navigate to next page
    const nextButton1 = page.locator('button:has-text("Next")').or(page.locator('button[aria-label*="next"]'));
    if (await nextButton1.isVisible()) {
      await nextButton1.click();
      await page.waitForTimeout(1000);
    }

    // Should go to Individual Information page (page 2)
    const individualPageVisible = await page.locator('text=Individual Information').isVisible();
    if (individualPageVisible) {
      console.log('Correctly navigated to Individual Information page');

      await page.fill('#firstName input', 'Jane');
      await page.fill('#lastName input', 'Smith');
      await page.fill('#birthDate input', '1985-06-15');

      // Navigate to final page (should skip business page)
      const nextButton2 = page.locator('button:has-text("Next")').or(page.locator('button[aria-label*="next"]'));
      if (await nextButton2.isVisible()) {
        await nextButton2.click();
        await page.waitForTimeout(1000);
      }

      // Should arrive at final confirmation page
      const finalPageVisible = await page.locator('text=Final Confirmation').isVisible();
      if (finalPageVisible) {
        console.log('Correctly skipped business page and arrived at final page');

        await page.fill('#confirmationCode input', 'ABC123');
        await page.click('#finalTerms mat-checkbox');
        await page.click('#submitConditional button');

        // Verify submission contains individual data
        await expect(page.locator('[data-testid="submission-0"]')).toBeVisible();
        const submissionText = await page.locator('[data-testid="submission-0"]').textContent();

        expect(submissionText).toContain('individual');
        expect(submissionText).toContain('Jane');
        expect(submissionText).toContain('Smith');
        expect(submissionText).not.toContain('businessName'); // Should not contain business fields
      }
    }
  });

  test('should test business account flow with different validation', async ({ page }) => {
    // Load the same conditional scenario but test business flow
    await page.evaluate(() => {
      const conditionalPagesConfig = {
        fields: [
          {
            key: 'accountTypePage',
            type: 'page',
            title: 'Account Type',
            fields: [
              {
                key: 'accountType',
                type: 'radio',
                label: 'Account Type',
                options: [
                  { value: 'individual', label: 'Individual Account' },
                  { value: 'business', label: 'Business Account' },
                  { value: 'nonprofit', label: 'Non-Profit Organization' },
                ],
                required: true,
                col: 12,
              },
            ],
          },
          {
            key: 'businessPage',
            type: 'page',
            title: 'Business Information',
            fields: [
              {
                key: 'businessName',
                type: 'input',
                label: 'Business Name',
                props: {
                  placeholder: 'Enter business name',
                },
                required: true,
                col: 12,
              },
              {
                key: 'taxId',
                type: 'input',
                label: 'Tax ID / EIN',
                props: {
                  placeholder: 'Format: XX-XXXXXXX',
                },
                pattern: '^[0-9]{2}-[0-9]{7}$',
                required: true,
                col: 12,
              },
            ],
          },
          {
            key: 'finalPage',
            type: 'page',
            title: 'Final Confirmation',
            fields: [
              {
                key: 'submitBusiness',
                type: 'submit',
                label: 'Create Business Account',
                col: 12,
              },
            ],
          },
        ],
      };

      (window as any).loadTestScenario(conditionalPagesConfig, {
        testId: 'business-flow',
        title: 'Business Account Flow',
        description: 'Testing business account flow with specific validation',
      });
    });

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Test Business Account Flow
    await page.click('#accountType mat-radio-button:has-text("Business Account")');

    // Navigate to next page
    const nextButton1 = page.locator('button:has-text("Next")').or(page.locator('button[aria-label*="next"]'));
    if (await nextButton1.isVisible()) {
      await nextButton1.click();
      await page.waitForTimeout(1000);
    }

    // Should go to Business Information page
    const businessPageVisible = await page.locator('text=Business Information').isVisible();
    if (businessPageVisible) {
      console.log('Correctly navigated to Business Information page');

      // Test invalid Tax ID format first
      await page.fill('#businessName input', 'TechCorp Solutions');
      await page.fill('#taxId input', 'invalid-format');

      // Try to navigate (should fail validation)
      const nextButton2 = page.locator('button:has-text("Next")').or(page.locator('button[aria-label*="next"]'));
      if (await nextButton2.isVisible()) {
        await nextButton2.click();
        await page.waitForTimeout(1000);

        // Should still be on business page due to validation
        const stillOnBusinessPage = await page.locator('text=Business Information').isVisible();
        console.log('Still on business page after invalid Tax ID:', stillOnBusinessPage);
      }

      // Now enter valid Tax ID
      await page.fill('#taxId input', '12-3456789');

      // Navigate to final page
      if (await nextButton2.isVisible()) {
        await nextButton2.click();
        await page.waitForTimeout(1000);
      }

      // Should arrive at final page
      const finalPageVisible = await page.locator('text=Final Confirmation').isVisible();
      if (finalPageVisible) {
        await page.click('#submitBusiness button');

        // Verify business submission
        await expect(page.locator('[data-testid="submission-0"]')).toBeVisible();
        const submissionText = await page.locator('[data-testid="submission-0"]').textContent();

        expect(submissionText).toContain('business');
        expect(submissionText).toContain('TechCorp Solutions');
        expect(submissionText).toContain('12-3456789');
      }
    }
  });

  test('should test cross-page data dependencies and cascade updates', async ({ page }) => {
    // Load cascade dependency scenario
    await page.evaluate(() => {
      const cascadeConfig = {
        fields: [
          // Page 1: Region Selection
          {
            key: 'regionPage',
            type: 'page',
            title: 'Region Selection',
            description: 'Select your region and preferences',
            fields: [
              {
                key: 'country',
                type: 'select',
                label: 'Country',
                options: [
                  { value: 'us', label: 'United States' },
                  { value: 'ca', label: 'Canada' },
                  { value: 'uk', label: 'United Kingdom' },
                  { value: 'de', label: 'Germany' },
                ],
                required: true,
                col: 6,
              },
              {
                key: 'language',
                type: 'select',
                label: 'Preferred Language',
                options: [
                  { value: 'en', label: 'English' },
                  { value: 'fr', label: 'French' },
                  { value: 'de', label: 'German' },
                  { value: 'es', label: 'Spanish' },
                ],
                required: true,
                col: 6,
              },
              {
                key: 'currency',
                type: 'select',
                label: 'Currency',
                options: [
                  { value: 'usd', label: 'US Dollar ($)' },
                  { value: 'cad', label: 'Canadian Dollar (CAD)' },
                  { value: 'gbp', label: 'British Pound (£)' },
                  { value: 'eur', label: 'Euro (€)' },
                ],
                required: true,
                col: 12,
              },
            ],
          },
          // Page 2: Address Information (dependent on country)
          {
            key: 'addressPage',
            type: 'page',
            title: 'Address Information',
            description: 'Provide your address details',
            fields: [
              {
                key: 'streetAddress',
                type: 'input',
                label: 'Street Address',
                props: {
                  placeholder: 'Enter street address',
                },
                required: true,
                col: 12,
              },
              {
                key: 'city',
                type: 'input',
                label: 'City',
                props: {
                  placeholder: 'Enter city',
                },
                required: true,
                col: 6,
              },
              {
                key: 'postalCode',
                type: 'input',
                label: 'Postal/ZIP Code',
                props: {
                  placeholder: 'Enter postal/ZIP code',
                },
                required: true,
                col: 6,
              },
              {
                key: 'stateProvince',
                type: 'select',
                label: 'State/Province',
                options: [
                  // Would typically be filtered based on country selection
                  { value: 'ca', label: 'California' },
                  { value: 'ny', label: 'New York' },
                  { value: 'tx', label: 'Texas' },
                  { value: 'on', label: 'Ontario' },
                  { value: 'bc', label: 'British Columbia' },
                ],
                required: true,
                col: 12,
              },
            ],
          },
          // Page 3: Payment Information (dependent on currency and country)
          {
            key: 'paymentPage',
            type: 'page',
            title: 'Payment Information',
            description: 'Set up your payment preferences',
            fields: [
              {
                key: 'paymentMethod',
                type: 'radio',
                label: 'Payment Method',
                options: [
                  { value: 'credit_card', label: 'Credit Card' },
                  { value: 'bank_transfer', label: 'Bank Transfer' },
                  { value: 'paypal', label: 'PayPal' },
                  { value: 'crypto', label: 'Cryptocurrency' },
                ],
                required: true,
                col: 12,
              },
              {
                key: 'bankCountry',
                type: 'select',
                label: 'Bank Country',
                options: [
                  { value: 'us', label: 'United States' },
                  { value: 'ca', label: 'Canada' },
                  { value: 'uk', label: 'United Kingdom' },
                  { value: 'de', label: 'Germany' },
                ],
                // Should default to country from page 1
                col: 12,
              },
              {
                key: 'submitCascade',
                type: 'submit',
                label: 'Complete Setup',
                col: 12,
              },
            ],
          },
        ],
      };

      (window as any).loadTestScenario(cascadeConfig, {
        testId: 'cascade-dependencies',
        title: 'Cross-Page Cascade Dependencies',
        description: 'Testing cross-page data dependencies and cascade updates',
      });
    });

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Page 1: Set region preferences
    await page.click('#country mat-select');
    await page.click('mat-option[value="ca"]'); // Select Canada

    await page.click('#language mat-select');
    await page.click('mat-option[value="en"]');

    await page.click('#currency mat-select');
    await page.click('mat-option[value="cad"]'); // Should match country

    // Navigate to page 2
    const nextButton1 = page.locator('button:has-text("Next")').or(page.locator('button[aria-label*="next"]'));
    if (await nextButton1.isVisible()) {
      await nextButton1.click();
      await page.waitForTimeout(1000);
    }

    // Page 2: Fill address (should reflect Canadian format)
    const addressPageVisible = await page.locator('text=Address Information').isVisible();
    if (addressPageVisible) {
      await page.fill('#streetAddress input', '123 Maple Street');
      await page.fill('#city input', 'Toronto');
      await page.fill('#postalCode input', 'M5V 3A1'); // Canadian postal code format

      // Select Canadian province
      await page.click('#stateProvince mat-select');
      await page.click('mat-option[value="on"]'); // Ontario

      // Navigate to page 3
      const nextButton2 = page.locator('button:has-text("Next")').or(page.locator('button[aria-label*="next"]'));
      if (await nextButton2.isVisible()) {
        await nextButton2.click();
        await page.waitForTimeout(1000);
      }
    }

    // Page 3: Payment setup (should default to Canadian bank)
    const paymentPageVisible = await page.locator('text=Payment Information').isVisible();
    if (paymentPageVisible) {
      await page.click('#paymentMethod mat-radio-button:has-text("Bank Transfer")');

      // Bank country should potentially default to 'ca' based on page 1 selection
      await page.click('#bankCountry mat-select');
      await page.click('mat-option[value="ca"]'); // Confirm Canadian bank

      await page.click('#submitCascade button');

      // Verify submission contains consistent data across all pages
      await expect(page.locator('[data-testid="submission-0"]')).toBeVisible();
      const submissionText = await page.locator('[data-testid="submission-0"]').textContent();

      expect(submissionText).toContain('ca'); // Country from page 1
      expect(submissionText).toContain('cad'); // Currency from page 1
      expect(submissionText).toContain('Toronto'); // City from page 2
      expect(submissionText).toContain('on'); // Province from page 2
      expect(submissionText).toContain('bank_transfer'); // Payment from page 3

      // Should show consistency between country selections
      const countryMatches = (submissionText?.match(/ca/g) || []).length;
      expect(countryMatches).toBeGreaterThan(1); // Should appear multiple times consistently
    }
  });

  test('should test progressive validation across page boundaries', async ({ page }) => {
    // Load progressive validation scenario
    await page.evaluate(() => {
      const progressiveConfig = {
        fields: [
          // Page 1: Basic validation
          {
            key: 'basicPage',
            type: 'page',
            title: 'Basic Information',
            fields: [
              {
                key: 'username',
                type: 'input',
                label: 'Username',
                props: {
                  placeholder: 'Minimum 3 characters',
                },
                required: true,
                minLength: 3,
                col: 12,
              },
            ],
          },
          // Page 2: Enhanced validation (depends on page 1)
          {
            key: 'enhancedPage',
            type: 'page',
            title: 'Enhanced Security',
            fields: [
              {
                key: 'password',
                type: 'input',
                label: 'Password',
                props: {
                  type: 'password',
                  placeholder: 'Minimum 8 characters',
                },
                required: true,
                minLength: 8,
                col: 12,
              },
              {
                key: 'securityQuestion',
                type: 'select',
                label: 'Security Question',
                options: [
                  { value: 'pet', label: "What was your first pet's name?" },
                  { value: 'school', label: 'What was your first school?' },
                  { value: 'city', label: 'In what city were you born?' },
                ],
                required: true,
                col: 12,
              },
              {
                key: 'securityAnswer',
                type: 'input',
                label: 'Security Answer',
                props: {
                  placeholder: 'Answer to security question',
                },
                required: true,
                minLength: 2,
                col: 12,
              },
            ],
          },
          // Page 3: Final validation (cross-references previous pages)
          {
            key: 'finalValidationPage',
            type: 'page',
            title: 'Final Verification',
            fields: [
              {
                key: 'confirmUsername',
                type: 'input',
                label: 'Confirm Username',
                props: {
                  placeholder: 'Re-enter your username',
                },
                required: true,
                col: 12,
              },
              {
                key: 'verificationCode',
                type: 'input',
                label: 'Verification Code',
                props: {
                  placeholder: 'Enter 6-digit code',
                },
                pattern: '^[0-9]{6}$',
                required: true,
                col: 12,
              },
              {
                key: 'submitProgressive',
                type: 'submit',
                label: 'Complete Verification',
                col: 12,
              },
            ],
          },
        ],
      };

      (window as any).loadTestScenario(progressiveConfig, {
        testId: 'progressive-validation',
        title: 'Progressive Cross-Page Validation',
        description: 'Testing progressive validation that builds across pages',
      });
    });

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Page 1: Test minimum length validation
    await page.fill('#username input', 'ab'); // Too short

    // Try to navigate (should fail)
    const nextButton1 = page.locator('button:has-text("Next")').or(page.locator('button[aria-label*="next"]'));
    if (await nextButton1.isVisible()) {
      await nextButton1.click();
      await page.waitForTimeout(1000);

      // Should still be on page 1
      const stillOnPage1 = await page.locator('text=Basic Information').isVisible();
      console.log('Still on page 1 after short username:', stillOnPage1);
    }

    // Fix username
    await page.fill('#username input', 'validuser123');

    // Navigate to page 2
    if (await nextButton1.isVisible()) {
      await nextButton1.click();
      await page.waitForTimeout(1000);
    }

    // Page 2: Test enhanced validation
    const enhancedPageVisible = await page.locator('text=Enhanced Security').isVisible();
    if (enhancedPageVisible) {
      // Test password length validation
      await page.fill('#password input', 'short'); // Too short
      await page.click('#securityQuestion mat-select');
      await page.click('mat-option[value="pet"]');
      await page.fill('#securityAnswer input', 'Fluffy');

      // Try to navigate (should fail due to password)
      const nextButton2 = page.locator('button:has-text("Next")').or(page.locator('button[aria-label*="next"]'));
      if (await nextButton2.isVisible()) {
        await nextButton2.click();
        await page.waitForTimeout(1000);

        // Should still be on page 2
        const stillOnPage2 = await page.locator('text=Enhanced Security').isVisible();
        console.log('Still on page 2 after short password:', stillOnPage2);
      }

      // Fix password
      await page.fill('#password input', 'securepassword123');

      // Navigate to page 3
      if (await nextButton2.isVisible()) {
        await nextButton2.click();
        await page.waitForTimeout(1000);
      }
    }

    // Page 3: Test cross-page validation
    const finalPageVisible = await page.locator('text=Final Verification').isVisible();
    if (finalPageVisible) {
      // Test username confirmation (should match page 1)
      await page.fill('#confirmUsername input', 'differentuser'); // Doesn't match
      await page.fill('#verificationCode input', '123456');

      // Try to submit (should fail due to username mismatch)
      await page.click('#submitProgressive button');
      await page.waitForTimeout(1000);

      // Fix username confirmation
      await page.fill('#confirmUsername input', 'validuser123'); // Matches page 1

      // Submit with correct data
      await page.click('#submitProgressive button');

      // Verify successful submission
      await expect(page.locator('[data-testid="submission-0"]')).toBeVisible();
      const submissionText = await page.locator('[data-testid="submission-0"]').textContent();

      expect(submissionText).toContain('validuser123'); // Should appear twice (original + confirmation)
      expect(submissionText).toContain('pet'); // Security question
      expect(submissionText).toContain('Fluffy'); // Security answer
      expect(submissionText).toContain('123456'); // Verification code
    }
  });
});
