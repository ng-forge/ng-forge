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
      await scenario.locator('#accountPurpose .form-check').first().waitFor({ state: 'visible' });

      // Select Business/Professional
      await scenario.locator('#accountPurpose .form-check:has-text("Business/Professional") input').click();

      // Select referral source
      await scenario.locator('#referralSource select').selectOption({ label: 'Search Engine' });

      // Navigate to Page 2
      await scenario.locator('#nextToPersonalInfoPage button').click();

      // Page 2: Personal Information
      await scenario.locator('#firstName input').fill('John');
      await scenario.locator('#lastName input').fill('Doe');
      await scenario.locator('#emailAddress input').fill('john.doe@business.com');
      await scenario.locator('#phoneNumber input').fill('+1-555-123-4567');

      // Fill date picker - Bootstrap uses native date input
      await scenario.locator('#birthDate input').fill('1985-03-15');

      // Navigate to Page 3
      await scenario.locator('#nextToAddressPage button').click();

      // Page 3: Address Information
      await scenario.locator('#streetAddress input').fill('123 Business Ave');
      await scenario.locator('#city input').fill('San Francisco');

      // Select state
      await scenario.locator('#state select').selectOption({ label: 'California' });

      await scenario.locator('#zipCode input').fill('94105');

      // Country should already be set to 'us', but verify
      await expect(scenario.locator('#country select')).toHaveValue('us');

      // Navigate to Page 4
      await scenario.locator('#nextToSecurityPage button').click();

      // Page 4: Security & Preferences
      await scenario.locator('#password input').fill('SecurePassword123!');
      await scenario.locator('#confirmPassword input').fill('SecurePassword123!');

      // Select security question
      await scenario.locator('#securityQuestion select').selectOption({ label: "What was your first pet's name?" });

      await scenario.locator('#securityAnswer input').fill('Buddy');

      // Check preferences - Bootstrap uses .form-check
      await scenario.locator('#twoFactorAuth .form-check input').click();
      await scenario.locator('#emailNotifications .form-check input').click();

      // Navigate to Page 5
      await scenario.locator('#nextToReviewPage button').click();

      // Page 5: Review & Submit
      await scenario.locator('#dataAccuracy .form-check input').click();
      await scenario.locator('#termsOfService .form-check input').click();
      await scenario.locator('#privacyPolicy .form-check input').click();

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
      await expect(scenario.locator('#itemQuantity1 input')).toHaveValue('1');
      await expect(scenario.locator('#itemQuantity2 input')).toHaveValue('2');

      // Modify laptop quantity
      await scenario.locator('#itemQuantity1 input').fill('2');

      // Add promo code
      await scenario.locator('#promoCode input').fill('SAVE10');

      // Add gift wrapping - Bootstrap checkbox
      await scenario.locator('#giftWrap .form-check input').click();

      // Navigate to Page 2
      await scenario.locator('#nextToShippingPage button').click();

      // Page 2: Shipping Information
      await scenario.locator('#shippingFirstName input').fill('Jane');
      await scenario.locator('#shippingLastName input').fill('Customer');
      await scenario.locator('#shippingAddress textarea').fill('456 Customer Lane\nApt 2B\nCustomer City, ST 12345');

      // Select express shipping - Bootstrap radio
      await scenario.locator('#shippingMethod .form-check:has-text("Express") input').click();

      await scenario.locator('#deliveryInstructions textarea').fill('Please leave at front door');

      // Navigate to Page 3
      await scenario.locator('#nextToBillingPage button').click();

      // Page 3: Billing & Payment
      // Fill billing name (different from shipping)
      await scenario.locator('#billingFirstName input').fill('Jane');
      await scenario.locator('#billingLastName input').fill('Billing');

      // Select payment method - Bootstrap radio
      await scenario.locator('#paymentMethod .form-check:has-text("Credit Card") input').click();

      // Fill payment details
      await scenario.locator('#cardNumber input').fill('4532 1234 5678 9012');
      await scenario.locator('#cvv input').fill('123');

      // Save payment method - Bootstrap checkbox
      await scenario.locator('#savePayment .form-check input').click();

      // Navigate to Page 4
      await scenario.locator('#nextToConfirmationPage button').click();

      // Page 4: Order Confirmation
      await scenario.locator('#orderNotes textarea').fill('This is a test order');

      // Email receipt should be checked by default, verify it
      await expect(scenario.locator('#emailReceipt .form-check input')).toBeChecked();

      // Enable SMS updates
      await scenario.locator('#smsUpdates .form-check input').click();

      // Agree to terms
      await scenario.locator('#termsCheckout .form-check input').click();

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
        itemQuantity1: 2,
        itemQuantity2: 2,
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
      await scenario.locator('#participantType .form-check').first().waitFor({ state: 'visible' });

      // Select participant type - Bootstrap radio
      await scenario.locator('#participantType .form-check:has-text("Regular Customer") input').click();

      // Select age group - Bootstrap select
      await scenario.locator('#ageGroup select').selectOption({ label: '25-34' });

      // Select region - Bootstrap select
      await scenario.locator('#region select').selectOption({ label: 'North America' });

      // Navigate to Page 2
      await scenario.locator('#nextToExperiencePage button').click();

      // Page 2: Product/Service Experience
      await scenario.locator('#overallSatisfaction .form-check:has-text("Very Satisfied") input').click();
      await scenario.locator('#productQuality .form-check:has-text("Excellent") input').click();
      await scenario.locator('#customerService .form-check:has-text("Good") input').click();

      // Select most important feature
      await scenario.locator('#mostImportantFeature select').selectOption({ label: 'High Quality' });

      // Navigate to Page 3
      await scenario.locator('#nextToFeedbackPage button').click();

      // Page 3: Feedback & Suggestions
      await scenario.locator('#improvements textarea').fill('Could improve delivery speed and add more payment options.');
      await scenario.locator('#favoriteAspect textarea').fill('Love the product quality and customer service responsiveness.');

      // Select NPS score - Bootstrap radio
      await scenario.locator('#recommendToFriend .form-check:has-text("9") input').first().click();

      // Select future interests (multi-checkbox) - Bootstrap checkboxes
      await scenario.locator('#futureInterest .form-check:has-text("Information about new products") input').click();
      await scenario.locator('#futureInterest .form-check:has-text("Special promotions and discounts") input').click();

      // Navigate to Page 4
      await scenario.locator('#nextToCompletionPage button').click();

      // Page 4: Contact & Completion
      await scenario.locator('#followUpContact .form-check input').click();
      await scenario.locator('#contactEmail input').fill('survey.participant@email.com');
      await scenario.locator('#additionalComments textarea').fill('Thank you for the opportunity to provide feedback!');
      await scenario.locator('#surveyConsent .form-check input').click();

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
