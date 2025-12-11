import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';
import { ionBlur } from '../shared/test-utils';

setupTestLogging();
setupConsoleCheck();

test.describe('User Journey Flow Tests', () => {
  test.describe('Registration Journey', () => {
    test.beforeEach(async ({ helpers }) => {
      await helpers.navigateToScenario('/testing/user-journey-flows/registration-journey');
    });

    test('should complete full user registration journey', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('registration-journey');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Page 1: Welcome & Account Type
      await page.waitForSelector('[data-testid="registration-journey"] #accountPurpose ion-radio', {
        state: 'visible',
        timeout: 10000,
      });

      // Select Business/Professional
      await helpers.selectRadio(scenario, 'accountPurpose', 'Business/Professional');

      // Select referral source
      await helpers.selectOption(scenario.locator('#referralSource ion-select'), 'Search Engine');

      // Navigate to Page 2
      await page.waitForSelector('[data-testid="registration-journey"] #nextToPersonalInfoPage ion-button:not([aria-disabled="true"])', {
        state: 'visible',
        timeout: 10000,
      });
      await scenario.locator('#nextToPersonalInfoPage ion-button').click();

      // Page 2: Personal Information
      await page.waitForSelector('[data-testid="registration-journey"] #firstName input', { state: 'visible', timeout: 10000 });
      const firstNameInput = scenario.locator('#firstName input');
      await firstNameInput.fill('John');
      await expect(firstNameInput).toHaveValue('John', { timeout: 5000 });
      await ionBlur(firstNameInput);

      const lastNameInput = scenario.locator('#lastName input');
      await lastNameInput.fill('Doe');
      await expect(lastNameInput).toHaveValue('Doe', { timeout: 5000 });
      await ionBlur(lastNameInput);

      const emailInput = scenario.locator('#emailAddress input');
      await emailInput.fill('john.doe@business.com');
      await expect(emailInput).toHaveValue('john.doe@business.com', { timeout: 5000 });
      await ionBlur(emailInput);

      const phoneInput = scenario.locator('#phoneNumber input');
      await phoneInput.fill('+1-555-123-4567');
      await expect(phoneInput).toHaveValue('+1-555-123-4567', { timeout: 5000 });
      await ionBlur(phoneInput);

      // Fill date picker - Ionic uses ion-datetime
      await helpers.fillDatepicker(scenario, 'birthDate', '03/15/1985');

      // Navigate to Page 3
      await page.waitForSelector('[data-testid="registration-journey"] #nextToAddressPage ion-button:not([aria-disabled="true"])', {
        state: 'visible',
        timeout: 10000,
      });
      await scenario.locator('#nextToAddressPage ion-button').click();

      // Page 3: Address Information
      await page.waitForSelector('[data-testid="registration-journey"] #streetAddress input', { state: 'visible', timeout: 10000 });
      const streetInput = scenario.locator('#streetAddress input');
      await streetInput.fill('123 Business Ave');
      await expect(streetInput).toHaveValue('123 Business Ave', { timeout: 5000 });
      await ionBlur(streetInput);

      const cityInput = scenario.locator('#city input');
      await cityInput.fill('San Francisco');
      await expect(cityInput).toHaveValue('San Francisco', { timeout: 5000 });
      await ionBlur(cityInput);

      // Select state
      await helpers.selectOption(scenario.locator('#state ion-select'), 'California');

      const zipInput = scenario.locator('#zipCode input');
      await zipInput.fill('94105');
      await expect(zipInput).toHaveValue('94105', { timeout: 5000 });
      await ionBlur(zipInput);

      // Country should already be set to 'us', but verify
      const countrySelect = scenario.locator('#country ion-select');
      await expect(countrySelect).toBeVisible({ timeout: 10000 });

      // Navigate to Page 4
      await page.waitForSelector('[data-testid="registration-journey"] #nextToSecurityPage ion-button:not([aria-disabled="true"])', {
        state: 'visible',
        timeout: 10000,
      });
      await scenario.locator('#nextToSecurityPage ion-button').click();

      // Page 4: Security & Preferences
      await page.waitForSelector('[data-testid="registration-journey"] #password input', { state: 'visible', timeout: 10000 });
      const passwordInput = scenario.locator('#password input');
      await passwordInput.fill('SecurePassword123!');
      await expect(passwordInput).toHaveValue('SecurePassword123!', { timeout: 5000 });
      await ionBlur(passwordInput);

      const confirmPasswordInput = scenario.locator('#confirmPassword input');
      await confirmPasswordInput.fill('SecurePassword123!');
      await expect(confirmPasswordInput).toHaveValue('SecurePassword123!', { timeout: 5000 });
      await ionBlur(confirmPasswordInput);

      // Select security question
      await helpers.selectOption(scenario.locator('#securityQuestion ion-select'), "What was your first pet's name?");

      const securityAnswerInput = scenario.locator('#securityAnswer input');
      await securityAnswerInput.fill('Buddy');
      await expect(securityAnswerInput).toHaveValue('Buddy', { timeout: 5000 });
      await ionBlur(securityAnswerInput);

      // Check preferences - Ionic checkboxes
      const twoFactorCheckbox = scenario.locator('#twoFactorAuth ion-checkbox');
      await helpers.checkIonCheckbox(twoFactorCheckbox);
      await expect(twoFactorCheckbox).toBeChecked({ timeout: 5000 });

      const emailNotificationsCheckbox = scenario.locator('#emailNotifications ion-checkbox');
      await helpers.checkIonCheckbox(emailNotificationsCheckbox);
      await expect(emailNotificationsCheckbox).toBeChecked({ timeout: 5000 });

      // Navigate to Page 5
      await page.waitForSelector('[data-testid="registration-journey"] #nextToReviewPage ion-button:not([aria-disabled="true"])', {
        state: 'visible',
        timeout: 10000,
      });
      await scenario.locator('#nextToReviewPage ion-button').click();

      // Page 5: Review & Submit
      await page.waitForSelector('[data-testid="registration-journey"] #dataAccuracy ion-checkbox', {
        state: 'visible',
        timeout: 10000,
      });
      const dataAccuracyCheckbox = scenario.locator('#dataAccuracy ion-checkbox');
      await helpers.checkIonCheckbox(dataAccuracyCheckbox);
      await expect(dataAccuracyCheckbox).toBeChecked({ timeout: 5000 });

      const termsCheckbox = scenario.locator('#termsOfService ion-checkbox');
      await helpers.checkIonCheckbox(termsCheckbox);
      await expect(termsCheckbox).toBeChecked({ timeout: 5000 });

      const privacyCheckbox = scenario.locator('#privacyPolicy ion-checkbox');
      await helpers.checkIonCheckbox(privacyCheckbox);
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
      await page.waitForSelector('[data-testid="registration-journey"] #submitRegistration ion-button:not([aria-disabled="true"])', {
        state: 'visible',
        timeout: 10000,
      });
      await scenario.locator('#submitRegistration ion-button').click();

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
      await helpers.navigateToScenario('/testing/user-journey-flows/checkout-journey');
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
      await ionBlur(itemQuantity1Input);

      // Add promo code
      const promoCodeInput = scenario.locator('#promoCode input');
      await promoCodeInput.fill('SAVE10');
      await expect(promoCodeInput).toHaveValue('SAVE10', { timeout: 5000 });
      await ionBlur(promoCodeInput);

      // Add gift wrapping - Ionic checkbox
      const giftWrapCheckbox = scenario.locator('#giftWrap ion-checkbox');
      await helpers.checkIonCheckbox(giftWrapCheckbox);
      await expect(giftWrapCheckbox).toBeChecked({ timeout: 5000 });

      // Navigate to Page 2
      await page.waitForSelector('[data-testid="checkout-journey"] #nextToShippingPage ion-button:not([aria-disabled="true"])', {
        state: 'visible',
        timeout: 10000,
      });
      await scenario.locator('#nextToShippingPage ion-button').click();

      // Page 2: Shipping Information
      await page.waitForSelector('[data-testid="checkout-journey"] #shippingFirstName input', { state: 'visible', timeout: 10000 });
      const shippingFirstNameInput = scenario.locator('#shippingFirstName input');
      await shippingFirstNameInput.fill('Jane');
      await expect(shippingFirstNameInput).toHaveValue('Jane', { timeout: 5000 });
      await ionBlur(shippingFirstNameInput);

      const shippingLastNameInput = scenario.locator('#shippingLastName input');
      await shippingLastNameInput.fill('Customer');
      await expect(shippingLastNameInput).toHaveValue('Customer', { timeout: 5000 });
      await ionBlur(shippingLastNameInput);

      const shippingAddressInput = scenario.locator('#shippingAddress textarea');
      await shippingAddressInput.fill('456 Customer Lane\nApt 2B\nCustomer City, ST 12345');
      await expect(shippingAddressInput).toHaveValue('456 Customer Lane\nApt 2B\nCustomer City, ST 12345', { timeout: 5000 });
      await ionBlur(shippingAddressInput);

      // Select express shipping - Ionic radio
      await helpers.selectRadio(scenario, 'shippingMethod', 'Express (2-3 days) - $9.99');

      const deliveryInstructionsInput = scenario.locator('#deliveryInstructions textarea');
      await deliveryInstructionsInput.fill('Please leave at front door');
      await expect(deliveryInstructionsInput).toHaveValue('Please leave at front door', { timeout: 5000 });
      await ionBlur(deliveryInstructionsInput);

      // Navigate to Page 3
      await page.waitForSelector('[data-testid="checkout-journey"] #nextToBillingPage ion-button:not([aria-disabled="true"])', {
        state: 'visible',
        timeout: 10000,
      });
      await scenario.locator('#nextToBillingPage ion-button').click();

      // Page 3: Billing & Payment
      // Fill billing name (different from shipping)
      await page.waitForSelector('[data-testid="checkout-journey"] #billingFirstName input', { state: 'visible', timeout: 10000 });
      const billingFirstNameInput = scenario.locator('#billingFirstName input');
      await billingFirstNameInput.fill('Jane');
      await expect(billingFirstNameInput).toHaveValue('Jane', { timeout: 5000 });
      await ionBlur(billingFirstNameInput);

      const billingLastNameInput = scenario.locator('#billingLastName input');
      await billingLastNameInput.fill('Billing');
      await expect(billingLastNameInput).toHaveValue('Billing', { timeout: 5000 });
      await ionBlur(billingLastNameInput);

      // Select payment method - Ionic radio
      await helpers.selectRadio(scenario, 'paymentMethod', 'Credit Card');

      // Fill payment details
      const cardNumberInput = scenario.locator('#cardNumber input');
      await cardNumberInput.fill('4532 1234 5678 9012');
      await expect(cardNumberInput).toHaveValue('4532 1234 5678 9012', { timeout: 5000 });
      await ionBlur(cardNumberInput);

      const cvvInput = scenario.locator('#cvv input');
      await cvvInput.fill('123');
      await expect(cvvInput).toHaveValue('123', { timeout: 5000 });
      await ionBlur(cvvInput);

      // Save payment method - Ionic checkbox
      const savePaymentCheckbox = scenario.locator('#savePayment ion-checkbox');
      await helpers.checkIonCheckbox(savePaymentCheckbox);
      await expect(savePaymentCheckbox).toBeChecked({ timeout: 5000 });

      // Navigate to Page 4
      await page.waitForSelector('[data-testid="checkout-journey"] #nextToConfirmationPage ion-button:not([aria-disabled="true"])', {
        state: 'visible',
        timeout: 10000,
      });
      await scenario.locator('#nextToConfirmationPage ion-button').click();

      // Page 4: Order Confirmation
      await page.waitForSelector('[data-testid="checkout-journey"] #orderNotes textarea', { state: 'visible', timeout: 10000 });
      const orderNotesInput = scenario.locator('#orderNotes textarea');
      await orderNotesInput.fill('This is a test order');
      await expect(orderNotesInput).toHaveValue('This is a test order', { timeout: 5000 });
      await ionBlur(orderNotesInput);

      // Email receipt should be checked by default, verify it
      await expect(scenario.locator('#emailReceipt ion-checkbox')).toBeChecked({ timeout: 10000 });

      // Enable SMS updates
      const smsUpdatesCheckbox = scenario.locator('#smsUpdates ion-checkbox');
      await helpers.checkIonCheckbox(smsUpdatesCheckbox);
      await expect(smsUpdatesCheckbox).toBeChecked({ timeout: 5000 });

      // Agree to terms
      const termsCheckoutCheckbox = scenario.locator('#termsCheckout ion-checkbox');
      await helpers.checkIonCheckbox(termsCheckoutCheckbox);
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
      await page.waitForSelector('[data-testid="checkout-journey"] #placeOrder ion-button:not([aria-disabled="true"])', {
        state: 'visible',
        timeout: 10000,
      });
      await scenario.locator('#placeOrder ion-button').click();

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
      await helpers.navigateToScenario('/testing/user-journey-flows/survey-journey');
    });

    test('should complete customer satisfaction survey journey', async ({ page, helpers }) => {
      const scenario = helpers.getScenario('survey-journey');
      await expect(scenario).toBeVisible({ timeout: 10000 });

      // Page 1: Introduction & Demographics
      await page.waitForSelector('[data-testid="survey-journey"] #participantType ion-radio', { state: 'visible', timeout: 10000 });

      // Select participant type - Ionic radio
      await helpers.selectRadio(scenario, 'participantType', 'Regular Customer (6+ months)');

      // Select age group - Ionic select
      await helpers.selectOption(scenario.locator('#ageGroup ion-select'), '25-34');

      // Select region - Ionic select
      await helpers.selectOption(scenario.locator('#region ion-select'), 'North America');

      // Navigate to Page 2
      await page.waitForSelector('[data-testid="survey-journey"] #nextToExperiencePage ion-button:not([aria-disabled="true"])', {
        state: 'visible',
        timeout: 10000,
      });
      await scenario.locator('#nextToExperiencePage ion-button').click();

      // Page 2: Product/Service Experience
      await page.waitForSelector('[data-testid="survey-journey"] #overallSatisfaction ion-radio', { state: 'visible', timeout: 10000 });
      await helpers.selectRadio(scenario, 'overallSatisfaction', 'Very Satisfied');
      await helpers.selectRadio(scenario, 'productQuality', 'Excellent');
      await helpers.selectRadio(scenario, 'customerService', 'Good');

      // Select most important feature
      await helpers.selectOption(scenario.locator('#mostImportantFeature ion-select'), 'High Quality');

      // Navigate to Page 3
      await page.waitForSelector('[data-testid="survey-journey"] #nextToFeedbackPage ion-button:not([aria-disabled="true"])', {
        state: 'visible',
        timeout: 10000,
      });
      await scenario.locator('#nextToFeedbackPage ion-button').click();

      // Page 3: Feedback & Suggestions
      await page.waitForSelector('[data-testid="survey-journey"] #improvements textarea', { state: 'visible', timeout: 10000 });
      const improvementsInput = scenario.locator('#improvements textarea');
      await improvementsInput.fill('Could improve delivery speed and add more payment options.');
      await expect(improvementsInput).toHaveValue('Could improve delivery speed and add more payment options.', { timeout: 5000 });
      await ionBlur(improvementsInput);

      const favoriteAspectInput = scenario.locator('#favoriteAspect textarea');
      await favoriteAspectInput.fill('Love the product quality and customer service responsiveness.');
      await expect(favoriteAspectInput).toHaveValue('Love the product quality and customer service responsiveness.', { timeout: 5000 });
      await ionBlur(favoriteAspectInput);

      // Select NPS score - Ionic radio
      await helpers.selectRadio(scenario, 'recommendToFriend', '9');

      // Select future interests (multi-checkbox) - Ionic checkboxes don't have value attr, select by label text
      const newProductsCheckbox = scenario.locator('#futureInterest').getByRole('checkbox', { name: 'Information about new products' });
      await helpers.checkIonCheckbox(newProductsCheckbox);
      await expect(newProductsCheckbox).toBeChecked({ timeout: 5000 });

      const promotionsCheckbox = scenario.locator('#futureInterest').getByRole('checkbox', { name: 'Special promotions and discounts' });
      await helpers.checkIonCheckbox(promotionsCheckbox);
      await expect(promotionsCheckbox).toBeChecked({ timeout: 5000 });

      // Navigate to Page 4
      await page.waitForSelector('[data-testid="survey-journey"] #nextToCompletionPage ion-button:not([aria-disabled="true"])', {
        state: 'visible',
        timeout: 10000,
      });
      await scenario.locator('#nextToCompletionPage ion-button').click();

      // Page 4: Contact & Completion
      await page.waitForSelector('[data-testid="survey-journey"] #followUpContact ion-checkbox', { state: 'visible', timeout: 10000 });
      const followUpContactCheckbox = scenario.locator('#followUpContact ion-checkbox');
      await helpers.checkIonCheckbox(followUpContactCheckbox);
      await expect(followUpContactCheckbox).toBeChecked({ timeout: 5000 });

      const contactEmailInput = scenario.locator('#contactEmail input');
      await contactEmailInput.fill('survey.participant@email.com');
      await expect(contactEmailInput).toHaveValue('survey.participant@email.com', { timeout: 5000 });
      await ionBlur(contactEmailInput);

      const additionalCommentsInput = scenario.locator('#additionalComments textarea');
      await additionalCommentsInput.fill('Thank you for the opportunity to provide feedback!');
      await expect(additionalCommentsInput).toHaveValue('Thank you for the opportunity to provide feedback!', { timeout: 5000 });
      await ionBlur(additionalCommentsInput);

      const surveyConsentCheckbox = scenario.locator('#surveyConsent ion-checkbox');
      await helpers.checkIonCheckbox(surveyConsentCheckbox);
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
      await page.waitForSelector('[data-testid="survey-journey"] #submitSurvey ion-button:not([aria-disabled="true"])', {
        state: 'visible',
        timeout: 10000,
      });
      await scenario.locator('#submitSurvey ion-button').click();

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
