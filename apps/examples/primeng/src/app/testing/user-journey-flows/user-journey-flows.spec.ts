import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';

setupTestLogging();
setupConsoleCheck();

test.describe('User Journey Flow Tests', () => {
  test.describe('Registration Journey', () => {
    test.beforeEach(async ({ helpers }) => {
      await helpers.navigateToScenario('/test/user-journey-flows/registration-journey');
    });

    test('should complete full user registration journey', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('registration-journey');
      await expect(scenario).toBeVisible();

      // Page 1: Welcome & Account Type
      await scenario.locator('#accountPurpose .p-radiobutton').first().waitFor({ state: 'visible' });

      // Select Business/Professional
      await scenario.locator('#accountPurpose .p-radiobutton-box').nth(1).click();

      // Select referral source
      await scenario.locator('#referralSource p-select').click();
      await page.locator('.p-select-option:has-text("Search Engine")').click();

      // Navigate to Page 2
      await scenario.locator('#nextToPersonalInfoPage button').click();
      await page.waitForTimeout(300);

      // Page 2: Personal Information
      await scenario.locator('#firstName input').fill('John');
      await scenario.locator('#lastName input').fill('Doe');
      await scenario.locator('#emailAddress input').fill('john.doe@business.com');
      await scenario.locator('#phoneNumber input').fill('+1-555-123-4567');

      // Fill date picker
      await scenario.locator('#birthDate button.p-datepicker-trigger').click();
      await page.waitForTimeout(300);

      await page.locator('.p-datepicker-select-month').selectOption('2');
      await page.locator('.p-datepicker-select-year').selectOption('1985');
      await page.locator('td[data-p-date="15"]').click();

      // Navigate to Page 3
      await scenario.locator('#nextToAddressPage button').click();
      await page.waitForTimeout(300);

      // Page 3: Address Information
      await scenario.locator('#streetAddress input').fill('123 Business Ave');
      await scenario.locator('#city input').fill('San Francisco');

      // Select state
      await scenario.locator('#state p-select').click();
      await page.locator('.p-select-option:has-text("California")').click();

      await scenario.locator('#zipCode input').fill('94105');

      // Country should already be set to 'us', but verify
      await expect(scenario.locator('#country p-select')).toContainText('United States');

      // Navigate to Page 4
      await scenario.locator('#nextToSecurityPage button').click();
      await page.waitForTimeout(300);

      // Page 4: Security & Preferences
      await scenario.locator('#password input').fill('SecurePassword123!');
      await scenario.locator('#confirmPassword input').fill('SecurePassword123!');

      // Select security question
      await scenario.locator('#securityQuestion p-select').click();
      await page.locator('.p-select-option:has-text("What was your first pet\'s name?")').click();

      await scenario.locator('#securityAnswer input').fill('Buddy');

      // Check preferences
      await scenario.locator('#twoFactorAuth .p-checkbox-box').click();
      await scenario.locator('#emailNotifications .p-checkbox-box').click();

      // Navigate to Page 5
      await scenario.locator('#nextToReviewPage button').click();
      await page.waitForTimeout(300);

      // Page 5: Review & Submit
      await scenario.locator('#dataAccuracy .p-checkbox-box').click();
      await scenario.locator('#termsOfService .p-checkbox-box').click();
      await scenario.locator('#privacyPolicy .p-checkbox-box').click();

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

      // Submit registration
      await scenario.locator('#submitRegistration button').click();

      // Wait for formSubmitted event
      const submittedData = await submittedDataPromise;

      // Verify submitted data contains values from all pages
      expect(submittedData).toMatchObject({
        accountPurpose: 'business',
        referralSource: 'search',
        firstName: 'John',
        lastName: 'Doe',
        emailAddress: 'john.doe@business.com',
        phoneNumber: '+1-555-123-4567',
        streetAddress: '123 Business Ave',
        city: 'San Francisco',
        state: 'ca',
        zipCode: '94105',
        country: 'us',
        securityQuestion: 'pet',
        securityAnswer: 'Buddy',
        twoFactorAuth: true,
        emailNotifications: true,
        dataAccuracy: true,
        termsOfService: true,
        privacyPolicy: true,
      });
    });
  });

  test.describe('Checkout Journey', () => {
    test.beforeEach(async ({ helpers }) => {
      await helpers.navigateToScenario('/test/user-journey-flows/checkout-journey');
    });

    test('should complete e-commerce checkout journey', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('checkout-journey');
      await expect(scenario).toBeVisible();

      // Page 1: Cart Review
      await scenario.locator('#itemQuantity1 input').waitFor({ state: 'visible' });

      // Verify default quantities
      expect(await scenario.locator('#itemQuantity1 input').inputValue()).toBe('1');
      expect(await scenario.locator('#itemQuantity2 input').inputValue()).toBe('2');

      // Modify laptop quantity
      await scenario.locator('#itemQuantity1 input').fill('2');

      // Add promo code
      await scenario.locator('#promoCode input').fill('SAVE10');

      // Add gift wrapping
      await scenario.locator('#giftWrap .p-checkbox-box').click();

      // Navigate to Page 2
      await scenario.locator('#nextToShippingPage button').click();
      await page.waitForTimeout(300);

      // Page 2: Shipping Information
      await scenario.locator('#shippingFirstName input').fill('Jane');
      await scenario.locator('#shippingLastName input').fill('Customer');
      await scenario.locator('#shippingAddress textarea').fill('456 Customer Lane\nApt 2B\nCustomer City, ST 12345');

      // Select express shipping
      await scenario.locator('#shippingMethod .p-radiobutton-box').nth(1).click();

      await scenario.locator('#deliveryInstructions textarea').fill('Please leave at front door');

      // Navigate to Page 3
      await scenario.locator('#nextToBillingPage button').click();
      await page.waitForTimeout(300);

      // Page 3: Billing & Payment
      // Fill billing name (different from shipping)
      await scenario.locator('#billingFirstName input').fill('Jane');
      await scenario.locator('#billingLastName input').fill('Billing');

      // Select payment method
      await scenario.locator('#paymentMethod .p-radiobutton-box').first().click();

      // Fill payment details
      await scenario.locator('#cardNumber input').fill('4532 1234 5678 9012');
      await scenario.locator('#cvv input').fill('123');

      // Save payment method
      await scenario.locator('#savePayment .p-checkbox-box').click();

      // Navigate to Page 4
      await scenario.locator('#nextToConfirmationPage button').click();
      await page.waitForTimeout(300);

      // Page 4: Order Confirmation
      await scenario.locator('#orderNotes textarea').fill('This is a test order');

      // Email receipt should be checked by default, verify it
      await expect(scenario.locator('#emailReceipt .p-checkbox-box')).toHaveClass(/p-checked/);

      // Enable SMS updates
      await scenario.locator('#smsUpdates .p-checkbox-box').click();

      // Agree to terms
      await scenario.locator('#termsCheckout .p-checkbox-box').click();

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

      // Place order
      await scenario.locator('#placeOrder button').click();

      // Wait for formSubmitted event
      const submittedData = await submittedDataPromise;

      // Verify submitted data contains values from all pages
      expect(submittedData).toMatchObject({
        itemQuantity1: '2',
        itemQuantity2: '2',
        promoCode: 'SAVE10',
        giftWrap: true,
        shippingFirstName: 'Jane',
        shippingLastName: 'Customer',
        shippingMethod: 'express',
        deliveryInstructions: 'Please leave at front door',
        billingFirstName: 'Jane',
        billingLastName: 'Billing',
        paymentMethod: 'credit',
        savePayment: true,
        orderNotes: 'This is a test order',
        emailReceipt: true,
        smsUpdates: true,
        termsCheckout: true,
      });

      // Verify card number is included
      expect(submittedData).toHaveProperty('cardNumber');
      expect((submittedData as any).cardNumber).toContain('4532');
    });
  });

  test.describe('Survey Journey', () => {
    test.beforeEach(async ({ helpers }) => {
      await helpers.navigateToScenario('/test/user-journey-flows/survey-journey');
    });

    test('should complete customer satisfaction survey journey', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('survey-journey');
      await expect(scenario).toBeVisible();

      // Page 1: Introduction & Demographics
      await scenario.locator('#participantType .p-radiobutton').first().waitFor({ state: 'visible' });

      // Select participant type (Regular Customer - second option)
      await scenario.locator('#participantType .p-radiobutton-box').nth(1).click();

      // Select age group
      await scenario.locator('#ageGroup p-select').click();
      await page.locator('.p-select-option:has-text("25-34")').click();

      // Select region
      await scenario.locator('#region p-select').click();
      await page.locator('.p-select-option:has-text("North America")').click();

      // Navigate to Page 2
      await scenario.locator('#nextToExperiencePage button').click();
      await page.waitForTimeout(300);

      // Page 2: Product/Service Experience
      await scenario.locator('#overallSatisfaction .p-radiobutton-box').nth(1).click(); // Very Satisfied
      await scenario.locator('#productQuality .p-radiobutton-box').last().click(); // Excellent
      await scenario.locator('#customerService .p-radiobutton-box').nth(3).click(); // Good

      // Select most important feature
      await scenario.locator('#mostImportantFeature p-select').click();
      await page.locator('.p-select-option:has-text("High Quality")').click();

      // Navigate to Page 3
      await scenario.locator('#nextToFeedbackPage button').click();
      await page.waitForTimeout(300);

      // Page 3: Feedback & Suggestions
      await scenario.locator('#improvements textarea').fill('Could improve delivery speed and add more payment options.');
      await scenario.locator('#favoriteAspect textarea').fill('Love the product quality and customer service responsiveness.');

      // Select NPS score (9)
      await scenario.locator('#recommendToFriend .p-radiobutton-box').nth(8).click();

      // Select future interests (multi-checkbox)
      await scenario.locator('#futureInterest .p-checkbox-box').nth(0).click(); // Information about new products
      await scenario.locator('#futureInterest .p-checkbox-box').nth(1).click(); // Special promotions and discounts

      // Navigate to Page 4
      await scenario.locator('#nextToCompletionPage button').click();
      await page.waitForTimeout(300);

      // Page 4: Contact & Completion
      await scenario.locator('#followUpContact .p-checkbox-box').click();
      await scenario.locator('#contactEmail input').fill('survey.participant@email.com');
      await scenario.locator('#additionalComments textarea').fill('Thank you for the opportunity to provide feedback!');
      await scenario.locator('#surveyConsent .p-checkbox-box').click();

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

      // Submit survey
      await scenario.locator('#submitSurvey button').click();

      // Wait for formSubmitted event
      const submittedData = await submittedDataPromise;

      // Verify submitted data contains values from all pages
      expect(submittedData).toMatchObject({
        participantType: 'regular_customer',
        ageGroup: '25-34',
        region: 'north',
        overallSatisfaction: 'very_satisfied',
        productQuality: '5',
        customerService: '4',
        mostImportantFeature: 'quality',
        improvements: 'Could improve delivery speed and add more payment options.',
        favoriteAspect: 'Love the product quality and customer service responsiveness.',
        recommendToFriend: '9',
        followUpContact: true,
        contactEmail: 'survey.participant@email.com',
        additionalComments: 'Thank you for the opportunity to provide feedback!',
        surveyConsent: true,
      });

      // Verify future interests array
      expect(submittedData).toHaveProperty('futureInterest');
      expect((submittedData as any).futureInterest).toContain('new_products');
      expect((submittedData as any).futureInterest).toContain('promotions');
    });
  });
});
