import { expect, test } from '@playwright/test';

test.describe('Expression-Based Logic Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4201/test/expression-based-logic');
  });

  test('should hide/show fields based on fieldValue condition', async ({ page }) => {
    const scenario = page.locator('[data-testid="hidden-logic-test"]');
    await expect(scenario).toBeVisible();

    // Select free - payment should be hidden
    await scenario.locator('#subscriptionType').click();
    await page.waitForTimeout(300);
    await page.locator('mat-option:has-text("Free")').click();
    await page.waitForTimeout(500);

    const paymentField = scenario.locator('#paymentMethod');
    await expect(paymentField).toBeHidden();

    // Select premium - payment should be visible
    await scenario.locator('#subscriptionType').click();
    await page.waitForTimeout(300);
    await page.locator('mat-option:has-text("Premium")').click();
    await page.waitForTimeout(500);

    await expect(paymentField).toBeVisible();
  });

  test('should disable fields using JavaScript expressions', async ({ page }) => {
    const scenario = page.locator('[data-testid="disabled-logic-test"]');
    await expect(scenario).toBeVisible();

    // Initially unchecked - vehicle type should be disabled
    const vehicleInput = scenario.locator('#vehicleType input');
    const isDisabled = await vehicleInput.isDisabled();
    expect(isDisabled).toBeTruthy();

    // Check the checkbox - vehicle type should be enabled
    await scenario.locator('#hasVehicle input[type="checkbox"]').check();
    await page.waitForTimeout(500);

    const isEnabled = await vehicleInput.isEnabled();
    expect(isEnabled).toBeTruthy();
  });

  test('should hide fields using AND conditional logic', async ({ page }) => {
    const scenario = page.locator('[data-testid="and-logic-test"]');
    await expect(scenario).toBeVisible();

    const regularPriceField = scenario.locator('#regularPrice');

    // Initially both unchecked - regular price should be visible
    await expect(regularPriceField).toBeVisible();

    // Check only hasDiscount - regular price should still be visible (only one condition true)
    await scenario.locator('#hasDiscount input[type="checkbox"]').check();
    await page.waitForTimeout(500);
    await expect(regularPriceField).toBeVisible();

    // Check isPremiumMember too - now both conditions true, regular price should be hidden
    await scenario.locator('#isPremiumMember input[type="checkbox"]').check();
    await page.waitForTimeout(500);
    await expect(regularPriceField).toBeHidden();

    // Uncheck hasDiscount - regular price should be visible again (only one condition true)
    await scenario.locator('#hasDiscount input[type="checkbox"]').uncheck();
    await page.waitForTimeout(500);
    await expect(regularPriceField).toBeVisible();
  });

  test.skip('should make fields readonly using conditional logic', async ({ page }) => {
    const scenario = page.locator('[data-testid="readonly-logic-test"]');
    await expect(scenario).toBeVisible();

    // Behavior test: Initially editMode is unchecked, so readonly logic is active
    const usernameInput = scenario.locator('#username input');
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
    await scenario.locator('#editMode input[type="checkbox"]').check();
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
    const scenario = page.locator('[data-testid="or-logic-test"]');
    await expect(scenario).toBeVisible();

    const discountInfoField = scenario.locator('#discountInfo');

    // Initially both unchecked - both conditions false, discount should be visible
    await expect(discountInfoField).toBeVisible();

    // Check isStudent - one condition becomes true, discount should be hidden (OR: at least one true)
    await scenario.locator('#isStudent input[type="checkbox"]').check();
    await page.waitForTimeout(500);
    await expect(discountInfoField).toBeHidden();

    // Uncheck isStudent and check isSenior - still one condition true, discount should be hidden
    await scenario.locator('#isStudent input[type="checkbox"]').uncheck();
    await page.waitForTimeout(500);
    await scenario.locator('#isSenior input[type="checkbox"]').check();
    await page.waitForTimeout(500);
    await expect(discountInfoField).toBeHidden();

    // Check both - both conditions true, discount should be hidden
    await scenario.locator('#isStudent input[type="checkbox"]').check();
    await page.waitForTimeout(500);
    await expect(discountInfoField).toBeHidden();

    // Uncheck both - back to both false, discount should be visible again
    await scenario.locator('#isStudent input[type="checkbox"]').uncheck();
    await scenario.locator('#isSenior input[type="checkbox"]').uncheck();
    await page.waitForTimeout(500);
    await expect(discountInfoField).toBeVisible();
  });

  test('should handle nested AND within OR conditions', async ({ page }) => {
    const scenario = page.locator('[data-testid="nested-and-within-or-test"]');
    await expect(scenario).toBeVisible();

    const specialOfferField = scenario.locator('#specialOffer');

    // Initially all unchecked - offer should be visible (no conditions met)
    await expect(specialOfferField).toBeVisible();

    // Check only isStudent - offer still visible (AND not satisfied: missing hasValidID)
    await scenario.locator('#isStudent input[type="checkbox"]').check();
    await page.waitForTimeout(500);
    await expect(specialOfferField).toBeVisible();

    // Check hasValidID too - now (isStudent AND hasValidID) is true, offer should be hidden
    await scenario.locator('#hasValidID input[type="checkbox"]').check();
    await page.waitForTimeout(500);
    await expect(specialOfferField).toBeHidden();

    // Uncheck isStudent but keep hasValidID - offer should be visible again
    await scenario.locator('#isStudent input[type="checkbox"]').uncheck();
    await page.waitForTimeout(500);
    await expect(specialOfferField).toBeVisible();

    // Check isSenior - now (isSenior AND hasValidID) is true, offer should be hidden
    await scenario.locator('#isSenior input[type="checkbox"]').check();
    await page.waitForTimeout(500);
    await expect(specialOfferField).toBeHidden();

    // Uncheck hasValidID - both AND conditions false, offer should be visible
    await scenario.locator('#hasValidID input[type="checkbox"]').uncheck();
    await page.waitForTimeout(500);
    await expect(specialOfferField).toBeVisible();
  });

  test('should handle nested OR within AND conditions', async ({ page }) => {
    const scenario = page.locator('[data-testid="nested-or-within-and-test"]');
    await expect(scenario).toBeVisible();

    const premiumField = scenario.locator('#premiumFeatures');

    // Initially all unchecked - premium visible (AND not satisfied)
    await expect(premiumField).toBeVisible();

    // Check isPaid - first OR satisfied, but second OR not satisfied
    await scenario.locator('#isPaid input[type="checkbox"]').check();
    await page.waitForTimeout(500);
    await expect(premiumField).toBeVisible();

    // Check isVerified - now both OR conditions true, AND satisfied, premium should be hidden
    await scenario.locator('#isVerified input[type="checkbox"]').check();
    await page.waitForTimeout(500);
    await expect(premiumField).toBeHidden();

    // Uncheck isPaid but check isTrial - first OR still true via isTrial
    await scenario.locator('#isPaid input[type="checkbox"]').uncheck();
    await page.waitForTimeout(500);
    await scenario.locator('#isTrial input[type="checkbox"]').check();
    await page.waitForTimeout(500);
    await expect(premiumField).toBeHidden();

    // Uncheck isVerified but check isAdmin - second OR still true via isAdmin
    await scenario.locator('#isVerified input[type="checkbox"]').uncheck();
    await page.waitForTimeout(500);
    await scenario.locator('#isAdmin input[type="checkbox"]').check();
    await page.waitForTimeout(500);
    await expect(premiumField).toBeHidden();

    // Uncheck isTrial - first OR becomes false, AND not satisfied
    await scenario.locator('#isTrial input[type="checkbox"]').uncheck();
    await page.waitForTimeout(500);
    await expect(premiumField).toBeVisible();
  });
});
