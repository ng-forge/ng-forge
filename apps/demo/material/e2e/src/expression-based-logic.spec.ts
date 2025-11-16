/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, test } from '@playwright/test';
import { E2EScenarioLoader } from './utils/e2e-form-helpers';

test.describe('Expression-Based Logic Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200/e2e-test');
    await page.waitForFunction(() => (window as any).loadTestScenario !== undefined);
  });

  test('should hide/show fields based on fieldValue condition', async ({ page }) => {
    const loader = new E2EScenarioLoader(page);

    const config = {
      fields: [
        {
          key: 'subscriptionType',
          type: 'select',
          label: 'Subscription Type',
          value: '',
          options: [
            { label: 'Free', value: 'free' },
            { label: 'Premium', value: 'premium' },
          ],
          col: 12,
        },
        {
          key: 'paymentMethod',
          type: 'input',
          label: 'Payment Method',
          value: '',
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'subscriptionType',
                operator: 'equals',
                value: 'free',
              },
            },
          ],
          col: 12,
        },
        {
          key: 'submit',
          type: 'button',
          label: 'Submit',
          props: {
            type: 'submit',
            color: 'primary',
          },
          col: 12,
        },
      ],
    };

    await loader.loadScenario(config, {
      testId: 'hidden-logic-test',
      title: 'Hidden Logic Test',
    });

    await page.waitForLoadState('networkidle');

    // Select free - payment should be hidden
    await page.click('#subscriptionType');
    await page.waitForTimeout(300);
    await page.click('mat-option:has-text("Free")');
    await page.waitForTimeout(500);

    const paymentField = page.locator('#paymentMethod');
    await expect(paymentField).toBeHidden();

    // Select premium - payment should be visible
    await page.click('#subscriptionType');
    await page.waitForTimeout(300);
    await page.click('mat-option:has-text("Premium")');
    await page.waitForTimeout(500);

    await expect(paymentField).toBeVisible();
  });

  test('should disable fields using JavaScript expressions', async ({ page }) => {
    const loader = new E2EScenarioLoader(page);

    const config = {
      fields: [
        {
          key: 'hasVehicle',
          type: 'checkbox',
          label: 'I own a vehicle',
          col: 12,
        },
        {
          key: 'vehicleType',
          type: 'input',
          label: 'Vehicle Type',
          logic: [
            {
              type: 'disabled',
              condition: {
                type: 'javascript',
                expression: '!formValue.hasVehicle',
              },
            },
          ],
          col: 12,
        },
        {
          key: 'submit',
          type: 'button',
          label: 'Submit',
          props: {
            type: 'submit',
            color: 'primary',
          },
          col: 12,
        },
      ],
    };

    await loader.loadScenario(config, {
      testId: 'disabled-logic-test',
      title: 'Disabled Logic Test',
    });

    await page.waitForLoadState('networkidle');

    // Initially unchecked - vehicle type should be disabled
    const vehicleInput = page.locator('#vehicleType input');
    const isDisabled = await vehicleInput.isDisabled();
    expect(isDisabled).toBeTruthy();

    // Check the checkbox - vehicle type should be enabled
    await page.check('#hasVehicle input[type="checkbox"]');
    await page.waitForTimeout(500);

    const isEnabled = await vehicleInput.isEnabled();
    expect(isEnabled).toBeTruthy();
  });

  test('should hide fields using AND conditional logic', async ({ page }) => {
    const loader = new E2EScenarioLoader(page);

    const config = {
      fields: [
        {
          key: 'hasDiscount',
          type: 'checkbox',
          label: 'I have a discount code',
          col: 6,
        },
        {
          key: 'isPremiumMember',
          type: 'checkbox',
          label: 'I am a premium member',
          col: 6,
        },
        {
          key: 'regularPrice',
          type: 'input',
          label: 'Regular Price Display',
          value: '$99.99',
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'and',
                conditions: [
                  {
                    type: 'fieldValue',
                    fieldPath: 'hasDiscount',
                    operator: 'equals',
                    value: true,
                  },
                  {
                    type: 'fieldValue',
                    fieldPath: 'isPremiumMember',
                    operator: 'equals',
                    value: true,
                  },
                ],
              },
            },
          ],
          col: 12,
        },
        {
          key: 'submit',
          type: 'button',
          label: 'Submit',
          props: {
            type: 'submit',
            color: 'primary',
          },
          col: 12,
        },
      ],
    };

    await loader.loadScenario(config, {
      testId: 'and-logic-test',
      title: 'AND Conditional Logic Test',
    });

    await page.waitForLoadState('networkidle');

    const regularPriceField = page.locator('#regularPrice');

    // Initially both unchecked - regular price should be visible
    await expect(regularPriceField).toBeVisible();

    // Check only hasDiscount - regular price should still be visible (only one condition true)
    await page.check('#hasDiscount input[type="checkbox"]');
    await page.waitForTimeout(500);
    await expect(regularPriceField).toBeVisible();

    // Check isPremiumMember too - now both conditions true, regular price should be hidden
    await page.check('#isPremiumMember input[type="checkbox"]');
    await page.waitForTimeout(500);
    await expect(regularPriceField).toBeHidden();

    // Uncheck hasDiscount - regular price should be visible again (only one condition true)
    await page.uncheck('#hasDiscount input[type="checkbox"]');
    await page.waitForTimeout(500);
    await expect(regularPriceField).toBeVisible();
  });

  test.skip('should make fields readonly using conditional logic', async ({ page }) => {
    const loader = new E2EScenarioLoader(page);

    const config = {
      fields: [
        {
          key: 'editMode',
          type: 'checkbox',
          label: 'Enable Edit Mode',
          col: 12,
        },
        {
          key: 'username',
          type: 'input',
          label: 'Username',
          value: 'existing_user',
          logic: [
            {
              type: 'readonly',
              condition: {
                type: 'javascript',
                expression: '!formValue.editMode',
              },
            },
          ],
          col: 12,
        },
        {
          key: 'submit',
          type: 'button',
          label: 'Submit',
          props: {
            type: 'submit',
            color: 'primary',
          },
          col: 12,
        },
      ],
    };

    await loader.loadScenario(config, {
      testId: 'readonly-logic-test',
      title: 'Readonly Logic Test',
    });

    await page.waitForLoadState('networkidle');

    // Behavior test: Initially editMode is unchecked, so readonly logic is active
    const usernameInput = page.locator('#username input');
    const initialValue = await usernameInput.inputValue();

    // Clear the field and try to type - the field should prevent modification when readonly
    await usernameInput.click();
    await usernameInput.fill('');
    await page.waitForTimeout(100);
    await usernameInput.type('modified_value');
    await page.waitForTimeout(200);
    const valueWhileReadonly = await usernameInput.inputValue();

    // The field should still have the initial value or be empty (readonly prevents typing)
    expect(valueWhileReadonly).toBe(initialValue);

    // Enable edit mode - readonly logic should no longer be active
    await page.check('#editMode input[type="checkbox"]');
    await page.waitForTimeout(500);

    // Now user should be able to edit the field
    await usernameInput.click();
    await usernameInput.fill('');
    await page.waitForTimeout(100);
    await usernameInput.type('new_username');
    await page.waitForTimeout(200);
    const finalValue = await usernameInput.inputValue();
    expect(finalValue).toBe('new_username'); // Value should change when not readonly
  });

  test('should apply OR conditional logic for multiple conditions', async ({ page }) => {
    const loader = new E2EScenarioLoader(page);

    const config = {
      fields: [
        {
          key: 'isStudent',
          type: 'checkbox',
          label: 'I am a student',
          col: 6,
        },
        {
          key: 'isSenior',
          type: 'checkbox',
          label: 'I am a senior (65+)',
          col: 6,
        },
        {
          key: 'discountInfo',
          type: 'input',
          label: 'Discount Information',
          value: 'You qualify for a discount!',
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'or',
                conditions: [
                  {
                    type: 'fieldValue',
                    fieldPath: 'isStudent',
                    operator: 'equals',
                    value: true,
                  },
                  {
                    type: 'fieldValue',
                    fieldPath: 'isSenior',
                    operator: 'equals',
                    value: true,
                  },
                ],
              },
            },
          ],
          col: 12,
        },
        {
          key: 'submit',
          type: 'button',
          label: 'Submit',
          props: {
            type: 'submit',
            color: 'primary',
          },
          col: 12,
        },
      ],
    };

    await loader.loadScenario(config, {
      testId: 'or-logic-test',
      title: 'OR Conditional Logic Test',
    });

    await page.waitForLoadState('networkidle');

    const discountInfoField = page.locator('#discountInfo');

    // Initially both unchecked - both conditions false, discount should be visible
    await expect(discountInfoField).toBeVisible();

    // Check isStudent - one condition becomes true, discount should be hidden (OR: at least one true)
    await page.check('#isStudent input[type="checkbox"]');
    await page.waitForTimeout(500);
    await expect(discountInfoField).toBeHidden();

    // Uncheck isStudent and check isSenior - still one condition true, discount should be hidden
    await page.uncheck('#isStudent input[type="checkbox"]');
    await page.waitForTimeout(500);
    await page.check('#isSenior input[type="checkbox"]');
    await page.waitForTimeout(500);
    await expect(discountInfoField).toBeHidden();

    // Check both - both conditions true, discount should be hidden
    await page.check('#isStudent input[type="checkbox"]');
    await page.waitForTimeout(500);
    await expect(discountInfoField).toBeHidden();

    // Uncheck both - back to both false, discount should be visible again
    await page.uncheck('#isStudent input[type="checkbox"]');
    await page.uncheck('#isSenior input[type="checkbox"]');
    await page.waitForTimeout(500);
    await expect(discountInfoField).toBeVisible();
  });

  test('should handle nested AND within OR conditions', async ({ page }) => {
    const loader = new E2EScenarioLoader(page);

    const config = {
      fields: [
        {
          key: 'isStudent',
          type: 'checkbox',
          label: 'I am a student',
          col: 6,
        },
        {
          key: 'isSenior',
          type: 'checkbox',
          label: 'I am a senior (65+)',
          col: 6,
        },
        {
          key: 'hasValidID',
          type: 'checkbox',
          label: 'I have a valid ID',
          col: 12,
        },
        {
          key: 'specialOffer',
          type: 'input',
          label: 'Special Offer Details',
          value: 'You qualify for our special discount program!',
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'or',
                conditions: [
                  {
                    type: 'and',
                    conditions: [
                      {
                        type: 'fieldValue',
                        fieldPath: 'isStudent',
                        operator: 'equals',
                        value: true,
                      },
                      {
                        type: 'fieldValue',
                        fieldPath: 'hasValidID',
                        operator: 'equals',
                        value: true,
                      },
                    ],
                  },
                  {
                    type: 'and',
                    conditions: [
                      {
                        type: 'fieldValue',
                        fieldPath: 'isSenior',
                        operator: 'equals',
                        value: true,
                      },
                      {
                        type: 'fieldValue',
                        fieldPath: 'hasValidID',
                        operator: 'equals',
                        value: true,
                      },
                    ],
                  },
                ],
              },
            },
          ],
          col: 12,
        },
        {
          key: 'submit',
          type: 'button',
          label: 'Submit',
          props: {
            type: 'submit',
            color: 'primary',
          },
          col: 12,
        },
      ],
    };

    await loader.loadScenario(config, {
      testId: 'nested-and-within-or-test',
      title: 'Nested AND within OR Test',
    });

    await page.waitForLoadState('networkidle');

    const specialOfferField = page.locator('#specialOffer');

    // Initially all unchecked - offer should be visible (no conditions met)
    await expect(specialOfferField).toBeVisible();

    // Check only isStudent - offer still visible (AND not satisfied: missing hasValidID)
    await page.check('#isStudent input[type="checkbox"]');
    await page.waitForTimeout(500);
    await expect(specialOfferField).toBeVisible();

    // Check hasValidID too - now (isStudent AND hasValidID) is true, offer should be hidden
    await page.check('#hasValidID input[type="checkbox"]');
    await page.waitForTimeout(500);
    await expect(specialOfferField).toBeHidden();

    // Uncheck isStudent but keep hasValidID - offer should be visible again
    await page.uncheck('#isStudent input[type="checkbox"]');
    await page.waitForTimeout(500);
    await expect(specialOfferField).toBeVisible();

    // Check isSenior - now (isSenior AND hasValidID) is true, offer should be hidden
    await page.check('#isSenior input[type="checkbox"]');
    await page.waitForTimeout(500);
    await expect(specialOfferField).toBeHidden();

    // Uncheck hasValidID - both AND conditions false, offer should be visible
    await page.uncheck('#hasValidID input[type="checkbox"]');
    await page.waitForTimeout(500);
    await expect(specialOfferField).toBeVisible();
  });

  test('should handle nested OR within AND conditions', async ({ page }) => {
    const loader = new E2EScenarioLoader(page);

    const config = {
      fields: [
        {
          key: 'isPaid',
          type: 'checkbox',
          label: 'I have a paid account',
          col: 6,
        },
        {
          key: 'isTrial',
          type: 'checkbox',
          label: 'I am on a trial',
          col: 6,
        },
        {
          key: 'isVerified',
          type: 'checkbox',
          label: 'My account is verified',
          col: 6,
        },
        {
          key: 'isAdmin',
          type: 'checkbox',
          label: 'I am an admin',
          col: 6,
        },
        {
          key: 'premiumFeatures',
          type: 'input',
          label: 'Premium Features',
          value: 'Access to all premium features!',
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'and',
                conditions: [
                  {
                    type: 'or',
                    conditions: [
                      {
                        type: 'fieldValue',
                        fieldPath: 'isPaid',
                        operator: 'equals',
                        value: true,
                      },
                      {
                        type: 'fieldValue',
                        fieldPath: 'isTrial',
                        operator: 'equals',
                        value: true,
                      },
                    ],
                  },
                  {
                    type: 'or',
                    conditions: [
                      {
                        type: 'fieldValue',
                        fieldPath: 'isVerified',
                        operator: 'equals',
                        value: true,
                      },
                      {
                        type: 'fieldValue',
                        fieldPath: 'isAdmin',
                        operator: 'equals',
                        value: true,
                      },
                    ],
                  },
                ],
              },
            },
          ],
          col: 12,
        },
        {
          key: 'submit',
          type: 'button',
          label: 'Submit',
          props: {
            type: 'submit',
            color: 'primary',
          },
          col: 12,
        },
      ],
    };

    await loader.loadScenario(config, {
      testId: 'nested-or-within-and-test',
      title: 'Nested OR within AND Test',
    });

    await page.waitForLoadState('networkidle');

    const premiumField = page.locator('#premiumFeatures');

    // Initially all unchecked - premium visible (AND not satisfied)
    await expect(premiumField).toBeVisible();

    // Check isPaid - first OR satisfied, but second OR not satisfied
    await page.check('#isPaid input[type="checkbox"]');
    await page.waitForTimeout(500);
    await expect(premiumField).toBeVisible();

    // Check isVerified - now both OR conditions true, AND satisfied, premium should be hidden
    await page.check('#isVerified input[type="checkbox"]');
    await page.waitForTimeout(500);
    await expect(premiumField).toBeHidden();

    // Uncheck isPaid but check isTrial - first OR still true via isTrial
    await page.uncheck('#isPaid input[type="checkbox"]');
    await page.waitForTimeout(500);
    await page.check('#isTrial input[type="checkbox"]');
    await page.waitForTimeout(500);
    await expect(premiumField).toBeHidden();

    // Uncheck isVerified but check isAdmin - second OR still true via isAdmin
    await page.uncheck('#isVerified input[type="checkbox"]');
    await page.waitForTimeout(500);
    await page.check('#isAdmin input[type="checkbox"]');
    await page.waitForTimeout(500);
    await expect(premiumField).toBeHidden();

    // Uncheck isTrial - first OR becomes false, AND not satisfied
    await page.uncheck('#isTrial input[type="checkbox"]');
    await page.waitForTimeout(500);
    await expect(premiumField).toBeVisible();
  });
});
