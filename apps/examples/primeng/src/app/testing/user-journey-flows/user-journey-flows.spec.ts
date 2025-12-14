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
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Page 1: Welcome & Account Type
      await page.waitForSelector('[data-testid="registration-journey"] #accountPurpose p-radiobutton', {
        state: 'visible',
        timeout: 10000,
      });

      // Select Business/Professional
      await helpers.selectRadio(scenario, 'accountPurpose', 'Business/Professional');

      // Select referral source
      await helpers.selectOption(scenario.locator('#referralSource p-select'), 'Search Engine');

      // Navigate to Page 2
      await page.waitForSelector('[data-testid="registration-journey"] #nextToPersonalInfoPage button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });
      await scenario.locator('#nextToPersonalInfoPage button').click();

      // Page 2: Personal Information
      await page.waitForSelector('[data-testid="registration-journey"] #firstName input', { state: 'visible', timeout: 10000 });
      const firstNameInput = scenario.locator('#firstName input');
      await firstNameInput.fill('John');
      await expect(firstNameInput).toHaveValue('John', { timeout: 5000 });
      await firstNameInput.blur();

      const lastNameInput = scenario.locator('#lastName input');
      await lastNameInput.fill('Doe');
      await expect(lastNameInput).toHaveValue('Doe', { timeout: 5000 });
      await lastNameInput.blur();

      const emailInput = scenario.locator('#emailAddress input');
      await emailInput.fill('john.doe@business.com');
      await expect(emailInput).toHaveValue('john.doe@business.com', { timeout: 5000 });
      await emailInput.blur();

      const phoneInput = scenario.locator('#phoneNumber input');
      await phoneInput.fill('+1-555-123-4567');
      await expect(phoneInput).toHaveValue('+1-555-123-4567', { timeout: 5000 });
      await phoneInput.blur();

      // Fill date picker - PrimeNG uses mm/dd/yyyy format
      await helpers.fillDatepicker(scenario, 'birthDate', '03/15/1985');

      // Navigate to Page 3
      await page.waitForSelector('[data-testid="registration-journey"] #nextToAddressPage button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });
      await scenario.locator('#nextToAddressPage button').click();

      // Page 3: Address Information
      await page.waitForSelector('[data-testid="registration-journey"] #streetAddress input', { state: 'visible', timeout: 10000 });
      const streetInput = scenario.locator('#streetAddress input');
      await streetInput.fill('123 Business Ave');
      await expect(streetInput).toHaveValue('123 Business Ave', { timeout: 5000 });
      await streetInput.blur();

      const cityInput = scenario.locator('#city input');
      await cityInput.fill('San Francisco');
      await expect(cityInput).toHaveValue('San Francisco', { timeout: 5000 });
      await cityInput.blur();

      // Select state
      await helpers.selectOption(scenario.locator('#state p-select'), 'California');

      const zipInput = scenario.locator('#zipCode input');
      await zipInput.fill('94105');
      await expect(zipInput).toHaveValue('94105', { timeout: 5000 });
      await zipInput.blur();

      // Country should already be set to 'us', but verify
      await expect(scenario.locator('#country p-select .p-select-label')).toHaveText('United States', { timeout: 10000 });

      // Navigate to Page 4
      await page.waitForSelector('[data-testid="registration-journey"] #nextToSecurityPage button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });
      await scenario.locator('#nextToSecurityPage button').click();

      // Page 4: Security & Preferences
      await page.waitForSelector('[data-testid="registration-journey"] #password input', { state: 'visible', timeout: 10000 });
      const passwordInput = scenario.locator('#password input');
      await passwordInput.fill('SecurePassword123!');
      await expect(passwordInput).toHaveValue('SecurePassword123!', { timeout: 5000 });
      await passwordInput.blur();

      const confirmPasswordInput = scenario.locator('#confirmPassword input');
      await confirmPasswordInput.fill('SecurePassword123!');
      await expect(confirmPasswordInput).toHaveValue('SecurePassword123!', { timeout: 5000 });
      await confirmPasswordInput.blur();

      // Select security question
      await helpers.selectOption(scenario.locator('#securityQuestion p-select'), "What was your first pet's name?");

      const securityAnswerInput = scenario.locator('#securityAnswer input');
      await securityAnswerInput.fill('Buddy');
      await expect(securityAnswerInput).toHaveValue('Buddy', { timeout: 5000 });
      await securityAnswerInput.blur();

      // Check preferences - PrimeNG checkboxes
      const twoFactorCheckbox = scenario.locator('#twoFactorAuth p-checkbox input');
      await twoFactorCheckbox.check();
      await expect(twoFactorCheckbox).toBeChecked({ timeout: 5000 });

      const emailNotificationsCheckbox = scenario.locator('#emailNotifications p-checkbox input');
      await emailNotificationsCheckbox.check();
      await expect(emailNotificationsCheckbox).toBeChecked({ timeout: 5000 });

      // Navigate to Page 5
      await page.waitForSelector('[data-testid="registration-journey"] #nextToReviewPage button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });
      await scenario.locator('#nextToReviewPage button').click();

      // Page 5: Review & Submit
      await page.waitForSelector('[data-testid="registration-journey"] #dataAccuracy p-checkbox input', {
        state: 'visible',
        timeout: 10000,
      });
      const dataAccuracyCheckbox = scenario.locator('#dataAccuracy p-checkbox input');
      await dataAccuracyCheckbox.check();
      await expect(dataAccuracyCheckbox).toBeChecked({ timeout: 5000 });

      const termsCheckbox = scenario.locator('#termsOfService p-checkbox input');
      await termsCheckbox.check();
      await expect(termsCheckbox).toBeChecked({ timeout: 5000 });

      const privacyCheckbox = scenario.locator('#privacyPolicy p-checkbox input');
      await privacyCheckbox.check();
      await expect(privacyCheckbox).toBeChecked({ timeout: 5000 });

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
      await page.waitForSelector('[data-testid="registration-journey"] #submitRegistration button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });
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
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Page 1: Cart Review
      await page.waitForSelector('[data-testid="checkout-journey"] #itemQuantity1 input', { state: 'visible', timeout: 10000 });

      // Verify default quantities
      await expect(scenario.locator('#itemQuantity1 input')).toHaveValue('1', { timeout: 10000 });
      await expect(scenario.locator('#itemQuantity2 input')).toHaveValue('2', { timeout: 10000 });

      // Modify laptop quantity
      const itemQuantity1Input = scenario.locator('#itemQuantity1 input');
      await itemQuantity1Input.fill('2');
      await expect(itemQuantity1Input).toHaveValue('2', { timeout: 5000 });
      await itemQuantity1Input.blur();

      // Add promo code
      const promoCodeInput = scenario.locator('#promoCode input');
      await promoCodeInput.fill('SAVE10');
      await expect(promoCodeInput).toHaveValue('SAVE10', { timeout: 5000 });
      await promoCodeInput.blur();

      // Add gift wrapping - PrimeNG checkbox
      const giftWrapCheckbox = scenario.locator('#giftWrap p-checkbox input');
      await giftWrapCheckbox.check();
      await expect(giftWrapCheckbox).toBeChecked({ timeout: 5000 });

      // Navigate to Page 2
      await page.waitForSelector('[data-testid="checkout-journey"] #nextToShippingPage button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });
      await scenario.locator('#nextToShippingPage button').click();

      // Page 2: Shipping Information
      await page.waitForSelector('[data-testid="checkout-journey"] #shippingFirstName input', { state: 'visible', timeout: 10000 });
      const shippingFirstNameInput = scenario.locator('#shippingFirstName input');
      await shippingFirstNameInput.fill('Jane');
      await expect(shippingFirstNameInput).toHaveValue('Jane', { timeout: 5000 });
      await shippingFirstNameInput.blur();

      const shippingLastNameInput = scenario.locator('#shippingLastName input');
      await shippingLastNameInput.fill('Customer');
      await expect(shippingLastNameInput).toHaveValue('Customer', { timeout: 5000 });
      await shippingLastNameInput.blur();

      const shippingAddressInput = scenario.locator('#shippingAddress textarea');
      await shippingAddressInput.fill('456 Customer Lane\nApt 2B\nCustomer City, ST 12345');
      await expect(shippingAddressInput).toHaveValue('456 Customer Lane\nApt 2B\nCustomer City, ST 12345', { timeout: 5000 });
      await shippingAddressInput.blur();

      // Select express shipping - PrimeNG radio
      await helpers.selectRadio(scenario, 'shippingMethod', 'Express (2-3 days) - $9.99');

      const deliveryInstructionsInput = scenario.locator('#deliveryInstructions textarea');
      await deliveryInstructionsInput.fill('Please leave at front door');
      await expect(deliveryInstructionsInput).toHaveValue('Please leave at front door', { timeout: 5000 });
      await deliveryInstructionsInput.blur();

      // Navigate to Page 3
      await page.waitForSelector('[data-testid="checkout-journey"] #nextToBillingPage button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });
      await scenario.locator('#nextToBillingPage button').click();

      // Page 3: Billing & Payment
      // Fill billing name (different from shipping)
      await page.waitForSelector('[data-testid="checkout-journey"] #billingFirstName input', { state: 'visible', timeout: 10000 });
      const billingFirstNameInput = scenario.locator('#billingFirstName input');
      await billingFirstNameInput.fill('Jane');
      await expect(billingFirstNameInput).toHaveValue('Jane', { timeout: 5000 });
      await billingFirstNameInput.blur();

      const billingLastNameInput = scenario.locator('#billingLastName input');
      await billingLastNameInput.fill('Billing');
      await expect(billingLastNameInput).toHaveValue('Billing', { timeout: 5000 });
      await billingLastNameInput.blur();

      // Select payment method - PrimeNG radio
      await helpers.selectRadio(scenario, 'paymentMethod', 'Credit Card');

      // Fill payment details
      const cardNumberInput = scenario.locator('#cardNumber input');
      await cardNumberInput.fill('4532 1234 5678 9012');
      await expect(cardNumberInput).toHaveValue('4532 1234 5678 9012', { timeout: 5000 });
      await cardNumberInput.blur();

      const cvvInput = scenario.locator('#cvv input');
      await cvvInput.fill('123');
      await expect(cvvInput).toHaveValue('123', { timeout: 5000 });
      await cvvInput.blur();

      // Save payment method - PrimeNG checkbox
      const savePaymentCheckbox = scenario.locator('#savePayment p-checkbox input');
      await savePaymentCheckbox.check();
      await expect(savePaymentCheckbox).toBeChecked({ timeout: 5000 });

      // Navigate to Page 4
      await page.waitForSelector('[data-testid="checkout-journey"] #nextToConfirmationPage button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });
      await scenario.locator('#nextToConfirmationPage button').click();

      // Page 4: Order Confirmation
      await page.waitForSelector('[data-testid="checkout-journey"] #orderNotes textarea', { state: 'visible', timeout: 10000 });
      const orderNotesInput = scenario.locator('#orderNotes textarea');
      await orderNotesInput.fill('This is a test order');
      await expect(orderNotesInput).toHaveValue('This is a test order', { timeout: 5000 });
      await orderNotesInput.blur();

      // Email receipt should be checked by default, verify it
      await expect(scenario.locator('#emailReceipt p-checkbox input')).toBeChecked({ timeout: 10000 });

      // Enable SMS updates
      const smsUpdatesCheckbox = scenario.locator('#smsUpdates p-checkbox input');
      await smsUpdatesCheckbox.check();
      await expect(smsUpdatesCheckbox).toBeChecked({ timeout: 5000 });

      // Agree to terms
      const termsCheckoutCheckbox = scenario.locator('#termsCheckout p-checkbox input');
      await termsCheckoutCheckbox.check();
      await expect(termsCheckoutCheckbox).toBeChecked({ timeout: 5000 });

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
      await page.waitForSelector('[data-testid="checkout-journey"] #placeOrder button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });
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
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Page 1: Introduction & Demographics
      await page.waitForSelector('[data-testid="survey-journey"] #participantType p-radiobutton', { state: 'visible', timeout: 10000 });

      // Select participant type - PrimeNG radio
      await helpers.selectRadio(scenario, 'participantType', 'Regular Customer (6+ months)');

      // Select age group - PrimeNG select
      await helpers.selectOption(scenario.locator('#ageGroup p-select'), '25-34');

      // Select region - PrimeNG select
      await helpers.selectOption(scenario.locator('#region p-select'), 'North America');

      // Navigate to Page 2
      await page.waitForSelector('[data-testid="survey-journey"] #nextToExperiencePage button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });
      await scenario.locator('#nextToExperiencePage button').click();

      // Page 2: Product/Service Experience
      await page.waitForSelector('[data-testid="survey-journey"] #overallSatisfaction p-radiobutton', { state: 'visible', timeout: 10000 });
      await helpers.selectRadio(scenario, 'overallSatisfaction', 'Very Satisfied');
      await helpers.selectRadio(scenario, 'productQuality', 'Excellent');
      await helpers.selectRadio(scenario, 'customerService', 'Good');

      // Select most important feature
      await helpers.selectOption(scenario.locator('#mostImportantFeature p-select'), 'High Quality');

      // Navigate to Page 3
      await page.waitForSelector('[data-testid="survey-journey"] #nextToFeedbackPage button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });
      await scenario.locator('#nextToFeedbackPage button').click();

      // Page 3: Feedback & Suggestions
      await page.waitForSelector('[data-testid="survey-journey"] #improvements textarea', { state: 'visible', timeout: 10000 });
      const improvementsInput = scenario.locator('#improvements textarea');
      await improvementsInput.fill('Could improve delivery speed and add more payment options.');
      await expect(improvementsInput).toHaveValue('Could improve delivery speed and add more payment options.', { timeout: 5000 });
      await improvementsInput.blur();

      const favoriteAspectInput = scenario.locator('#favoriteAspect textarea');
      await favoriteAspectInput.fill('Love the product quality and customer service responsiveness.');
      await expect(favoriteAspectInput).toHaveValue('Love the product quality and customer service responsiveness.', { timeout: 5000 });
      await favoriteAspectInput.blur();

      // Select NPS score - PrimeNG radio
      await helpers.selectRadio(scenario, 'recommendToFriend', '9');

      // Select future interests (multi-checkbox) - PrimeNG checkboxes
      const newProductsCheckbox = scenario.locator('#futureInterest input[type="checkbox"][value="new_products"]');
      await newProductsCheckbox.check();
      await expect(newProductsCheckbox).toBeChecked({ timeout: 5000 });

      const promotionsCheckbox = scenario.locator('#futureInterest input[type="checkbox"][value="promotions"]');
      await promotionsCheckbox.check();
      await expect(promotionsCheckbox).toBeChecked({ timeout: 5000 });

      // Navigate to Page 4
      await page.waitForSelector('[data-testid="survey-journey"] #nextToCompletionPage button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });
      await scenario.locator('#nextToCompletionPage button').click();

      // Page 4: Contact & Completion
      await page.waitForSelector('[data-testid="survey-journey"] #followUpContact p-checkbox input', { state: 'visible', timeout: 10000 });
      const followUpContactCheckbox = scenario.locator('#followUpContact p-checkbox input');
      await followUpContactCheckbox.check();
      await expect(followUpContactCheckbox).toBeChecked({ timeout: 5000 });

      const contactEmailInput = scenario.locator('#contactEmail input');
      await contactEmailInput.fill('survey.participant@email.com');
      await expect(contactEmailInput).toHaveValue('survey.participant@email.com', { timeout: 5000 });
      await contactEmailInput.blur();

      const additionalCommentsInput = scenario.locator('#additionalComments textarea');
      await additionalCommentsInput.fill('Thank you for the opportunity to provide feedback!');
      await expect(additionalCommentsInput).toHaveValue('Thank you for the opportunity to provide feedback!', { timeout: 5000 });
      await additionalCommentsInput.blur();

      const surveyConsentCheckbox = scenario.locator('#surveyConsent p-checkbox input');
      await surveyConsentCheckbox.check();
      await expect(surveyConsentCheckbox).toBeChecked({ timeout: 5000 });

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
      await page.waitForSelector('[data-testid="survey-journey"] #submitSurvey button:not([disabled])', {
        state: 'visible',
        timeout: 10000,
      });
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
