/* eslint-disable @typescript-eslint/no-explicit-any */
import { DeterministicWaitHelpers } from './utils/deterministic-wait-helpers';
import { E2EScenarioLoader } from './utils/e2e-form-helpers';
import { expect, test } from '@playwright/test';

test.describe('User Journey Flow Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200/e2e-test');
  });

  test('should complete full user registration journey', async ({ page }) => {
    // Load complete registration journey (5 pages)
    const loader = new E2EScenarioLoader(page);
    const registrationJourneyConfig = {
      fields: [
        // Page 1: Welcome & Account Type
        {
          key: 'welcomePage',
          type: 'page',
          title: 'Welcome to Our Platform',
          description: "Let's get you started with creating your account",
          fields: [
            {
              key: 'accountPurpose',
              type: 'radio',
              label: 'What will you use this account for?',
              options: [
                { value: 'personal', label: 'Personal Use' },
                { value: 'business', label: 'Business/Professional' },
                { value: 'education', label: 'Educational Purposes' },
                { value: 'nonprofit', label: 'Non-Profit Organization' },
              ],
              required: true,
              col: 12,
            },
            {
              key: 'referralSource',
              type: 'select',
              label: 'How did you hear about us?',
              options: [
                { value: 'search', label: 'Search Engine' },
                { value: 'social', label: 'Social Media' },
                { value: 'friend', label: 'Friend/Colleague' },
                { value: 'advertisement', label: 'Advertisement' },
                { value: 'other', label: 'Other' },
              ],
              col: 12,
            },
          ],
        },
        // Page 2: Personal Information
        {
          key: 'personalInfoPage',
          type: 'page',
          title: 'Personal Information',
          description: 'Please provide your personal details',
          fields: [
            {
              key: 'firstName',
              type: 'input',
              label: 'First Name',
              props: {
                placeholder: 'Enter your first name',
              },
              required: true,
              col: 6,
            },
            {
              key: 'lastName',
              type: 'input',
              label: 'Last Name',
              props: {
                placeholder: 'Enter your last name',
              },
              required: true,
              col: 6,
            },
            {
              key: 'emailAddress',
              type: 'input',
              label: 'Email Address',
              props: {
                type: 'email',
                placeholder: 'Enter your email',
              },
              email: true,
              required: true,
              col: 12,
            },
            {
              key: 'phoneNumber',
              type: 'input',
              label: 'Phone Number',
              props: {
                type: 'tel',
                placeholder: 'Enter your phone number',
              },
              pattern: '^[+]?[0-9\\s\\-\\(\\)]+$',
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
              col: 6,
            },
          ],
        },
        // Page 3: Address Information
        {
          key: 'addressPage',
          type: 'page',
          title: 'Address Information',
          description: 'Where can we reach you?',
          fields: [
            {
              key: 'streetAddress',
              type: 'input',
              label: 'Street Address',
              props: {
                placeholder: 'Enter your street address',
              },
              required: true,
              col: 12,
            },
            {
              key: 'city',
              type: 'input',
              label: 'City',
              props: {
                placeholder: 'Enter your city',
              },
              required: true,
              col: 6,
            },
            {
              key: 'state',
              type: 'select',
              label: 'State/Province',
              options: [
                { value: 'ca', label: 'California' },
                { value: 'ny', label: 'New York' },
                { value: 'tx', label: 'Texas' },
                { value: 'fl', label: 'Florida' },
                { value: 'wa', label: 'Washington' },
                { value: 'other', label: 'Other' },
              ],
              required: true,
              col: 6,
            },
            {
              key: 'zipCode',
              type: 'input',
              label: 'ZIP/Postal Code',
              props: {
                placeholder: 'Enter ZIP or postal code',
              },
              pattern: '^[0-9]{5}(-[0-9]{4})?$|^[A-Z][0-9][A-Z]\\s?[0-9][A-Z][0-9]$',
              required: true,
              col: 6,
            },
            {
              key: 'country',
              type: 'select',
              label: 'Country',
              options: [
                { value: 'us', label: 'United States' },
                { value: 'ca', label: 'Canada' },
                { value: 'uk', label: 'United Kingdom' },
                { value: 'other', label: 'Other' },
              ],
              value: 'us',
              col: 6,
            },
          ],
        },
        // Page 4: Security & Preferences
        {
          key: 'securityPage',
          type: 'page',
          title: 'Security & Preferences',
          description: 'Secure your account and set preferences',
          fields: [
            {
              key: 'password',
              type: 'input',
              label: 'Password',
              props: {
                type: 'password',
                placeholder: 'Create a strong password',
              },
              required: true,
              minLength: 8,
              col: 6,
            },
            {
              key: 'confirmPassword',
              type: 'input',
              label: 'Confirm Password',
              props: {
                type: 'password',
                placeholder: 'Confirm your password',
              },
              required: true,
              col: 6,
            },
            {
              key: 'securityQuestion',
              type: 'select',
              label: 'Security Question',
              options: [
                { value: 'pet', label: "What was your first pet's name?" },
                { value: 'school', label: 'What was your elementary school?' },
                { value: 'city', label: 'In what city were you born?' },
                { value: 'mother', label: "What is your mother's maiden name?" },
              ],
              required: true,
              col: 12,
            },
            {
              key: 'securityAnswer',
              type: 'input',
              label: 'Security Answer',
              props: {
                placeholder: 'Answer to your security question',
              },
              required: true,
              col: 12,
            },
            {
              key: 'twoFactorAuth',
              type: 'checkbox',
              label: 'Enable two-factor authentication (recommended)',
              col: 12,
            },
            {
              key: 'emailNotifications',
              type: 'checkbox',
              label: 'Receive email notifications',
              col: 6,
            },
            {
              key: 'marketingEmails',
              type: 'checkbox',
              label: 'Receive marketing emails',
              col: 6,
            },
          ],
        },
        // Page 5: Review & Submit
        {
          key: 'reviewPage',
          type: 'page',
          title: 'Review & Submit',
          description: 'Please review your information and complete registration',
          fields: [
            {
              key: 'dataAccuracy',
              type: 'checkbox',
              label: 'I confirm that all the information provided is accurate',
              required: true,
              col: 12,
            },
            {
              key: 'termsOfService',
              type: 'checkbox',
              label: 'I agree to the Terms of Service',
              required: true,
              col: 6,
            },
            {
              key: 'privacyPolicy',
              type: 'checkbox',
              label: 'I agree to the Privacy Policy',
              required: true,
              col: 6,
            },
            {
              key: 'submitRegistration',
              type: 'submit',
              label: 'Complete Registration',
              col: 12,
            },
          ],
        },
      ],
    };

    await loader.loadScenario(registrationJourneyConfig, {
      testId: 'registration-journey',
      title: 'Complete User Registration Journey',
      description: 'Full registration flow from welcome to completion',
    });

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Page 1: Welcome & Account Type
    // Verify page loaded by checking for first field
    await page.waitForSelector('#accountPurpose mat-radio-button', { state: 'visible', timeout: 10000 });
    await expect(page.locator('#accountPurpose mat-radio-button').first()).toBeVisible();
    await page.click('#accountPurpose mat-radio-button:has-text("Business/Professional")');
    await page.click('#referralSource mat-select');
    await page.click('mat-option:has-text("Search Engine")');

    // Navigate to page 2
    const nextButton = page.locator('button:has-text("Next")').or(page.locator('button[aria-label*="next"]'));
    if (await nextButton.isVisible()) {
      await nextButton.click();
      const waitHelpers = new DeterministicWaitHelpers(page);
      await waitHelpers.waitForPageTransition();
    }

    // Page 2: Personal Information
    const personalInfoVisible = await page.locator('#firstName input').isVisible();
    if (personalInfoVisible) {
      await page.fill('#firstName input', 'John');
      await page.fill('#lastName input', 'Doe');
      await page.fill('#emailAddress input', 'john.doe@business.com');
      await page.fill('#phoneNumber input', '+1-555-123-4567');
      await page.fill('#birthDate input', '1985-03-15');

      // Navigate to page 3
      if (await nextButton.isVisible()) {
        await nextButton.click();
        const waitHelpers = new DeterministicWaitHelpers(page);
        await waitHelpers.waitForPageTransition();
      }
    }

    // Page 3: Address Information
    const addressVisible = await page.locator('#streetAddress input').isVisible();
    if (addressVisible) {
      await page.fill('#streetAddress input', '123 Business Ave');
      await page.fill('#city input', 'San Francisco');
      await page.click('#state mat-select');
      await page.click('mat-option:has-text("California")');
      await page.fill('#zipCode input', '94105');
      await page.click('#country mat-select');
      await page.click('mat-option:has-text("United States")');

      // Navigate to page 4
      if (await nextButton.isVisible()) {
        await nextButton.click();
        const waitHelpers = new DeterministicWaitHelpers(page);
        await waitHelpers.waitForPageTransition();
      }
    }

    // Page 4: Security & Preferences
    const securityVisible = await page.locator('#password input').isVisible();
    if (securityVisible) {
      await page.fill('#password input', 'SecurePassword123!');
      await page.fill('#confirmPassword input', 'SecurePassword123!');
      await page.click('#securityQuestion mat-select');
      await page.click('mat-option:has-text("What was your first pet\'s name?")');
      await page.fill('#securityAnswer input', 'Buddy');
      await page.click('#twoFactorAuth mat-checkbox');
      await page.click('#emailNotifications mat-checkbox');

      // Navigate to page 5
      if (await nextButton.isVisible()) {
        await nextButton.click();
        const waitHelpers = new DeterministicWaitHelpers(page);
        await waitHelpers.waitForPageTransition();
      }
    }

    // Page 5: Review & Submit
    const reviewVisible = await page.locator('#dataAccuracy mat-checkbox').isVisible();
    if (reviewVisible) {
      await page.click('#dataAccuracy mat-checkbox');
      await page.click('#termsOfService mat-checkbox');
      await page.click('#privacyPolicy mat-checkbox');

      // Complete registration
      await page.click('#submitRegistration button');

      // Verify successful registration submission
      await expect(page.locator('[data-testid="submission-0"]')).toBeVisible();
      const submissionText = await page.locator('[data-testid="submission-0"]').textContent();

      // Verify data from all pages is included
      expect(submissionText).toContain('business'); // Page 1
      expect(submissionText).toContain('John'); // Page 2
      expect(submissionText).toContain('john.doe@business.com'); // Page 2
      expect(submissionText).toContain('123 Business Ave'); // Page 3
      expect(submissionText).toContain('San Francisco'); // Page 3
      expect(submissionText).toContain('ca'); // Page 3
      expect(submissionText).toContain('pet'); // Page 4
      expect(submissionText).toContain('Buddy'); // Page 4

      console.log('✅ Complete registration journey successful');
    }
  });

  test('should complete e-commerce checkout journey', async ({ page }) => {
    // Load e-commerce checkout journey (4 pages)
    const loader = new E2EScenarioLoader(page);
    const checkoutJourneyConfig = {
      fields: [
        // Page 1: Cart Review
        {
          key: 'cartPage',
          type: 'page',
          title: 'Review Your Cart',
          description: 'Review items and quantities before checkout',
          fields: [
            {
              key: 'itemQuantity1',
              type: 'input',
              label: 'Laptop Quantity',
              props: {
                type: 'number',
              },
              min: 0,
              max: 10,
              value: 1,
              required: true,
              col: 6,
            },
            {
              key: 'itemQuantity2',
              type: 'input',
              label: 'Mouse Quantity',
              props: {
                type: 'number',
              },
              min: 0,
              max: 10,
              value: 2,
              col: 6,
            },
            {
              key: 'promoCode',
              type: 'input',
              label: 'Promo Code (Optional)',
              props: {
                placeholder: 'Enter promo code',
              },
              col: 12,
            },
            {
              key: 'giftWrap',
              type: 'checkbox',
              label: 'Add gift wrapping (+$5.00)',
              col: 12,
            },
          ],
        },
        // Page 2: Shipping Information
        {
          key: 'shippingPage',
          type: 'page',
          title: 'Shipping Information',
          description: 'Where should we send your order?',
          fields: [
            {
              key: 'shippingFirstName',
              type: 'input',
              label: 'First Name',
              props: {
                placeholder: 'Shipping first name',
              },
              required: true,
              col: 6,
            },
            {
              key: 'shippingLastName',
              type: 'input',
              label: 'Last Name',
              props: {
                placeholder: 'Shipping last name',
              },
              required: true,
              col: 6,
            },
            {
              key: 'shippingAddress',
              type: 'textarea',
              label: 'Shipping Address',
              props: {
                placeholder: 'Enter complete shipping address',
                rows: 3,
              },
              required: true,
              col: 12,
            },
            {
              key: 'shippingMethod',
              type: 'radio',
              label: 'Shipping Method',
              options: [
                { value: 'standard', label: 'Standard (5-7 days) - FREE' },
                { value: 'express', label: 'Express (2-3 days) - $9.99' },
                { value: 'overnight', label: 'Overnight - $24.99' },
              ],
              required: true,
              value: 'standard',
              col: 12,
            },
            {
              key: 'deliveryInstructions',
              type: 'textarea',
              label: 'Delivery Instructions (Optional)',
              props: {
                placeholder: 'Special delivery instructions',
                rows: 2,
              },
              col: 12,
            },
          ],
        },
        // Page 3: Billing & Payment
        {
          key: 'billingPage',
          type: 'page',
          title: 'Billing & Payment',
          description: 'Payment information and billing address',
          fields: [
            {
              key: 'sameAsShipping',
              type: 'checkbox',
              label: 'Billing address same as shipping',
              col: 12,
            },
            {
              key: 'billingFirstName',
              type: 'input',
              label: 'Billing First Name',
              props: {
                placeholder: 'Billing first name',
              },
              // Would be conditionally required based on sameAsShipping
              col: 6,
            },
            {
              key: 'billingLastName',
              type: 'input',
              label: 'Billing Last Name',
              props: {
                placeholder: 'Billing last name',
              },
              col: 6,
            },
            {
              key: 'paymentMethod',
              type: 'radio',
              label: 'Payment Method',
              options: [
                { value: 'credit', label: 'Credit Card' },
                { value: 'debit', label: 'Debit Card' },
                { value: 'paypal', label: 'PayPal' },
                { value: 'applepay', label: 'Apple Pay' },
              ],
              required: true,
              col: 12,
            },
            {
              key: 'cardNumber',
              type: 'input',
              label: 'Card Number',
              props: {
                placeholder: '1234 5678 9012 3456',
              },
              pattern: '^[0-9\\s]{13,19}$',
              required: true,
              col: 8,
            },
            {
              key: 'cvv',
              type: 'input',
              label: 'CVV',
              props: {
                placeholder: '123',
                maxLength: '4',
              },
              pattern: '^[0-9]{3,4}$',
              required: true,
              col: 4,
            },
            {
              key: 'savePayment',
              type: 'checkbox',
              label: 'Save payment method for future purchases',
              col: 12,
            },
          ],
        },
        // Page 4: Order Confirmation
        {
          key: 'confirmationPage',
          type: 'page',
          title: 'Order Confirmation',
          description: 'Review your complete order before placing',
          fields: [
            {
              key: 'orderNotes',
              type: 'textarea',
              label: 'Order Notes (Optional)',
              props: {
                placeholder: 'Any special notes for this order',
                rows: 3,
              },
              col: 12,
            },
            {
              key: 'emailReceipt',
              type: 'checkbox',
              label: 'Email me order confirmation and tracking info',
              value: true,
              col: 12,
            },
            {
              key: 'smsUpdates',
              type: 'checkbox',
              label: 'Send SMS updates for delivery status',
              col: 12,
            },
            {
              key: 'termsCheckout',
              type: 'checkbox',
              label: 'I agree to the Terms of Sale and Return Policy',
              required: true,
              col: 12,
            },
            {
              key: 'placeOrder',
              type: 'submit',
              label: 'Place Order',
              col: 12,
            },
          ],
        },
      ],
    };

    await loader.loadScenario(checkoutJourneyConfig, {
      testId: 'checkout-journey',
      title: 'E-commerce Checkout Journey',
      description: 'Complete checkout flow from cart to order placement',
    });

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Page 1: Cart Review
    await page.waitForSelector('#itemQuantity1 input', { state: 'visible', timeout: 10000 });
    await page.fill('#itemQuantity1 input', '2'); // Change laptop quantity
    await page.fill('#promoCode input', 'SAVE10');
    await page.click('#giftWrap mat-checkbox');

    // Navigate to shipping
    const nextButton = page.locator('button:has-text("Next")').or(page.locator('button[aria-label*="next"]'));
    if (await nextButton.isVisible()) {
      await nextButton.click();
      const waitHelpers = new DeterministicWaitHelpers(page);
      await waitHelpers.waitForPageTransition();
    }

    // Page 2: Shipping Information
    const shippingVisible = await page.locator('#shippingFirstName input').isVisible();
    if (shippingVisible) {
      await page.fill('#shippingFirstName input', 'Jane');
      await page.fill('#shippingLastName input', 'Customer');
      await page.fill('#shippingAddress textarea', '456 Customer Lane\\nApt 2B\\nCustomer City, ST 12345');
      await page.click('#shippingMethod mat-radio-button:has-text("Express")');
      await page.fill('#deliveryInstructions textarea', 'Please leave at front door');

      // Navigate to billing
      if (await nextButton.isVisible()) {
        await nextButton.click();
        const waitHelpers = new DeterministicWaitHelpers(page);
        await waitHelpers.waitForPageTransition();
      }
    }

    // Page 3: Billing & Payment
    const billingVisible = await page.locator('#sameAsShipping mat-checkbox').isVisible();
    if (billingVisible) {
      // Use different billing address
      await page.fill('#billingFirstName input', 'Jane');
      await page.fill('#billingLastName input', 'Billing');
      await page.click('#paymentMethod mat-radio-button:has-text("Credit Card")');
      await page.fill('#cardNumber input', '4532 1234 5678 9012');
      await page.fill('#cvv input', '123');
      await page.click('#savePayment mat-checkbox');

      // Navigate to confirmation
      if (await nextButton.isVisible()) {
        await nextButton.click();
        const waitHelpers = new DeterministicWaitHelpers(page);
        await waitHelpers.waitForPageTransition();
      }
    }

    // Page 4: Order Confirmation
    const confirmationVisible = await page.locator('#orderNotes textarea').isVisible();
    if (confirmationVisible) {
      await page.fill('#orderNotes textarea', 'This is a test order');
      await page.click('#emailReceipt mat-checkbox');
      await page.click('#smsUpdates mat-checkbox');
      await page.click('#termsCheckout mat-checkbox');

      // Place order
      await page.click('#placeOrder button');

      // Verify successful order placement
      await expect(page.locator('[data-testid="submission-0"]')).toBeVisible();
      const submissionText = await page.locator('[data-testid="submission-0"]').textContent();

      // Verify data from all pages
      expect(submissionText).toContain('SAVE10'); // Cart page
      expect(submissionText).toContain('Jane'); // Shipping page
      expect(submissionText).toContain('express'); // Shipping method
      expect(submissionText).toContain('4532'); // Payment page (partial card)
      expect(submissionText).toContain('test order'); // Order notes

      console.log('✅ Complete checkout journey successful');
    }
  });

  test('should complete survey/questionnaire journey with branching logic', async ({ page }) => {
    // Load survey journey with branching (4 pages)
    const loader = new E2EScenarioLoader(page);
    const surveyJourneyConfig = {
      fields: [
        // Page 1: Introduction & Demographics
        {
          key: 'introPage',
          type: 'page',
          title: 'Customer Satisfaction Survey',
          description: 'Help us improve by sharing your feedback',
          fields: [
            {
              key: 'participantType',
              type: 'radio',
              label: 'What best describes you?',
              options: [
                { value: 'new_customer', label: 'New Customer (< 6 months)' },
                { value: 'regular_customer', label: 'Regular Customer (6+ months)' },
                { value: 'business_customer', label: 'Business Customer' },
                { value: 'non_customer', label: 'Not Currently a Customer' },
              ],
              required: true,
              col: 12,
            },
            {
              key: 'ageGroup',
              type: 'select',
              label: 'Age Group',
              options: [
                { value: '18-24', label: '18-24' },
                { value: '25-34', label: '25-34' },
                { value: '35-44', label: '35-44' },
                { value: '45-54', label: '45-54' },
                { value: '55-64', label: '55-64' },
                { value: '65+', label: '65+' },
              ],
              required: true,
              col: 6,
            },
            {
              key: 'region',
              type: 'select',
              label: 'Region',
              options: [
                { value: 'north', label: 'North America' },
                { value: 'europe', label: 'Europe' },
                { value: 'asia', label: 'Asia Pacific' },
                { value: 'other', label: 'Other' },
              ],
              required: true,
              col: 6,
            },
          ],
        },
        // Page 2: Product/Service Experience (conditional)
        {
          key: 'experiencePage',
          type: 'page',
          title: 'Your Experience',
          description: 'Tell us about your experience with our products/services',
          fields: [
            {
              key: 'overallSatisfaction',
              type: 'radio',
              label: 'Overall Satisfaction',
              options: [
                { value: 'very_satisfied', label: 'Very Satisfied' },
                { value: 'satisfied', label: 'Satisfied' },
                { value: 'neutral', label: 'Neutral' },
                { value: 'dissatisfied', label: 'Dissatisfied' },
                { value: 'very_dissatisfied', label: 'Very Dissatisfied' },
              ],
              required: true,
              col: 12,
            },
            {
              key: 'productQuality',
              type: 'radio',
              label: 'Product Quality Rating',
              options: [
                { value: '5', label: 'Excellent' },
                { value: '4', label: 'Good' },
                { value: '3', label: 'Average' },
                { value: '2', label: 'Poor' },
                { value: '1', label: 'Very Poor' },
              ],
              required: true,
              col: 6,
            },
            {
              key: 'customerService',
              type: 'radio',
              label: 'Customer Service Rating',
              options: [
                { value: '5', label: 'Excellent' },
                { value: '4', label: 'Good' },
                { value: '3', label: 'Average' },
                { value: '2', label: 'Poor' },
                { value: '1', label: 'Very Poor' },
              ],
              required: true,
              col: 6,
            },
            {
              key: 'mostImportantFeature',
              type: 'select',
              label: 'Most Important Feature to You',
              options: [
                { value: 'price', label: 'Competitive Pricing' },
                { value: 'quality', label: 'High Quality' },
                { value: 'service', label: 'Customer Service' },
                { value: 'speed', label: 'Fast Delivery' },
                { value: 'variety', label: 'Product Variety' },
              ],
              col: 12,
            },
          ],
        },
        // Page 3: Feedback & Suggestions
        {
          key: 'feedbackPage',
          type: 'page',
          title: 'Feedback & Suggestions',
          description: 'Share your thoughts and suggestions',
          fields: [
            {
              key: 'improvements',
              type: 'textarea',
              label: 'What could we improve?',
              props: {
                placeholder: 'Share your suggestions for improvement...',
                rows: 4,
              },
              col: 12,
            },
            {
              key: 'favoriteAspect',
              type: 'textarea',
              label: 'What do you like most about us?',
              props: {
                placeholder: 'Tell us what you appreciate...',
                rows: 3,
              },
              col: 12,
            },
            {
              key: 'recommendToFriend',
              type: 'radio',
              label: 'How likely are you to recommend us to a friend?',
              options: [
                { value: '10', label: '10 - Extremely Likely' },
                { value: '9', label: '9' },
                { value: '8', label: '8' },
                { value: '7', label: '7' },
                { value: '6', label: '6' },
                { value: '5', label: '5 - Neutral' },
                { value: '4', label: '4' },
                { value: '3', label: '3' },
                { value: '2', label: '2' },
                { value: '1', label: '1' },
                { value: '0', label: '0 - Not at All Likely' },
              ],
              required: true,
              col: 12,
            },
            {
              key: 'futureInterest',
              type: 'checkbox',
              label: 'Future interests (select all that apply)',
              options: [
                { value: 'new_products', label: 'Information about new products' },
                { value: 'promotions', label: 'Special promotions and discounts' },
                { value: 'events', label: 'Company events and webinars' },
                { value: 'newsletter', label: 'Monthly newsletter' },
              ],
              col: 12,
            },
          ],
        },
        // Page 4: Contact & Completion
        {
          key: 'completionPage',
          type: 'page',
          title: 'Complete Survey',
          description: 'Final details and survey completion',
          fields: [
            {
              key: 'followUpContact',
              type: 'checkbox',
              label: "I'm willing to be contacted for follow-up questions",
              col: 12,
            },
            {
              key: 'contactEmail',
              type: 'input',
              label: 'Contact Email (if willing to be contacted)',
              props: {
                type: 'email',
                placeholder: 'your.email@example.com',
              },
              email: true,
              col: 12,
            },
            {
              key: 'additionalComments',
              type: 'textarea',
              label: 'Any additional comments?',
              props: {
                placeholder: "Anything else you'd like to share...",
                rows: 3,
              },
              col: 12,
            },
            {
              key: 'surveyConsent',
              type: 'checkbox',
              label: 'I consent to the use of this feedback for improvement purposes',
              required: true,
              col: 12,
            },
            {
              key: 'submitSurvey',
              type: 'submit',
              label: 'Submit Survey',
              col: 12,
            },
          ],
        },
      ],
    };

    await loader.loadScenario(surveyJourneyConfig, {
      testId: 'survey-journey',
      title: 'Customer Satisfaction Survey Journey',
      description: 'Complete survey flow with branching logic',
    });

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Page 1: Demographics
    // Verify page loaded by checking for first field
    await page.waitForSelector('#participantType mat-radio-button', { state: 'visible', timeout: 10000 });
    await expect(page.locator('#participantType mat-radio-button').first()).toBeVisible();
    await page.click('#participantType mat-radio-button:has-text("Regular Customer")');
    await page.click('#ageGroup mat-select');
    await page.click('mat-option:has-text("25-34")');
    await page.click('#region mat-select');
    await page.click('mat-option:has-text("North America")');

    // Navigate to experience page
    const nextButton = page.locator('button:has-text("Next")').or(page.locator('button[aria-label*="next"]'));
    if (await nextButton.isVisible()) {
      await nextButton.click();
      const waitHelpers = new DeterministicWaitHelpers(page);
      await waitHelpers.waitForPageTransition();
    }

    // Page 2: Experience (shown for customers)
    const experienceVisible = await page.locator('#overallSatisfaction mat-radio-button').first().isVisible();
    if (experienceVisible) {
      await page.click('#overallSatisfaction mat-radio-button:has-text("Very Satisfied")');
      await page.click('#productQuality mat-radio-button:has-text("Excellent")');
      await page.click('#customerService mat-radio-button:has-text("Good")');
      await page.click('#mostImportantFeature mat-select');
      await page.click('mat-option:has-text("High Quality")');

      // Navigate to feedback
      if (await nextButton.isVisible()) {
        await nextButton.click();
        const waitHelpers = new DeterministicWaitHelpers(page);
        await waitHelpers.waitForPageTransition();
      }
    }

    // Page 3: Feedback
    const feedbackVisible = await page.locator('#improvements textarea').isVisible();
    if (feedbackVisible) {
      await page.fill('#improvements textarea', 'Could improve delivery speed and add more payment options.');
      await page.fill('#favoriteAspect textarea', 'Love the product quality and customer service responsiveness.');
      await page.click('#recommendToFriend mat-radio-button:has-text("9")');

      // Select multiple interests
      await page.click('#futureInterest mat-checkbox:has-text("new products")');
      await page.click('#futureInterest mat-checkbox:has-text("promotions")');

      // Navigate to completion
      if (await nextButton.isVisible()) {
        await nextButton.click();
        const waitHelpers = new DeterministicWaitHelpers(page);
        await waitHelpers.waitForPageTransition();
      }
    }

    // Page 4: Completion
    const completionVisible = await page.locator('#followUpContact mat-checkbox').isVisible();
    if (completionVisible) {
      await page.click('#followUpContact mat-checkbox');
      await page.fill('#contactEmail input', 'survey.participant@email.com');
      await page.fill('#additionalComments textarea', 'Thank you for the opportunity to provide feedback!');
      await page.click('#surveyConsent mat-checkbox');

      // Submit survey
      await page.click('#submitSurvey button');

      // Verify successful survey submission
      await expect(page.locator('[data-testid="submission-0"]')).toBeVisible();
      const submissionText = await page.locator('[data-testid="submission-0"]').textContent();

      // Verify data from all pages
      expect(submissionText).toContain('regular_customer'); // Page 1
      expect(submissionText).toContain('25-34'); // Page 1
      expect(submissionText).toContain('very_satisfied'); // Page 2
      expect(submissionText).toContain('quality'); // Page 2
      expect(submissionText).toContain('delivery speed'); // Page 3
      expect(submissionText).toContain('9'); // NPS score
      expect(submissionText).toContain('survey.participant@email.com'); // Page 4

      console.log('✅ Complete survey journey successful');
    }
  });
});
