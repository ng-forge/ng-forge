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

  test('should make fields readonly using conditional logic', async ({ page }) => {
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

    // Initially unchecked - username should be readonly
    const usernameInput = page.locator('#username input');
    const isReadonly = await usernameInput.getAttribute('readonly');
    expect(isReadonly).not.toBeNull();

    // Check edit mode - username should become editable
    await page.check('#editMode input[type="checkbox"]');
    await page.waitForTimeout(500);

    const isStillReadonly = await usernameInput.getAttribute('readonly');
    expect(isStillReadonly).toBeNull();
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
});
